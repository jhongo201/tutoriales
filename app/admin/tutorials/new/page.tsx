import TutorialForm from '@/components/admin/TutorialForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewTutorialPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/tutorials"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft size={14} /> Volver a tutoriales
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Tutorial</h1>
        <p className="text-gray-500 text-sm">Agrega nuevo contenido al portal de capacitación</p>
      </div>
      <TutorialForm mode="create" />
    </div>
  )
}