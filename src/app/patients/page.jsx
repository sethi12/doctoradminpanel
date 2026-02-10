'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { db } from '../lib/firebase'
import { ref, onValue } from 'firebase/database'
import Link from 'next/link'

export default function PatientsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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

      // Sort by date (newest first)
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
      {/* Top Navigation / Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/appointments" className="text-teal-600 hover:text-teal-700 font-medium text-xs">
                ← Back to List
              </Link>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {filter === 'today' && "Today's Schedule"}
              {filter === 'new' && 'New Registrations'}
              {filter === 'all' && 'Patient Directory'}
            </h1>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['all', 'today', 'new'].map((f) => (
              <button
                key={f}
                onClick={() => router.push(`/patients?filter=${f}`)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f 
                    ? 'bg-white text-teal-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Records</p>
            <p className="text-2xl font-black text-slate-900">{patients.length}</p>
          </div>
          <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 shadow-sm">
            <p className="text-xs font-bold text-teal-600 uppercase">Status View</p>
            <p className="text-2xl font-black text-teal-900 capitalize">{filter}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl shadow-lg shadow-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Filter</p>
            <p className="text-2xl font-black text-white">Applied</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">No patient records found for this category.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="group hover:bg-teal-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                          {p.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700">{p.date}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{p.time || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        p.patientType === 'New Patient' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {p.patientType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1 rounded-lg transition-colors"
                      onClick={() => router.push(`/patients/${p.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}