import { Suspense } from 'react'
import TutorialCard from '@/components/public/TutorialCard'
import SearchBar from '@/components/public/SearchBar'
import FilterBar from '@/components/public/FilterBar'
import { GraduationCap } from 'lucide-react'
import { Tutorial } from '@/types'

interface PageProps {
  searchParams: {
    search?: string
    contentType?: string
    userProfile?: string
    operationType?: string
    page?: string
  }
}

async function getTutorials(searchParams: PageProps['searchParams']) {
  const params = new URLSearchParams()
  if (searchParams.search) params.set('search', searchParams.search)
  if (searchParams.contentType) params.set('contentType', searchParams.contentType)
  if (searchParams.userProfile) params.set('userProfile', searchParams.userProfile)
  if (searchParams.operationType) params.set('operationType', searchParams.operationType)
  if (searchParams.page) params.set('page', searchParams.page)
  params.set('limit', '20')

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/tutorials'
  const res = await fetch(`${baseUrl}/api/tutorials?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!res.ok) return { data: [], pagination: { total: 0 } }
  return res.json()
}

export default async function TutorialsPage({ searchParams }: PageProps) {
  const { data: tutorials, pagination } = await getTutorials(searchParams)

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <div className="bg-gradient-to-r from-public-header-from to-public-header-to text-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-xl">
            <GraduationCap size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tutoriales y Capacitación</h1>
            <p className="text-public-header-subtitle text-sm mt-1">
              Acceda a guías, videos y recursos de ayuda para el uso del Sistema SGRL
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>
      </div>

      {/* Grid de tutoriales */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {tutorials.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <GraduationCap size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No se encontraron tutoriales</p>
            <p className="text-sm">Intenta con otros filtros de búsqueda</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {pagination.total} tutorial{pagination.total !== 1 ? 'es' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tutorials.map((tutorial: Tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}