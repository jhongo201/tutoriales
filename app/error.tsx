'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg p-6">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Ocurrió un error</h1>
        <p className="text-sm text-gray-500 mt-2">Intenta nuevamente.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
