import { NextResponse } from 'next/server'

export async function POST() {
  const name = process.env.AUTH_COOKIE_NAME || 'admin_token'
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tutorials'

  const res = NextResponse.json({ ok: true })
  res.cookies.set(name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: basePath,
    maxAge: 0,
  })
  return res
}
