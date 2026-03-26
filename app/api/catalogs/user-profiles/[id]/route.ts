import { NextResponse } from 'next/server'
import { getDb, sql } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export const PUT = withAuth(async (req, { params }) => {
  try {
    const id = parseInt(params.id)
    const body = await req.json()
    const { code, label, display_order, active } = body

    const db = await getDb()
    await db.request()
      .input('id', sql.Int, id)
      .input('code', sql.NVarChar, code !== undefined ? String(code).trim() : null)
      .input('label', sql.NVarChar, label !== undefined ? String(label).trim() : null)
      .input('display_order', sql.Int, display_order !== undefined ? display_order : null)
      .input('active', sql.Bit, active !== undefined ? !!active : null)
      .query(`
        UPDATE tutorial_user_profiles SET
          code = COALESCE(@code, code),
          label = COALESCE(@label, label),
          display_order = COALESCE(@display_order, display_order),
          active = COALESCE(@active, active)
        WHERE id = @id
      `)

    return NextResponse.json({ message: 'Actualizado' })
  } catch (error) {
    console.error('Error PUT /api/catalogs/user-profiles/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
})

export const DELETE = withAuth(async (_req, { params }) => {
  try {
    const id = parseInt(params.id)
    const db = await getDb()

    const current = await db.request()
      .input('id', sql.Int, id)
      .query(`SELECT code FROM tutorial_user_profiles WHERE id = @id`)

    if (current.recordset.length === 0) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const code = current.recordset[0].code
    const used = await db.request()
      .input('code', sql.NVarChar, code)
      .query(`SELECT COUNT(*) AS total FROM tutorials WHERE user_profile = @code`)

    if ((used.recordset[0]?.total || 0) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: está en uso por tutoriales. Desactívalo en su lugar.' },
        { status: 409 }
      )
    }

    await db.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM tutorial_user_profiles WHERE id = @id`)

    return NextResponse.json({ message: 'Eliminado' })
  } catch (error) {
    console.error('Error DELETE /api/catalogs/user-profiles/[id]:', error)
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
  }
})
