'use client'
import { useEffect, useMemo, useState } from 'react'
import { PlusCircle, Save, Eye, EyeOff, Trash2 } from 'lucide-react'

type CatalogKey = 'content-types' | 'user-profiles' | 'operation-types'

type CatalogItem = {
  id: number
  code: string
  label: string
  active: boolean
  display_order: number
}

const TABS: { key: CatalogKey; label: string }[] = [
  { key: 'content-types', label: 'Tipos de Contenido' },
  { key: 'user-profiles', label: 'Perfiles' },
  { key: 'operation-types', label: 'Operaciones' },
]

export default function AdminCatalogsPage() {
  const [tab, setTab] = useState<CatalogKey>('content-types')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CatalogItem[]>([])
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<number | 'new' | null>(null)

  const emptyNew = useMemo<CatalogItem>(() => ({
    id: -1,
    code: '',
    label: '',
    active: true,
    display_order: 0,
  }), [])

  const [creating, setCreating] = useState(false)
  const [newItem, setNewItem] = useState<CatalogItem>(emptyNew)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/tutorials/api/catalogs/${tab}?includeInactive=1`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al cargar catálogo')
        setItems([])
        return
      }
      setItems(data.data || [])
    } catch {
      setError('Error de conexión')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (item: CatalogItem) => {
    const ok = window.confirm(`¿Eliminar "${item.label}"? Esta acción no se puede deshacer.`)
    if (!ok) return

    setSavingId(item.id)
    setError('')
    try {
      const res = await fetch(`/tutorials/api/catalogs/${tab}/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al eliminar')
        return
      }
      await load()
    } catch {
      setError('Error de conexión')
    } finally {
      setSavingId(null)
    }
  }

  useEffect(() => {
    load()
    setCreating(false)
    setNewItem(emptyNew)
  }, [tab])

  const updateField = (id: number, key: keyof CatalogItem, value: any) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)))
  }

  const saveItem = async (item: CatalogItem) => {
    setSavingId(item.id)
    setError('')
    try {
      const res = await fetch(`/tutorials/api/catalogs/${tab}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: item.code,
          label: item.label,
          display_order: item.display_order,
          active: item.active,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }
      await load()
    } catch {
      setError('Error de conexión')
    } finally {
      setSavingId(null)
    }
  }

  const createItem = async () => {
    setSavingId('new')
    setError('')
    try {
      const res = await fetch(`/tutorials/api/catalogs/${tab}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: newItem.code,
          label: newItem.label,
          display_order: newItem.display_order,
          active: newItem.active,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al crear')
        return
      }

      setCreating(false)
      setNewItem(emptyNew)
      await load()
    } catch {
      setError('Error de conexión')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
        <p className="text-gray-500 text-sm">Administración de listas desplegables</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  tab === t.key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-hover"
          >
            <PlusCircle size={16} /> Nuevo
          </button>
        </div>

        {error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : null}

        {creating ? (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                value={newItem.code}
                onChange={(e) => setNewItem((p) => ({ ...p, code: e.target.value }))}
                placeholder="Código"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                value={newItem.label}
                onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                placeholder="Etiqueta"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={newItem.display_order}
                onChange={(e) => setNewItem((p) => ({ ...p, display_order: Number(e.target.value) }))}
                placeholder="Orden"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setNewItem((p) => ({ ...p, active: !p.active }))}
                  className={`inline-flex items-center justify-center h-10 w-10 rounded-lg text-sm border ${
                    newItem.active ? 'border-green-200 text-green-700 bg-white' : 'border-gray-200 text-gray-600 bg-white'
                  }`}
                  title={newItem.active ? 'Activo' : 'Inactivo'}
                >
                  {newItem.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={createItem}
                  disabled={savingId === 'new'}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
                  title="Guardar"
                >
                  <Save size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Etiqueta</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Orden</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((it) => (
                <tr key={it.id} className={!it.active ? 'opacity-60' : ''}>
                  <td className="px-4 py-3">
                    <input
                      value={it.code}
                      onChange={(e) => updateField(it.id, 'code', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={it.label}
                      onChange={(e) => updateField(it.id, 'label', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={it.display_order}
                      onChange={(e) => updateField(it.id, 'display_order', Number(e.target.value))}
                      className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => updateField(it.id, 'active', !it.active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                        it.active
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'bg-gray-50 text-gray-600 border-gray-100'
                      }`}
                    >
                      {it.active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {it.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveItem(it)}
                        disabled={savingId === it.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-soft transition-colors disabled:opacity-60"
                        title="Guardar"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(it)}
                        disabled={savingId === it.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
