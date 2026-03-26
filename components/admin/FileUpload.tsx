'use client'
import { useEffect, useRef, useState } from 'react'
import { Upload, CheckCircle, XCircle, File } from 'lucide-react'

const ACCEPT: Record<string, string> = {
  video: 'video/mp4,video/webm,video/ogg',
  pdf: 'application/pdf',
  thumbnail: 'image/jpeg,image/png,image/webp,image/gif',
  infografia: 'image/jpeg,image/png,image/webp,image/gif',
}

const LABELS: Record<string, string> = {
  video: 'MP4 o WEBM (máx. 100MB)',
  pdf: 'PDF (máx. 100MB)',
  thumbnail: 'JPG/PNG/WEBP/GIF (máx. 100MB)',
  infografia: 'JPG/PNG/WEBP/GIF (máx. 100MB)',
}

interface FileUploadProps {
  fileType: 'video' | 'pdf' | 'thumbnail' | 'infografia'
  value?: string
  onUploaded: (url: string) => void
}

export default function FileUpload({ fileType, value, onUploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState(value || '')
  const [error, setError] = useState('')

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tutorials'

  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''

  const resolvedUrl = (() => {
    if (!uploadedUrl) return ''

    // If stored URL is absolute, keep it but normalize paths that ignore basePath.
    if (/^https?:\/\//i.test(uploadedUrl)) {
      if (origin && uploadedUrl.startsWith(`${origin}/tutorials-files/`)) {
        return `${origin}${basePath}${uploadedUrl.substring(origin.length)}`
      }
      if (origin && uploadedUrl.startsWith(`${origin}/uploads/`)) {
        return `${origin}${basePath}${uploadedUrl.substring(origin.length)}`
      }
      return uploadedUrl
    }

    // Relative paths
    if (uploadedUrl.startsWith('/tutorials-files/')) return `${basePath}${uploadedUrl}`
    if (uploadedUrl.startsWith('/uploads/')) return `${basePath}${uploadedUrl}`

    return uploadedUrl
  })()

  useEffect(() => {
    setUploadedUrl(value || '')
  }, [value])

  const handleFile = async (file: File) => {
    setError('')
    setUploading(true)
    setProgress(10)

    const token = localStorage.getItem('admin_token')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', fileType)

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90))
    }, 250)

    try {
      const res = await fetch(`${basePath}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      clearInterval(interval)
      setProgress(100)

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al subir el archivo')
        return
      }

      setUploadedUrl(data.url)
      onUploaded(data.url)
    } catch {
      setError('Error de conexión al subir el archivo')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {/* Zona de arrastre */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[fileType]}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
            <p className="text-sm text-blue-600">Subiendo archivo...</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : uploadedUrl ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Archivo cargado</span>
            <span className="text-xs text-gray-400">(clic para reemplazar)</span>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload size={24} className="mx-auto text-gray-400" />
            <p className="text-sm text-gray-600 font-medium">
              Arrastra el archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400">{LABELS[fileType]}</p>
          </div>
        )}
      </div>

      {/* Vista previa URL */}
      {uploadedUrl && !uploading && (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <File size={14} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-600 font-mono truncate flex-1">{uploadedUrl}</span>
          <button
            type="button"
            onClick={() => { setUploadedUrl(''); onUploaded('') }}
            className="text-gray-400 hover:text-red-500"
          >
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Preview imagen */}
      {(fileType === 'thumbnail' || fileType === 'infografia') && uploadedUrl && (
        <img
          src={resolvedUrl}
          alt="Preview"
          className="h-24 rounded-lg object-cover border border-gray-200"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}

      {/* Preview video */}
      {fileType === 'video' && uploadedUrl && (
        <video
          src={resolvedUrl}
          controls
          className="w-full max-h-40 rounded-lg border border-gray-200"
          preload="metadata"
        />
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <XCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}