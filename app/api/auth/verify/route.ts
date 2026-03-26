
import { NextRequest, NextResponse } from 'next/server'
import { getRequestToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getRequestToken(req)
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  return NextResponse.json({ valid: true, user: payload })
}

