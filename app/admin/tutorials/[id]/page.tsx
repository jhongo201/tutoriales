'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TutorialForm from '@/components/admin/TutorialForm'

export default function EditTutorialPage() {
  const { id } = useParams()
  const [tutorial, setTutorial] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/tutorials/api/tutorials/${id}?includeInactive=1`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setTutorial(data); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!tutorial || tutorial.error) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Tutorial no encontrado</p>
        <Link href="/admin/tutorials" className="text-primary text-sm mt-2 inline-block">
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/tutorials"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft size={14} /> Volver a tutoriales
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Tutorial</h1>
        <p className="text-gray-500 text-sm truncate max-w-xl">{tutorial.title}</p>
      </div>
      <TutorialForm mode="edit" initial={tutorial} tutorialId={Number(id)} />
    </div>
  )
}