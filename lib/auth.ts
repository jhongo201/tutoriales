import ldap from 'ldapjs'
import jwt from 'jsonwebtoken'
import { getDb, sql } from './db'
import type { NextRequest } from 'next/server'

export interface AdminUser {
  username: string
  displayName: string
  email: string
  groups: string[]
}

export interface JWTPayload {
  username: string
  displayName: string
  email: string
  iat?: number
  exp?: number
}

// ─── Autenticación contra Active Directory ───────────────────
export async function authenticateWithAD(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const domain = process.env.AD_DOMAIN!
  const server = process.env.AD_SERVER!
  const port = parseInt(process.env.AD_PORT || '389')
  const baseDN = process.env.AD_BASE_DN!
  const adminGroup = process.env.AD_ADMIN_GROUP || ''
  const timeout = parseInt(process.env.AD_TIMEOUT || '10000')
  const connectTimeout = parseInt(process.env.AD_CONNECT_TIMEOUT || String(timeout))
  const retryCount = Math.max(1, parseInt(process.env.AD_RETRY_COUNT || '1'))

  const normalizeLdapUrl = () => {
    const trimmed = (server || '').trim()
    const withScheme = trimmed.includes('://') ? trimmed : `ldap://${trimmed}`
    try {
      const u = new URL(withScheme)
      if (u.port) return u.toString()
      u.port = String(port)
      return u.toString()
    } catch {
      return `${withScheme}:${port}`
    }
  }

  const buildBindIdentity = () => {
    const u = username.trim()
    if (u.includes('\\') || u.includes('@')) return u
    const d = (domain || '').trim()
    if (!d) return u
    if (d.includes('.')) return `${u}@${d}`
    return `${d}\\${u}`
  }

  const attempt = () =>
    new Promise<AdminUser | null>((resolve) => {
      const client = ldap.createClient({
        url: normalizeLdapUrl(),
        timeout,
        connectTimeout,
      })

      client.on('error', (err) => {
        console.error('Error LDAP:', err.message)
        client.destroy()
        resolve(null)
      })

      const bindIdentity = buildBindIdentity()

      client.bind(bindIdentity, password, async (bindErr) => {
        if (bindErr) {
          console.error('Error de autenticación LDAP:', bindErr.message)
          client.destroy()
          resolve(null)
          return
        }

        const searchOptions: ldap.SearchOptions = {
          filter: `(sAMAccountName=${username})`,
          scope: 'sub',
          attributes: ['displayName', 'mail', 'memberOf', 'sAMAccountName'],
        }

        client.search(baseDN, searchOptions, (searchErr, searchRes) => {
          if (searchErr) {
            client.destroy()
            resolve(null)
            return
          }

          let userInfo: AdminUser | null = null

          searchRes.on('searchEntry', (entry) => {
            const anyEntry = entry as any
            const attrs: any[] = anyEntry?.attributes || anyEntry?.pojo?.attributes || []

            const pickValues = (attr: any): any[] => {
              if (!attr) return []
              if (Array.isArray(attr.values)) return attr.values
              if (Array.isArray(attr.vals)) return attr.vals
              return []
            }

            const getAttr = (name: string) =>
              pickValues(attrs.find((a: any) => a.type === name))[0] || anyEntry?.object?.[name] || ''
            const getAttrAll = (name: string) =>
              pickValues(attrs.find((a: any) => a.type === name)) ||
              (Array.isArray(anyEntry?.object?.[name]) ? anyEntry.object[name] : [])

            const groups: string[] = getAttrAll('memberOf').map((dn: string) => {
              const match = dn.match(/CN=([^,]+)/)
              return match ? match[1] : dn
            })

            if (adminGroup && !groups.includes(adminGroup)) {
              console.warn(`Usuario ${username} no pertenece al grupo ${adminGroup}`)
              return
            }

            userInfo = {
              username: getAttr('sAMAccountName') || username,
              displayName: getAttr('displayName') || username,
              email: getAttr('mail') || '',
              groups,
            }
          })

          searchRes.on('end', () => {
            client.destroy()
            resolve(userInfo)
          })

          searchRes.on('error', () => {
            client.destroy()
            resolve(null)
          })
        })
      })
    })

  for (let i = 0; i < retryCount; i++) {
    const user = await attempt()
    if (user) return user
  }

  return null
}

// ─── Fallback: usuario local en BD ───────────────────────────
export async function authenticateLocalUser(
  username: string
): Promise<AdminUser | null> {
  try {
    const db = await getDb()
    const result = await db
      .request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT username, display_name, email
        FROM tutorial_admins
        WHERE username = @username AND active = 1
      `)

    if (result.recordset.length === 0) return null

    const user = result.recordset[0]
    return {
      username: user.username,
      displayName: user.display_name,
      email: user.email,
      groups: ['LOCAL_ADMIN'],
    }
  } catch (error) {
    console.error('Error consultando usuario local:', error)
    return null
  }
}

// ─── Generar JWT ──────────────────────────────────────────────
export function generateToken(user: AdminUser): string {
  const payload: JWTPayload = {
    username: user.username,
    displayName: user.displayName,
    email: user.email,
  }
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  } as jwt.SignOptions)
}

// ─── Verificar JWT ────────────────────────────────────────────
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

// ─── Extraer token del header Authorization ───────────────────
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.substring(7)
}

export function extractTokenFromCookie(req: NextRequest): string | null {
  const name = process.env.AUTH_COOKIE_NAME || 'admin_token'
  const value = req.cookies.get(name)?.value
  return value || null
}

export function getRequestToken(req: NextRequest): string | null {
  return extractTokenFromCookie(req) || extractToken(req.headers.get('Authorization'))
}