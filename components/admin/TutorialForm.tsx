'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from './FileUpload'
import { Save, X } from 'lucide-react'

type CatalogItem = { id: number; code: string; label: string; active: boolean; display_order: number }

interface TutorialFormProps {
  initial?: any
  mode: 'create' | 'edit'
  tutorialId?: number
}

export default function TutorialForm({ initial, mode, tutorialId }: TutorialFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [contentTypes, setContentTypes] = useState<CatalogItem[]>([])
  const [userProfiles, setUserProfiles] = useState<CatalogItem[]>([])
  const [operationTypes, setOperationTypes] = useState<CatalogItem[]>([])

  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    content_type: initial?.content_type || 'VIDEO_TUTORIAL',
    user_profile: initial?.user_profile || 'TODOS',
    operation_type: initial?.operation_type || '',
    resource_url: initial?.resource_url || '',
    thumbnail_url: initial?.thumbnail_url || '',
    display_order: initial?.display_order || 0,
    active: initial?.active !== undefined ? initial.active : true,
  })

  const set = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  useEffect(() => {
    const loadCatalog = async (path: string, setter: (items: CatalogItem[]) => void) => {
      try {
        const res = await fetch(`/tutorials/api/catalogs/${path}?includeInactive=1`, { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) return
        setter(Array.isArray(data.data) ? data.data : [])
      } catch {
        // ignore
      }
    }

    loadCatalog('content-types', setContentTypes)
    loadCatalog('user-profiles', setUserProfiles)
    loadCatalog('operation-types', setOperationTypes)
  }, [])

  // Tipo de archivo para el uploader según content_type
  const resourceFileType =
    form.content_type === 'VIDEO_TUTORIAL' ? 'video' :
    form.content_type === 'MANUAL_PDF' ? 'pdf' :
    form.content_type === 'INFOGRAFIA' ? 'infografia' : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = mode === 'create'
      ? '/tutorials/api/tutorials'
      : `/tutorials/api/tutorials/${tutorialId}`

    try {
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }

      setSuccess(mode === 'create' ? 'Tutorial creado exitosamente' : 'Tutorial actualizado')
      setTimeout(() => router.push('/admin/tutorials'), 1200)
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Información básica */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3">
          Información del tutorial
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de contenido
            </label>
            <select
              value={form.content_type}
              onChange={(e) => set('content_type', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {contentTypes.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perfil
            </label>
            <select
              value={form.user_profile}
              onChange={(e) => set('user_profile', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {userProfiles.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operación
            </label>
            <select
              value={form.operation_type}
              onChange={(e) => set('operation_type', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">(Sin operación)</option>
              {operationTypes.map((op) => (
                <option key={op.code} value={op.code}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Orden de visualización
            </label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => set('display_order', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={!!form.active}
            onChange={(e) => set('active', e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="active" className="text-sm text-gray-700">
            Activo
          </label>
        </div>
      </div>

      {/* Recursos */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3">
          Recursos
        </h2>

        {resourceFileType ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo
            </label>
            <FileUpload
              fileType={resourceFileType as any}
              value={form.resource_url}
              onUploaded={(url) => set('resource_url', url)}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del recurso
            </label>
            <input
              type="text"
              value={form.resource_url}
              onChange={(e) => set('resource_url', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Miniatura
          </label>
          <FileUpload
            fileType="thumbnail"
            value={form.thumbnail_url}
            onUploaded={(url) => set('thumbnail_url', url)}
          />
        </div>
      </div>

      {(error || success) && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push('/admin/tutorials')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
        >
          <X size={16} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm hover:bg-blue-800 disabled:opacity-60"
        >
          {saving ? (
            <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}