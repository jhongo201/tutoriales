'use client'
import { useState } from 'react'
import { Download, ExternalLink } from 'lucide-react'

interface PdfViewerProps {
  url: string
  title: string
  onDownload?: () => void
}

export default function PdfViewer({ url, title, onDownload }: PdfViewerProps) {
  const [useEmbed, setUseEmbed] = useState(true)

  return (
    <div className="w-full">
      {/* Barra de herramientas */}
      <div className="flex items-center justify-between bg-gray-100 rounded-t-xl px-4 py-2 border border-b-0 border-gray-200">
        <span className="text-sm text-gray-600 font-medium truncate">{title}</span>
        <div className="flex gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1"
          >
            <ExternalLink size={12} /> Abrir en nueva pestaña
          </a>
          <a
            href={url}
            download
            onClick={onDownload}
            className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-hover"
          >
            <Download size={12} /> Descargar
          </a>
        </div>
      </div>

      {/* Visor PDF */}
      {useEmbed ? (
        <div className="w-full h-[75vh] border border-gray-200 rounded-b-xl overflow-hidden">
          <object
            data={`${url}#toolbar=1&navpanes=1`}
            type="application/pdf"
            className="w-full h-full"
            onError={() => setUseEmbed(false)}
          >
            <iframe
              src={`${url}#toolbar=1`}
              className="w-full h-full"
              title={title}
              onError={() => setUseEmbed(false)}
            />
          </object>
        </div>
      ) : (
        <div className="w-full h-64 border border-gray-200 rounded-b-xl flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <p className="mb-3">Tu navegador no puede mostrar el PDF inline.</p>
            <a
              href={url}
              download
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm"
            >
              Descargar PDF
            </a>
          </div>
        </div>
      )}
    </div>
  )
}