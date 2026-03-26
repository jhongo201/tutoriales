import { NextRequest, NextResponse } from 'next/server'
import { getDb, sql } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { getRequestToken, verifyToken } from '@/lib/auth'

// GET — Detalle + registrar vista
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const includeInactive = searchParams.get('includeInactive') === '1'

    if (includeInactive) {
      const token = getRequestToken(req)
      if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    const id = parseInt(params.id)
    const db = await getDb()

    const result = await db.request()
      .input('id', sql.BigInt, id)
      .query(`
        SELECT id, title, description, content_type, user_profile,
               operation_type, resource_url, thumbnail_url,
               display_order, active, view_count, download_count,
               created_at, updated_at, created_by
        FROM tutorials
        WHERE id = @id ${includeInactive ? '' : 'AND active = 1'}
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Tutorial no encontrado' }, { status: 404 })
    }

    if (!includeInactive) {
      // Registrar log de acceso
      const ip = req.headers.get('x-forwarded-for') ||
                 req.headers.get('x-real-ip') || 'unknown'
      const userAgent = req.headers.get('user-agent') || ''

      await db.request()
        .input('tutorial_id', sql.BigInt, id)
        .input('ip_address', sql.NVarChar, ip.split(',')[0].trim())
        .input('user_agent', sql.NVarChar, userAgent.substring(0, 500))
        .input('action_type', sql.NVarChar, 'VIEW')
        .query(`
          INSERT INTO tutorial_access_logs (tutorial_id, ip_address, user_agent, action_type)
          VALUES (@tutorial_id, @ip_address, @user_agent, @action_type);

          UPDATE tutorials SET view_count = view_count + 1, updated_at = GETDATE()
          WHERE id = @tutorial_id
        `)
    }

    return NextResponse.json(result.recordset[0])
  } catch (error) {
    console.error('Error GET /api/tutorials/[id]:', error)
    return NextResponse.json({ error: 'Error al obtener tutorial' }, { status: 500 })
  }
}

// PUT — Editar tutorial (protegido)
export const PUT = withAuth(async (req, { params }, user) => {
  try {
    const id = parseInt(params.id)
    const body = await req.json()
    const {
      title, description, content_type, user_profile,
      operation_type, resource_url, thumbnail_url,
      display_order, active,
    } = body

    const db = await getDb()
    await db.request()
      .input('id', sql.BigInt, id)
      .input('title', sql.NVarChar, title !== undefined ? title : null)
      .input('description', sql.NVarChar, description !== undefined ? (description || null) : null)
      .input('content_type', sql.NVarChar, content_type !== undefined ? content_type : null)
      .input('user_profile', sql.NVarChar, user_profile !== undefined ? (user_profile || 'TODOS') : null)
      .input('operation_type', sql.NVarChar, operation_type !== undefined ? (operation_type || null) : null)
      .input('resource_url', sql.NVarChar, resource_url !== undefined ? (resource_url || null) : null)
      .input('thumbnail_url', sql.NVarChar, thumbnail_url !== undefined ? (thumbnail_url || null) : null)
      .input('display_order', sql.Int, display_order !== undefined ? display_order : null)
      .input('active', sql.Bit, active !== undefined ? active : null)
      .input('updated_by', sql.NVarChar, user.username)
      .query(`
        UPDATE tutorials SET
          title = COALESCE(@title, title),
          description = COALESCE(@description, description),
          content_type = COALESCE(@content_type, content_type),
          user_profile = COALESCE(@user_profile, user_profile),
          operation_type = COALESCE(@operation_type, operation_type),
          resource_url = COALESCE(@resource_url, resource_url),
          thumbnail_url = COALESCE(@thumbnail_url, thumbnail_url),
          display_order = COALESCE(@display_order, display_order),
          active = COALESCE(@active, active),
          updated_at = GETDATE(), updated_by = @updated_by
        WHERE id = @id
      `)

    return NextResponse.json({ message: 'Tutorial actualizado exitosamente' })
  } catch (error) {
    console.error('Error PUT /api/tutorials/[id]:', error)
    return NextResponse.json({ error: 'Error al actualizar tutorial' }, { status: 500 })
  }
})

// DELETE — Desactivar (soft delete, protegido)
export const DELETE = withAuth(async (req, { params }, user) => {
  try {
    const id = parseInt(params.id)
    const db = await getDb()

    await db.request()
      .input('id', sql.BigInt, id)
      .input('updated_by', sql.NVarChar, user.username)
      .query(`
        UPDATE tutorials
        SET active = 0, updated_at = GETDATE(), updated_by = @updated_by
        WHERE id = @id
      `)

    return NextResponse.json({ message: 'Tutorial desactivado exitosamente' })
  } catch (error) {
    console.error('Error DELETE /api/tutorials/[id]:', error)
    return NextResponse.json({ error: 'Error al desactivar tutorial' }, { status: 500 })
  }
})