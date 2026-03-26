'use client'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="text-sm text-gray-500 mt-2">La ruta solicitada no existe.</p>
        <a
          href="/tutorials"
          className="inline-block mt-4 text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
