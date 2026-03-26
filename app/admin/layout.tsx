'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/tutorials'
  const normalizedPathname = pathname?.startsWith(basePath)
    ? pathname.substring(basePath.length) || '/'
    : pathname
  const loginPath = `${basePath}/admin/login`

  useEffect(() => {
    if (normalizedPathname === '/admin/login') {
      setLoading(false)
      return
    }
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    if (!token || !userData) {
      router.push(loginPath)
    } else {
      setUser(JSON.parse(userData))
      setLoading(false)
    }
  }, [normalizedPathname, loginPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (normalizedPathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar user={user} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}