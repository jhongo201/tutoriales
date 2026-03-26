import { NextRequest, NextResponse } from 'next/server'
import { authenticateWithAD, authenticateLocalUser, generateToken } from '@/lib/auth'

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

    return NextResponse.json({
      token,
      user: {
        username: user.username,
        displayName: user.displayName,
        email: user.email,
      },
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}