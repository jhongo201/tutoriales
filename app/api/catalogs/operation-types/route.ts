import { NextRequest, NextResponse } from 'next/server'
import { getDb, sql } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { getRequestToken, verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get('includeInactive') === '1'

    if (includeInactive) {
      const token = getRequestToken(req)
      if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    const db = await getDb()
    const result = await db.request().query(`
      SELECT id, code, label, active, display_order
      FROM tutorial_operation_types
      ${includeInactive ? '' : 'WHERE active = 1'}
      ORDER BY display_order ASC, label ASC
    `)

    return NextResponse.json({ data: result.recordset })
  } catch (error) {
    console.error('Error GET /api/catalogs/operation-types:', error)
    return NextResponse.json({ error: 'Error al obtener catálogo' }, { status: 500 })
  }
}

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json()
    const { code, label, display_order, active } = body

    if (!code || !label) {
      return NextResponse.json({ error: 'code y label son requeridos' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.request()
      .input('code', sql.NVarChar, String(code).trim())
      .input('label', sql.NVarChar, String(label).trim())
      .input('display_order', sql.Int, display_order ?? 0)
      .input('active', sql.Bit, active !== undefined ? !!active : true)
      .query(`
        INSERT INTO tutorial_operation_types (code, label, display_order, active)
        OUTPUT INSERTED.id
        VALUES (@code, @label, @display_order, @active)
      `)

    return NextResponse.json({ id: result.recordset[0].id }, { status: 201 })
  } catch (error) {
    console.error('Error POST /api/catalogs/operation-types:', error)
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 })
  }
})
