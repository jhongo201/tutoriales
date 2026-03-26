
import Link from 'next/link'

export default async function TutorialDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/tutorials'
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tutorials'

  const res = await fetch(`${baseUrl}/api/tutorials/${params.id}`, {
    cache: 'no-store',
  })

  const data = res.ok ? await res.json() : null

  if (!data || data.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900">Tutorial no encontrado</h1>
          <p className="text-sm text-gray-500 mt-2">El recurso solicitado no existe o no está disponible.</p>
          <Link href="/tutorials" className="inline-block mt-4 text-sm font-medium text-blue-700 hover:text-blue-800">
            Volver
          </Link>
        </div>
      </div>
    )
  }

  const resourceUrl = typeof data.resource_url === 'string' ? data.resource_url : ''
  const thumbnailUrl = typeof data.thumbnail_url === 'string' ? data.thumbnail_url : ''

  const normalizeUrl = (url: string) => {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url)
        if (parsed.pathname.startsWith('/tutorials-files/') || parsed.pathname.startsWith('/uploads/')) {
          if (!parsed.pathname.startsWith(`${basePath}/`)) {
            parsed.pathname = `${basePath}${parsed.pathname}`
          }
        }
        return parsed.toString()
      } catch {
        return url
      }
    }

    if (url.startsWith('/tutorials-files/') || url.startsWith('/uploads/')) return `${basePath}${url}`
    return url
  }

  const normalizedResourceUrl = normalizeUrl(resourceUrl)
  const normalizedThumbnailUrl = normalizeUrl(thumbnailUrl)

  const lowerUrl = normalizedResourceUrl.toLowerCase()
  const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/i.test(normalizedResourceUrl)
  const isVideo = data.content_type === 'VIDEO_TUTORIAL' || /\.(mp4|webm|ogg)(\?|#|$)/i.test(lowerUrl)
  const isPdf = data.content_type === 'MANUAL_PDF' || /\.(pdf)(\?|#|$)/i.test(lowerUrl)
  const isImage = data.content_type === 'INFOGRAFIA' || /\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(lowerUrl)

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '')
        return id ? `https://www.youtube.com/embed/${id}` : ''
      }
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : ''
    } catch {
      return ''
    }
  }

  const youtubeEmbedUrl = isYoutube ? getYoutubeEmbedUrl(normalizedResourceUrl) : ''

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-gradient-to-r from-public-detail-header-from to-public-detail-header-to text-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <Link href="/tutorials" className="text-sm text-public-detail-overlay/80 hover:text-public-detail-overlay">
              Volver
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">{data.title}</h1>
            {data.description ? (
              <p className="text-public-detail-overlay/90 mt-3 whitespace-pre-line">{data.description}</p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {data.user_profile ? (
                <span className="text-xs px-3 py-1.5 rounded-full bg-public-detail-overlay/15 border border-public-detail-overlay/20">
                  {data.user_profile}
                </span>
              ) : null}
              {data.operation_type ? (
                <span className="text-xs px-3 py-1.5 rounded-full bg-public-detail-overlay/15 border border-public-detail-overlay/20">
                  {data.operation_type}
                </span>
              ) : null}
              {data.content_type ? (
                <span className="text-xs px-3 py-1.5 rounded-full bg-public-detail-overlay/15 border border-public-detail-overlay/20">
                  {data.content_type}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {normalizedResourceUrl ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-800">Recurso</p>
              <div className="flex items-center gap-2">
                {isPdf ? (
                  <a
                    href={normalizedResourceUrl}
                    className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    download
                  >
                    Descargar
                  </a>
                ) : null}
                <a
                  href={normalizedResourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  Abrir en pestaña
                </a>
              </div>
            </div>

            <div className="bg-gray-950">
              {youtubeEmbedUrl ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={data.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : isVideo ? (
                <div className="aspect-video w-full">
                  <video
                    src={normalizedResourceUrl}
                    controls
                    preload="metadata"
                    poster={normalizedThumbnailUrl || undefined}
                    className="w-full h-full"
                  />
                </div>
              ) : isPdf ? (
                <div className="w-full" style={{ height: '75vh' }}>
                  <iframe
                    src={normalizedResourceUrl}
                    title={data.title}
                    className="w-full h-full bg-white"
                  />
                </div>
              ) : isImage ? (
                <div className="w-full bg-white">
                  <img
                    src={normalizedResourceUrl}
                    alt={data.title}
                    className="w-full max-h-[75vh] object-contain bg-white"
                  />
                </div>
              ) : (
                <div className="p-6 bg-white">
                  <p className="text-sm text-gray-600">Este recurso no se puede previsualizar directamente.</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

