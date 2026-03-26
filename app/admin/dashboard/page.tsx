'use client'
import { useEffect, useState } from 'react'
import { Eye, Download, BookOpen, TrendingUp } from 'lucide-react'

interface Stats {
  totals: {
    total_tutorials: number
    total_views: number
    total_downloads: number
    active_tutorials: number
  }
  byType: { content_type: string; count: number; views: number }[]
  topViewed: { id: number; title: string; content_type: string; view_count: number }[]
  recentLogs: { id: number; title: string; access_date: string; ip_address: string; action_type: string }[]
  dailyViews: { day: string; views: number; downloads: number }[]
}

const TYPE_LABELS: Record<string, string> = {
  VIDEO_TUTORIAL: 'Video Tutorial',
  MANUAL_PDF: 'Manual PDF',
  FAQ: 'Preguntas Frecuentes',
  INFOGRAFIA: 'Infografía',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    fetch('/tutorials/api/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!stats) return <p className="text-red-500">Error al cargar estadísticas</p>

  const { totals, byType, topViewed, recentLogs } = stats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Resumen de actividad del módulo de tutoriales</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Tutoriales activos" value={totals.active_tutorials} color="blue" />
        <StatCard icon={Eye} label="Total vistas" value={totals.total_views} color="green" />
        <StatCard icon={Download} label="Total descargas" value={totals.total_downloads} color="purple" />
        <StatCard icon={TrendingUp} label="Total contenidos" value={totals.total_tutorials} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por tipo de contenido */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Contenido por tipo</h2>
          <div className="space-y-3">
            {byType.map((item) => (
              <div key={item.content_type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{TYPE_LABELS[item.content_type] || item.content_type}</span>
                  <span className="font-medium text-gray-800">{item.count} — {item.views} vistas</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((item.views / (totals.total_views || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 más vistos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">Top 5 más vistos</h2>
          <div className="space-y-3">
            {topViewed.map((item, i) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="text-lg font-black text-blue-200 w-6 shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-400">
                    {TYPE_LABELS[item.content_type]} · {item.view_count} vistas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos recientes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-bold text-gray-800 mb-4">Accesos recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 text-xs">
                <th className="pb-2 font-medium">Tutorial</th>
                <th className="pb-2 font-medium">Acción</th>
                <th className="pb-2 font-medium">IP</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 max-w-xs truncate text-gray-800">{log.title}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      log.action_type === 'DOWNLOAD'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.action_type === 'DOWNLOAD' ? 'Descarga' : 'Vista'}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{log.ip_address}</td>
                  <td className="py-2 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(log.access_date).toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: any; label: string; value: number; color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('es-CO')}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}