'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, ListVideo,
  PlusCircle, LogOut, User, SlidersHorizontal,
} from 'lucide-react'
import clsx from 'clsx'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tutorials', label: 'Tutoriales', icon: ListVideo },
  { href: '/admin/tutorials/new', label: 'Nuevo Tutorial', icon: PlusCircle },
  { href: '/admin/catalogs', label: 'Catálogos', icon: SlidersHorizontal },
]

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const router = useRouter()

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tutorials'
  const normalizedPathname = pathname?.startsWith(basePath)
    ? pathname.substring(basePath.length) || '/'
    : pathname

  const logout = () => {
    fetch(`${basePath}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      router.push('/admin/login')
    })
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Tutoriales</p>
            <p className="text-slate-400 text-xs">Panel Admin — SGRL</p>
          </div>
        </div>
      </div>

      {/* Usuario activo */}
      {user && (
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-full p-1.5">
              <User size={12} />
            </div>
            <div>
              <p className="text-xs font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user.username}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              normalizedPathname === href
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Ver portal público */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <a
          href={basePath}
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <GraduationCap size={16} />
          Ver portal público
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}