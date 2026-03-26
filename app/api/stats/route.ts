import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async (_req) => {
  try {
    const db = await getDb()

    const [totals, byType, topViewed, recentLogs, dailyViews] = await Promise.all([
      // Totales generales
      db.request().query(`
        SELECT
          COUNT(*) AS total_tutorials,
          SUM(view_count) AS total_views,
          SUM(download_count) AS total_downloads,
          SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active_tutorials
        FROM tutorials
      `),

      // Por tipo de contenido
      db.request().query(`
        SELECT content_type, COUNT(*) AS count, SUM(view_count) AS views
        FROM tutorials WHERE active = 1
        GROUP BY content_type ORDER BY views DESC
      `),

      // Top 5 más vistos
      db.request().query(`
        SELECT TOP 5 id, title, content_type, view_count, download_count
        FROM tutorials WHERE active = 1
        ORDER BY view_count DESC
      `),

      // Últimos 20 accesos
      db.request().query(`
        SELECT TOP 20
          l.id, l.tutorial_id, t.title, l.access_date,
          l.ip_address, l.action_type
        FROM tutorial_access_logs l
        INNER JOIN tutorials t ON l.tutorial_id = t.id
        ORDER BY l.access_date DESC
      `),

      // Vistas por día (últimos 30 días)
      db.request().query(`
        SELECT
          CAST(access_date AS DATE) AS day,
          COUNT(*) AS views,
          SUM(CASE WHEN action_type = 'DOWNLOAD' THEN 1 ELSE 0 END) AS downloads
        FROM tutorial_access_logs
        WHERE access_date >= DATEADD(DAY, -30, GETDATE())
        GROUP BY CAST(access_date AS DATE)
        ORDER BY day ASC
      `),
    ])

    return NextResponse.json({
      totals: totals.recordset[0],
      byType: byType.recordset,
      topViewed: topViewed.recordset,
      recentLogs: recentLogs.recordset,
      dailyViews: dailyViews.recordset,
    })
  } catch (error) {
    console.error('Error GET /api/stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
})