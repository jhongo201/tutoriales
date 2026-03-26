'use client'
import { Eye, Download } from 'lucide-react'
import Link from 'next/link'
import { Tutorial } from '@/types'

const CONTENT_TYPE_CONFIG: Record<string, {
  label: string
  badgeClass: string
  bgClass: string
  icon: string
  actionLabel: string
  actionIcon: string
}> = {
  VIDEO_TUTORIAL: {
    label: 'VIDEO TUTORIAL',
    badgeClass: 'bg-primary',
    bgClass: 'bg-gradient-to-br from-public-video-from via-public-video-via to-public-video-to',
    icon: '▶',
    actionLabel: 'Ver Video',
    actionIcon: '▶',
  },
  MANUAL_PDF: {
    label: 'MANUAL PDF',
    badgeClass: 'bg-primary',
    bgClass: 'bg-gradient-to-br from-public-pdf-from via-public-pdf-via to-public-pdf-to',
    icon: '📄',
    actionLabel: 'Descargar PDF',
    actionIcon: '⬇',
  },
  FAQ: {
    label: 'PREGUNTA FRECUENTE',
    badgeClass: 'bg-primary',
    bgClass: 'bg-gradient-to-br from-public-faq-from via-public-faq-via to-public-faq-to',
    icon: '❓',
    actionLabel: 'Ver Preguntas',
    actionIcon: '?',
  },
  INFOGRAFIA: {
    label: 'INFOGRAFÍA',
    badgeClass: 'bg-primary',
    bgClass: 'bg-gradient-to-br from-public-infografia-from via-public-infografia-via to-public-infografia-to',
    icon: '📊',
    actionLabel: 'Ver Infografía',
    actionIcon: '📊',
  },
}

const PROFILE_COLORS: Record<string, string> = {
  AGENTE: 'bg-badge-agente',
  AGENCIA: 'bg-badge-agencia',
  CORREDOR: 'bg-badge-corredor',
  TODOS: 'bg-badge-todos',
}

const PROFILE_LABELS: Record<string, string> = {
  AGENTE: 'Agente de Seguros',
  AGENCIA: 'Agencia de Seguros',
  CORREDOR: 'Corredor de Seguros',
  TODOS: 'Todos los Perfiles',
}

interface TutorialCardProps {
  tutorial: Tutorial
}

export default function TutorialCard({ tutorial }: TutorialCardProps) {
  const config = CONTENT_TYPE_CONFIG[tutorial.content_type] || CONTENT_TYPE_CONFIG.FAQ
  const profileColor = PROFILE_COLORS[tutorial.user_profile] || 'bg-primary'
  const profileLabel = PROFILE_LABELS[tutorial.user_profile] || tutorial.user_profile

  const operationTags = tutorial.operation_type
    ? tutorial.operation_type.split(',').map((t) => t.trim())
    : []

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Thumbnail */}
      <Link href={`/tutorials/${tutorial.id}`} className="block relative group">
        <div className={`${config.bgClass} h-44 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer`}>
          {/* Animated background particles effect */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white opacity-30"
                style={{
                  width: `${20 + i * 15}px`,
                  height: `${20 + i * 15}px`,
                  top: `${10 + i * 12}%`,
                  left: `${5 + i * 16}%`,
                  filter: 'blur(8px)',
                }}
              />
            ))}
          </div>

          {/* Badge tipo */}
          <span className={`absolute top-3 right-3 ${config.badgeClass} text-white text-xs font-bold px-2 py-1 rounded-full`}>
            {config.label}
          </span>

          {/* Icono central */}
          <ThumbnailIcon contentType={tutorial.content_type} />

          {/* Texto acción */}
          <span className="text-white font-black text-lg mt-2 tracking-wider drop-shadow-lg">
            {tutorial.content_type === 'VIDEO_TUTORIAL' ? 'VER VIDEO' :
             tutorial.content_type === 'MANUAL_PDF' ? 'VER DOCUMENTO' :
             tutorial.content_type === 'FAQ' ? 'PREGUNTAS FRECUENTES' : 'VER INFOGRAFÍA'}
          </span>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
      </Link>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
          {tutorial.title}
        </h3>

        {tutorial.description && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{tutorial.description}</p>
        )}

        {/* Tags de perfil y operación */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 ${profileColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}>
            <span>👤</span> {profileLabel}
          </span>
          {operationTags.map((tag) => (
            <span key={tag} className="inline-flex items-center border border-gray-300 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Contadores */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {tutorial.view_count}
          </span>
          {tutorial.download_count > 0 && (
            <span className="flex items-center gap-1">
              <Download size={12} /> {tutorial.download_count}
            </span>
          )}
        </div>

        {/* Botón acción */}
        <div className="mt-auto">
          <Link
            href={`/tutorials/${tutorial.id}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs">{config.actionIcon}</span>
            {config.actionLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

function ThumbnailIcon({ contentType }: { contentType: string }) {
  if (contentType === 'VIDEO_TUTORIAL') {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gray-800 bg-opacity-60 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
        <div className="w-0 h-0 border-t-8 border-b-8 border-l-14 border-transparent border-l-white ml-1" style={{ borderLeftWidth: 20, borderLeftColor: 'white' }} />
      </div>
    )
  }
  if (contentType === 'MANUAL_PDF') {
    return (
      <div className="w-16 h-16 rounded-2xl bg-purple-800 bg-opacity-60 border-2 border-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
        <span className="text-2xl">📄</span>
      </div>
    )
  }
  if (contentType === 'FAQ') {
    return (
      <div className="w-16 h-16 rounded-2xl bg-cyan-900 bg-opacity-60 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
        <span className="text-2xl font-black text-white">FAQ</span>
      </div>
    )
  }
  return (
    <div className="w-16 h-16 rounded-2xl bg-green-900 bg-opacity-60 border-2 border-green-400 flex items-center justify-center shadow-lg shadow-green-500/30">
      <span className="text-2xl">📊</span>
    </div>
  )
}