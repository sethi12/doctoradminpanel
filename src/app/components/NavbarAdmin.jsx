'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NavbarAdmin() {
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('adminLoggedIn')
    router.push('/admin/login')
  }

  return (
    <nav className="bg-teal-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              Naraina Dental Admin
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <Link href="/admin/appointments" className="hover:text-teal-200 transition">
              Appointments
            </Link>
            <Link href="/admin/admins" className="hover:text-teal-200 transition">
              Manage Admins
            </Link>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}