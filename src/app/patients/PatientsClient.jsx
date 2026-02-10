'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { db } from '../lib/firebase'
import { ref, onValue } from 'firebase/database'

export default function PatientsClient() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'all'

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bookingsRef = ref(db, 'bookings')

    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val()
      let all = data
        ? Object.entries(data).map(([id, val]) => ({ id, ...val }))
        : []

      all.sort((a, b) => new Date(b.date) - new Date(a.date))

      const todayStr = new Date().toISOString().split('T')[0]

      if (filter === 'today') {
        all = all.filter(b => b.date === todayStr)
      } else if (filter === 'new') {
        all = all.filter(b => b.patientType === 'New Patient')
      }

      setPatients(all)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [filter])

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/" className="text-teal-600 text-xs font-medium">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-black mt-1">
              {filter === 'today' && "Today's Schedule"}
              {filter === 'new' && 'New Registrations'}
              {filter === 'all' && 'Patient Directory'}
            </h1>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['all', 'today', 'new'].map((f) => (
              <Link
                key={f}
                href={`/patients?filter=${f}`}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                  filter === f
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {f.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <p className="text-center text-slate-400">No records found.</p>
        ) : (
          <pre className="bg-white p-4 rounded-xl">
            {JSON.stringify(patients, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
