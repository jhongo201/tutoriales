'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const PROFILES = [
  { value: '', label: 'Todos los perfiles' },
  { value: 'AGENTE', label: 'Agente de Seguros' },
  { value: 'AGENCIA', label: 'Agencia de Seguros' },
  { value: 'CORREDOR', label: 'Corredor de Seguros' },
]

const CONTENT_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'VIDEO_TUTORIAL', label: 'Video Tutorial' },
  { value: 'MANUAL_PDF', label: 'Documento PDF' },
  { value: 'FAQ', label: 'Preguntas Frecuentes' },
  { value: 'INFOGRAFIA', label: 'Infografía' },
]

const OPERATION_TYPES = [
  { value: '', label: 'Todas las operaciones' },
  { value: 'REGISTRO', label: 'Registro' },
  { value: 'ACTIVACION', label: 'Activación' },
  { value: 'AUTENTICACION', label: 'Autenticación' },
  { value: 'RECUPERACION', label: 'Recuperación' },
  { value: 'RENOVACION', label: 'Renovación' },
  { value: 'ACTUALIZACION', label: 'Actualización de Datos' },
  { value: 'CONSULTA', label: 'Consulta de Estado' },
]

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/tutorials?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <FilterSelect
        label="Perfil de usuario"
        icon="👤"
        options={PROFILES}
        value={searchParams.get('userProfile') || ''}
        onChange={(v) => update('userProfile', v)}
      />
      <FilterSelect
        label="Tipo de contenido"
        icon="🎯"
        options={CONTENT_TYPES}
        value={searchParams.get('contentType') || ''}
        onChange={(v) => update('contentType', v)}
      />
      <FilterSelect
        label="Tipo de operación"
        icon="⚙️"
        options={OPERATION_TYPES}
        value={searchParams.get('operationType') || ''}
        onChange={(v) => update('operationType', v)}
      />
    </div>
  )
}

function FilterSelect({
  label, icon, options, value, onChange,
}: {
  label: string
  icon: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative min-w-[200px]">
      <label className="absolute -top-2 left-3 text-xs text-gray-500 bg-white px-1">
        {label}
      </label>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
        <span className="mr-2 text-sm">{icon}</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}