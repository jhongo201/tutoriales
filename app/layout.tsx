import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tutoriales y Capacitación — SGRL Ministerio del Trabajo',
  description: 'Acceda a guías, videos y recursos de ayuda para el uso del Sistema SGRL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}