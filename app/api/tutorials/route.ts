import { NextRequest, NextResponse } from 'next/server'
import { getDb, sql } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { getRequestToken, verifyToken } from '@/lib/auth'

// GET — Lista pública con filtros
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const contentType = searchParams.get('contentType') || ''
    const userProfile = searchParams.get('userProfile') || ''
    const operationType = searchParams.get('operationType') || ''
    const includeInactive = searchParams.get('includeInactive') === '1'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (includeInactive) {
      const token = getRequestToken(req)
      if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    const db = await getDb()
    const request = db.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)

    let whereClause = includeInactive ? 'WHERE 1=1' : 'WHERE active = 1'

    if (search) {
      whereClause += ` AND (title LIKE @search OR description LIKE @search)`
      request.input('search', sql.NVarChar, `%${search}%`)
    }
    if (contentType) {
      whereClause += ` AND content_type = @contentType`
      request.input('contentType', sql.NVarChar, contentType)
    }
    if (userProfile) {
      whereClause += ` AND (user_profile = @userProfile OR user_profile = 'TODOS')`
      request.input('userProfile', sql.NVarChar, userProfile)
    }
    if (operationType) {
      whereClause += ` AND operation_type = @operationType`
      request.input('operationType', sql.NVarChar, operationType)
    }

    const countResult = await request.query(
      `SELECT COUNT(*) as total FROM tutorials ${whereClause}`
    )
    const total = countResult.recordset[0].total

    const result = await request.query(`
      SELECT id, title, description, content_type, user_profile,
             operation_type, resource_url, thumbnail_url,
             display_order, active, view_count, download_count, created_at
      FROM tutorials
      ${whereClause}
      ORDER BY display_order ASC, created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `)

    return NextResponse.json({
      data: result.recordset,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error GET /api/tutorials:', error)
    return NextResponse.json({ error: 'Error al obtener tutoriales' }, { status: 500 })
  }
}

// POST — Crear tutorial (protegido)
export const POST = withAuth(async (req, _ctx, user) => {
  try {
    const body = await req.json()
    const {
      title, description, content_type, user_profile,
      operation_type, resource_url, thumbnail_url, display_order,
    } = body

    if (!title || !content_type) {
      return NextResponse.json(
        { error: 'Título y tipo de contenido son requeridos' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || null)
      .input('content_type', sql.NVarChar, content_type)
      .input('user_profile', sql.NVarChar, user_profile || 'TODOS')
      .input('operation_type', sql.NVarChar, operation_type || null)
      .input('resource_url', sql.NVarChar, resource_url || null)
      .input('thumbnail_url', sql.NVarChar, thumbnail_url || null)
      .input('display_order', sql.Int, display_order || 0)
      .input('created_by', sql.NVarChar, user.username)
      .input('updated_by', sql.NVarChar, user.username)
      .query(`
        INSERT INTO tutorials
          (title, description, content_type, user_profile, operation_type,
           resource_url, thumbnail_url, display_order, active,
           view_count, download_count, created_at, updated_at, created_by, updated_by)
        OUTPUT INSERTED.id
        VALUES
          (@title, @description, @content_type, @user_profile, @operation_type,
           @resource_url, @thumbnail_url, @display_order, 1,
           0, 0, GETDATE(), GETDATE(), @created_by, @updated_by)
      `)

    return NextResponse.json(
      { id: result.recordset[0].id, message: 'Tutorial creado exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error POST /api/tutorials:', error)
    return NextResponse.json({ error: 'Error al crear tutorial' }, { status: 500 })
  }
})