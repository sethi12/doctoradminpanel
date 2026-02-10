'use client'

import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { ref, onValue, remove, push, set } from 'firebase/database'
import Link from 'next/link'
import BookingForm from '../components/BookingForm' // Ensure this path is correct

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newBooking, setNewBooking] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const appointmentsRef = ref(db, 'bookings')
    const unsubscribe = onValue(appointmentsRef, (snapshot) => {
      const data = snapshot.val()
      const loaded = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })) : []
      setAppointments(loaded.sort((a, b) => new Date(b.date) - new Date(a.date)))
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // This function now receives the data directly from the BookingForm component
  const handleAddAppointment = async (formData) => {
    try {
      const newRef = push(ref(db, 'bookings'))
      await set(newRef, { 
        ...formData, 
        createdAt: new Date().toISOString() 
      })
      setShowForm(false) 
      // Optional: Success notification logic here
    } catch (err) {
      alert('Error adding appointment')
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this record?')) {
      await remove(ref(db, `bookings/${id}`))
    }
  }

  const filteredAppointments = appointments.filter(apt => 
    apt.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    apt.phone?.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium text-sm">← Back to Dashboard</Link>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Patient Appointments</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search name or phone..."
                  className="w-full pl-10  text-black pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-teal-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 flex items-center gap-2"
              >
                {showForm ? '✕ Close' : '＋ Add New'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Add Form Side Panel - Now using BookingForm component */}
          {showForm && (
            <BookingForm 
              onSubmit={handleAddAppointment} 
              onClose={() => setShowForm(false)} 
              setShowModal={setShowModal}
              setNewBooking={setNewBooking}
            />
          )}

          {/* List Section */}
          <div className={`flex-1 order-2 lg:order-1 ${loading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
                <span className="text-5xl block mb-4">📂</span>
                <p className="text-slate-500 font-medium">No appointments matching your criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAppointments.map((apt) => (
                  <div key={apt.id} className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${apt.patientType === 'New Patient' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {apt.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{apt.name}</h3>
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                          <span>📞 {apt.phone}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className={apt.patientType === 'New Patient' ? 'text-purple-600' : 'text-blue-600'}>{apt.patientType}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:gap-8">
                      <div className="bg-slate-50 px-4 py-2 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Schedule</p>
                        <p className="text-sm font-bold text-slate-700">{apt.date} at {apt.time}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Treatment</p>
                        <p className="text-sm font-semibold text-slate-700">{apt.treatment}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(apt.id)}
                        className="ml-auto p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}