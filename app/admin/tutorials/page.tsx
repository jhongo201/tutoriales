'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Pencil, Eye, EyeOff, Search, Trash2 } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  VIDEO_TUTORIAL: 'Video',
  MANUAL_PDF: 'PDF',
  FAQ: 'FAQ',
  INFOGRAFIA: 'Infografía',
}

const TYPE_COLORS: Record<string, string> = {
  VIDEO_TUTORIAL: 'bg-blue-100 text-blue-700',
  MANUAL_PDF: 'bg-purple-100 text-purple-700',
  FAQ: 'bg-cyan-100 text-cyan-700',
  INFOGRAFIA: 'bg-green-100 text-green-700',
}

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<number | null>(null)
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const limit = 20
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null)

  const loadTutorials = async (targetPage = page) => {
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(targetPage),
      includeInactive: '1',
    })
    if (search) params.set('search', search)
    const res = await fetch(`/tutorials/api/tutorials?${params}`, { credentials: 'include' })
    const data = await res.json()
    // Admin también ve inactivos — llamada separada con token
    setTutorials(data.data || [])
    setPagination(data.pagination || null)
    setLoading(false)
  }

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    loadTutorials(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  const toggleActive = async (id: number, current: boolean) => {
    setToggling(id)
    await fetch(`/tutorials/api/tutorials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ active: !current }),
    })
    await loadTutorials(page)
    setToggling(null)
  }

  const deleteTutorial = async (id: number) => {
    setToggling(id)
    await fetch(`/tutorials/api/tutorials/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    await loadTutorials(page)

    // If we deleted the last item on the page, go back one page (if possible)
    if (page > 1 && tutorials.length === 1) {
      setPage((p) => Math.max(1, p - 1))
    }

    setToggling(null)
  }

  return (
    <div className="space-y-6">
      {confirmDeactivateId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDeactivateId(null)}
          />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-lg border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900">Desactivar tutorial</h3>
            <p className="text-sm text-gray-600 mt-2">
              ¿Deseas desactivar este tutorial? Ya no será visible en el portal público.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeactivateId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confirmDeactivateId
                  setConfirmDeactivateId(null)
                  await toggleActive(id, true)
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-lg border border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900">Eliminar tutorial</h3>
            <p className="text-sm text-gray-600 mt-2">
              ¿Deseas eliminar este tutorial? Se desactivará y dejará de estar disponible en el portal público.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = confirmDeleteId
                  setConfirmDeleteId(null)
                  await deleteTutorial(id)
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutoriales</h1>
          <p className="text-gray-500 text-sm">Gestión del contenido publicado</p>
        </div>
        <Link
          href="/admin/tutorials/new"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          <PlusCircle size={16} /> Nuevo Tutorial
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Buscar tutoriales..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Perfil</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vistas</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tutorials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No hay tutoriales registrados
                  </td>
                </tr>
              ) : (
                tutorials.map((t) => (
                  <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${!t.active ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{t.title}</p>
                      {t.operation_type && (
                        <p className="text-xs text-gray-400 mt-0.5">{t.operation_type}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[t.content_type] || 'bg-gray-100 text-gray-600'}`}>
                        {TYPE_LABELS[t.content_type] || t.content_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{t.user_profile}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{t.view_count}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (toggling === t.id) return
                          if (t.active) {
                            setConfirmDeactivateId(t.id)
                            return
                          }
                          void toggleActive(t.id, false)
                        }}
                        disabled={toggling === t.id}
                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          t.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        } ${toggling === t.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={t.active ? 'Desactivar' : 'Activar'}
                      >
                        {t.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/tutorials/${t.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => {
                            if (toggling === t.id) return
                            setConfirmDeleteId(t.id)
                          }}
                          disabled={toggling === t.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (toggling === t.id) return
                            if (t.active) {
                              setConfirmDeactivateId(t.id)
                              return
                            }
                            void toggleActive(t.id, false)
                          }}
                          disabled={toggling === t.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            t.active
                              ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={t.active ? 'Desactivar' : 'Activar'}
                        >
                          {toggling === t.id ? (
                            <span className="animate-spin inline-block h-3.5 w-3.5 border-b border-current rounded-full" />
                          ) : t.active ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Página {pagination.page} de {pagination.pages} — {pagination.total} registro{pagination.total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => (pagination ? Math.min(pagination.pages, p + 1) : p + 1))}
              disabled={!!pagination && page >= pagination.pages || loading}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}