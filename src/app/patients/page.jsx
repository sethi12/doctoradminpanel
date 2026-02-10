'use client'


import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { db } from '../lib/firebase'
import { ref, onValue } from 'firebase/database'
import Link from 'next/link'

export default function PatientsPage() {
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-teal-600 hover:text-teal-700 font-medium text-xs"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-2xl font-black mt-1">
              {filter === 'today' && "Today's Schedule"}
              {filter === 'new' && 'New Registrations'}
              {filter === 'all' && 'Patient Directory'}
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['all', 'today', 'new'].map((f) => (
              <Link
                key={f}
                href={`/patients?filter=${f}`}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Stat label="Total Records" value={patients.length} />
          <Stat label="Status View" value={filter} teal />
          <Stat label="Active Filter" value="Applied" dark />
        </div>

        {loading ? (
          <Loader />
        ) : patients.length === 0 ? (
          <Empty />
        ) : (
          <Table patients={patients} />
        )}
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function Stat({ label, value, teal, dark }) {
  return (
    <div
      className={`p-5 rounded-2xl ${
        dark
          ? 'bg-slate-900 text-white'
          : teal
          ? 'bg-teal-50 border border-teal-100'
          : 'bg-white border'
      }`}
    >
      <p className="text-xs font-bold uppercase opacity-70">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}

function Loader() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
    </div>
  )
}

function Empty() {
  return (
    <div className="bg-white rounded-3xl p-20 text-center border border-dashed">
      <p className="text-slate-400 font-medium">No patient records found.</p>
    </div>
  )
}

function Table({ patients }) {
  return (
    <div className="bg-white rounded-3xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b">
          <tr>
            <Th>Patient</Th>
            <Th>Appointment</Th>
            <Th>Type</Th>
            <Th align="right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-t hover:bg-teal-50/30">
              <td className="px-6 py-4 flex items-center gap-3">
                <Avatar name={p.name} />
                <div>
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.phone}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold">{p.date}</p>
                <p className="text-xs text-slate-400">{p.time || 'N/A'}</p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 text-[10px] font-black rounded-full ${
                    p.patientType === 'New Patient'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {p.patientType}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/patients/${p.id}`}
                  className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, align }) {
  return (
    <th
      className={`px-6 py-4 text-[10px] font-black uppercase text-slate-400 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

function Avatar({ name }) {
  return (
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
      {name?.charAt(0) || '?'}
    </div>
  )
}
