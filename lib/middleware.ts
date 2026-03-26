import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getRequestToken } from './auth'
import { buildRateLimitHeaders, checkRateLimit, getClientIp } from './rateLimit'

export function withAuth(
  handler: (req: NextRequest, context: any, user: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: any) => {
    const token = getRequestToken(req)

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    const method = (req.method || 'GET').toUpperCase()
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      const ip = getClientIp(req)
      const mutateLimit = Math.max(1, parseInt(process.env.RATE_LIMIT_MUTATION_LIMIT || '60'))
      const mutateWindowMs = Math.max(1, parseInt(process.env.RATE_LIMIT_MUTATION_WINDOW_MS || String(5 * 60 * 1000)))

      const rate = checkRateLimit({
        key: `mut:${ip}:${String(user.username || '').trim().toLowerCase()}`,
        limit: mutateLimit,
        windowMs: mutateWindowMs,
      })

      if (!rate.ok) {
        return NextResponse.json(
          { error: 'Demasiadas solicitudes. Intente más tarde.' },
          { status: 429, headers: buildRateLimitHeaders(rate) }
        )
      }

      const res = await handler(req, context, user)
      const headers = buildRateLimitHeaders(rate)
      Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
      return res
    }

    return handler(req, context, user)
  }
}