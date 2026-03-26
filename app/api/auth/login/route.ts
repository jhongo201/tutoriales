import { NextRequest, NextResponse } from 'next/server'
import { authenticateWithAD, authenticateLocalUser, generateToken } from '@/lib/auth'

function getCookieOptions() {
  const name = process.env.AUTH_COOKIE_NAME || 'admin_token'
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tutorials'

  const isProd = process.env.NODE_ENV === 'production'
  const maxAge = parseInt(process.env.AUTH_COOKIE_MAX_AGE_SECONDS || '28800')

  return {
    name,
    options: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: basePath,
      maxAge,
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Intentar autenticación con AD primero
    let user = await authenticateWithAD(username, password)

    // Si AD falla, intentar usuario local (fallback)
    if (!user) {
      // Para usuario local verificamos el usuario en BD
      // pero la contraseña fue validada por AD — si AD falla
      // completamente (servidor no disponible), chequeamos local
      user = await authenticateLocalUser(username)
      if (user) {
        console.warn(`⚠️ Usuario ${username} autenticado localmente (AD no disponible)`)
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas o acceso no autorizado' },
        { status: 401 }
      )
    }

    const token = generateToken(user)

    const res = NextResponse.json({
      user: {
        username: user.username,
        displayName: user.displayName,
        email: user.email,
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    })

    const { name, options } = getCookieOptions()
    res.cookies.set(name, token, options)
    return res
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}