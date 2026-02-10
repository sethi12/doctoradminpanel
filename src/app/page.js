'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from './lib/firebase'
import { ref, onValue } from 'firebase/database'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ today: 0, total: 0, newPatients: 0 })
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bookingsRef = ref(db, 'bookings')
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val()
      const allBookings = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []
      
      // Sort appointments by date (newest first)
      const sorted = allBookings.sort((a, b) => new Date(b.date) - new Date(a.date))
      setAppointments(sorted.slice(0, 5)) // Get latest 5

      const todayStr = new Date().toISOString().split('T')[0]
      setStats({
        today: allBookings.filter(b => b.date === todayStr).length,
        total: allBookings.length,
        newPatients: allBookings.filter(b => b.patientType === 'New Patient').length
      })
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Sidebar Nav (Desktop) / Top Nav (Mobile) */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
            <span className="font-bold text-lg tracking-tight">Naraina Dental <span className="text-teal-600">Admin</span></span>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live System
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Good morning! Here is what's happening in your clinic today.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Today's Bookings" value={stats.today} icon="🗓️" trend="+12%" color="teal"  href="/patients?filter=today"/>
          <StatCard title="Total Patients" value={stats.total} icon="👥" trend="+5%" color="indigo"   href="/patients?filter=all"/>
          <StatCard title="New Cases" value={stats.newPatients} icon="✨" trend="New" color="purple"   href="/patients?filter=new"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Table Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 text-lg">Recent Appointments</h2>
                <Link href="/appointments" className="text-sm font-semibold text-teal-600 hover:text-teal-700">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Patient</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Service</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                       <tr><td colSpan="4" className="p-10 text-center text-slate-400">Loading appointments...</td></tr>
                    ) : appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700">{apt.patientName}</div>
                          <div className="text-xs text-slate-500">{apt.patientType}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{apt.service || 'General Checkup'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{apt.date}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-100">Confirmed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
              <p className="text-slate-400 text-sm mb-6">Common tasks and management tools.</p>
              <div className="space-y-3">
                <QuickActionButton icon="➕" label="New Appointment" href="/appointments?add=new" primary />
                <QuickActionButton icon="📋" label="Patient Records" href="/patients" />
                {/* <QuickActionButton icon="⚙️" label="Settings" href="/settings" /> */}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Clinic Health</h3>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Daily Goal</span>
                        <span>{Math.round((stats.today / 10) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(stats.today / 10) * 100}%` }}></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, trend, color,href }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  }
  return (
        <Link href={href} className="group">
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]} border`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">{trend}</span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
    </Link>
  )
}

function QuickActionButton({ icon, label, href, primary = false }) {
  return (
    <Link href={href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
      primary 
      ? 'bg-teal-500 hover:bg-teal-400 text-white' 
      : 'bg-white/10 hover:bg-white/20 text-white'
    }`}>
      <span>{icon}</span>
      {label}
    </Link>
  )
}