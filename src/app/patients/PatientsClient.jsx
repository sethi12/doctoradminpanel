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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-teal-200 hover:text-white text-sm font-medium transition mb-3"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {filter === 'today' && "Today's Appointments"}
                {filter === 'new' && 'New Patient Registrations'}
                {filter === 'all' && 'All Patients & Bookings'}
              </h1>
              <p className="mt-2 text-teal-100/90 text-lg">
                {filter === 'today' && 'Scheduled visits for today'}
                {filter === 'new' && 'Patients visiting for the first time'}
                {filter === 'all' && 'Complete directory of all records'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl border border-white/20">
              {['all', 'today', 'new'].map((f) => (
                <Link
                  key={f}
                  href={`/patients?filter=${f}`}
                  className={`
                    px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                    ${
                      filter === f
                        ? 'bg-white text-teal-800 shadow-lg scale-105'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {f === 'all' ? 'All' : f === 'today' ? "Today" : 'New'}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            label="Total Records"
            value={patients.length}
            color="teal"
            icon="📋"
          />
          <StatCard
            label="Active Filter"
            value={filter.toUpperCase()}
            color="purple"
            icon="🔍"
          />
          <StatCard
            label="Last Updated"
            value={new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            color="amber"
            icon="🕒"
          />
        </div>

        {/* Main Table Section */}
        {loading ? (
          <LoadingSkeleton />
        ) : patients.length === 0 ? (
          <EmptyState />
        ) : (
          <PatientTable patients={patients} />
        )}
      </div>
    </div>
  )
}

/* ── Reusable Components ── */

function StatCard({ label, value, color = 'teal', icon }) {
  const colors = {
    teal: 'bg-teal-50 border-teal-100 text-teal-800',
    purple: 'bg-purple-50 border-purple-100 text-purple-800',
    amber: 'bg-amber-50 border-amber-100 text-amber-800',
  }

  return (
    <div className={`
      p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300
      ${colors[color]}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase opacity-70 tracking-wide">{label}</p>
          <p className="text-3xl font-extrabold mt-1.5">{value}</p>
        </div>
        <div className="text-4xl opacity-40">{icon}</div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <div className="h-6 w-48 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300 shadow-inner">
      <div className="text-6xl mb-6 opacity-40">📂</div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-3">
        No patient records found
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {`No ${useSearchParams().get('filter') || 'records'} match your current filter.`}
        <br />
        Try changing the filter or add a new appointment.
      </p>
    </div>
  )
}

function PatientTable({ patients }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-slate-50 to-gray-100">
            <tr>
              <Th>Patient</Th>
              <Th>Appointment</Th>
              <Th>Type</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {patients.map((p, index) => (
              <tr
                key={p.id}
                className="hover:bg-teal-50/50 transition-colors group"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <Avatar name={p.name} index={index} />
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">{p.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{p.date}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {p.time || '—'}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3.5 py-1.5 text-xs font-bold rounded-full tracking-wide
                      ${
                        p.patientType === 'New Patient'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                  >
                    {p.patientType}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  <Link
                    href={`/patients/${p.id}`}
                    className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium text-sm bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-all"
                  >
                    View Details
                    <span aria-hidden="true">→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th
      className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${className}`}
    >
      {children}
    </th>
  )
}

function Avatar({ name, index }) {
  const colors = [
    'bg-teal-100 text-teal-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ]

  const color = colors[index % colors.length]

  return (
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-lg shadow-sm ring-1 ring-offset-2 ${color}`}
    >
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}