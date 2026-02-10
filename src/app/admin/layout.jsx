'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NavbarAdmin from '../components/NavbarAdmin'

export default function AdminLayout({ children }) {
  const router = useRouter()


  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAdmin />
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}