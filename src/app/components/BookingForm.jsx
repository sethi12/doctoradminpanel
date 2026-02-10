'use client'

import { useState, useEffect } from 'react'
import SlotSelector from './SlotSelector'
import { treatments } from '../constants/treatments'
import { db } from '../lib/firebase'
import { ref, onValue, push, set, get, query, orderByChild, equalTo } from 'firebase/database'

export default function BookingForm({ setShowModal, setNewBooking, onClose }) {
  const [bookings, setBookings] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [treatment, setTreatment] = useState('')
  const [patientType, setPatientType] = useState('new')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const bookingsRef = ref(db, 'bookings')
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val()
      const loadedBookings = data ? Object.values(data) : []
      setBookings(loadedBookings)
    }, (error) => {
      console.error('Firebase listener error:', error)
      setFormError('Unable to load available slots.')
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    if (!name.trim() || !phone.trim() || !treatment || !patientType || !selectedDate || !selectedTime) {
      setFormError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const dateQuery = query(ref(db, 'bookings'), orderByChild('date'), equalTo(selectedDate))
      const snapshot = await get(dateQuery)
      let slotTaken = false

      if (snapshot.exists()) {
        const existingBookings = Object.values(snapshot.val())
        slotTaken = existingBookings.some(b => b.time === selectedTime)
      }

      if (slotTaken) {
        setFormError('This slot was just taken.')
        setLoading(false)
        return
      }

      const newBookingData = {
        createdAt: new Date().toISOString(),
        date: selectedDate,
        time: selectedTime,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        treatment,
        patientType: patientType === 'new' ? 'New Patient' : 'Existing Patient'
      }

      const newBookingRef = push(ref(db, 'bookings'))
      await set(newBookingRef, newBookingData)

      setNewBooking(newBookingData)
      setShowModal(true)

      // Reset
      setName(''); setPhone(''); setEmail(''); setTreatment('');
      setPatientType('new'); setSelectedDate(''); setSelectedTime('');
    } catch (err) {
      setFormError('Failed to book appointment.')
      console.error('Booking error:', err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full lg:w-[400px] order-1 lg:order-2">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl shadow-teal-900/5 sticky top-24 overflow-hidden">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg">Quick Registration</h2>
            <p className="text-teal-50 text-[10px] font-medium uppercase tracking-wider">Add New Appointment</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-teal-100 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Patient Info Group */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-slate-900 font-medium placeholder-transparent"
                placeholder="Name"
                required
              />
              <label className="absolute left-4 top-3 text-slate-400 text-sm transition-all peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-teal-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-teal-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                Full Name *
              </label>
            </div>

            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="peer w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-slate-900 font-medium placeholder-transparent"
                placeholder="Phone"
                required
              />
              <label className="absolute left-4 top-3 text-slate-400 text-sm transition-all peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-teal-600 peer-focus:bg-white peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-teal-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
                WhatsApp Number *
              </label>
            </div>
          </div>

          {/* Patient Type Cards */}
          <div className="flex gap-3">
            <label className={`flex-1 flex flex-col items-center p-3 rounded-xl border cursor-pointer transition-all ${patientType === 'new' ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <input type="radio" className="hidden" name="pType" value="new" checked={patientType === 'new'} onChange={() => setPatientType('new')} />
              <span className={`text-[10px] font-bold uppercase ${patientType === 'new' ? 'text-teal-600' : 'text-slate-400'}`}>New Patient</span>
            </label>
            <label className={`flex-1 flex flex-col items-center p-3 rounded-xl border cursor-pointer transition-all ${patientType === 'existing' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'}`}>
              <input type="radio" className="hidden" name="pType" value="existing" checked={patientType === 'existing'} onChange={() => setPatientType('existing')} />
              <span className={`text-[10px] font-bold uppercase ${patientType === 'existing' ? 'text-indigo-600' : 'text-slate-400'}`}>Existing</span>
            </label>
          </div>

          {/* Treatment Select */}
          <div className="relative">
            <select
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all text-slate-900 font-medium appearance-none"
              required
            >
              <option value="" disabled>Select Treatment</option>
              {treatments.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Preferred Date</label>
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Slot Selector Container */}
          {selectedDate && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-60 overflow-y-auto">
              <SlotSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                bookings={bookings}
              />
            </div>
          )}

          {formError && (
            <div className="text-[11px] font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedTime}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}