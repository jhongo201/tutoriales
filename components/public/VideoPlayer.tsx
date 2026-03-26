'use client'
import { useRef, useState } from 'react'

interface VideoPlayerProps {
  url: string
  title: string
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState(false)

  // Si la URL es de YouTube, usar embed
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be')

  if (isYoutube) {
    const videoId = url.includes('youtu.be')
      ? url.split('/').pop()?.split('?')[0]
      : new URLSearchParams(new URL(url).search).get('v')

    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xl">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  // Video local MP4
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-xl bg-black">
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-lg mb-2">⚠️ No se pudo cargar el video</p>
            <a href={url} download className="underline text-blue-300 text-sm">
              Descargar video
            </a>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          className="w-full h-full"
          onError={() => setError(true)}
          preload="metadata"
        >
          <source src={url} type="video/mp4" />
          <source src={url} type="video/webm" />
          Tu navegador no soporta la reproducción de video.
        </video>
      )}
    </div>
  )
}