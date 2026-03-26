import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getRequestToken } from './auth'

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

    return handler(req, context, user)
  }
}