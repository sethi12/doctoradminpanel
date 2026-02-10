'use client'

import {
  formatTime12,
  generateSlots,
  getBookedTimes,
  isToday,
  getCurrentTimeHHMM,
  isSlotInPast
} from '../utils/dateUtils'

export default function SlotSelector({
  selectedDate,
  selectedTime,
  setSelectedTime,
  bookings
}) {
  // Generate all possible slots (Assuming generateSlots() returns 30min intervals)
  const allSlots = generateSlots() 
  const booked = getBookedTimes(selectedDate, bookings)

  // 1. Filter by your specific hours: 10-2 and 4-8
  const filteredByHours = allSlots.filter(slot => {
    return (slot >= "10:00" && slot < "14:00") || (slot >= "16:00" && slot < "20:00")
  })

  // 2. Filter out already booked slots
  let available = filteredByHours.filter((slot) => !booked.includes(slot))

  // 3. If today → remove past slots
  if (isToday(selectedDate)) {
    const now = getCurrentTimeHHMM()
    available = available.filter((slot) => !isSlotInPast(slot, now))
  }

  // Group slots for better UI
  const morningSlots = available.filter(s => s < "14:00")
  const eveningSlots = available.filter(s => s >= "16:00")

  if (available.length === 0) {
    return (
      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
        <p className="text-amber-700 text-xs font-bold uppercase tracking-wide">No Slots Available</p>
        <p className="text-amber-600/80 text-[11px] mt-1">Try selecting a different date for this patient.</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Morning Session */}
      {morningSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-400">☀️</span>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Morning (10 AM - 2 PM)</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {morningSlots.map((slot) => (
              <SlotButton 
                key={slot} 
                slot={slot} 
                selectedTime={selectedTime} 
                setSelectedTime={setSelectedTime} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Evening Session */}
      {eveningSlots.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-indigo-400">🌙</span>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evening (4 PM - 8 PM)</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {eveningSlots.map((slot) => (
              <SlotButton 
                key={slot} 
                slot={slot} 
                selectedTime={selectedTime} 
                setSelectedTime={setSelectedTime} 
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center items-center gap-2 py-2 border-t border-slate-100">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
        <p className="text-[10px] text-slate-400 font-medium italic">30-minute consultation</p>
      </div>
    </div>
  )
}

// Sub-component for the buttons to keep code clean
function SlotButton({ slot, selectedTime, setSelectedTime }) {
  const isSelected = selectedTime === slot
  
  return (
    <button
      type="button"
      onClick={() => setSelectedTime(slot)}
      className={`
        py-2.5 px-1 rounded-xl text-xs font-bold border transition-all duration-200
        ${isSelected 
          ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200 scale-[1.05]' 
          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50'
        }
      `}
    >
      {formatTime12(slot)}
    </button>
  )
}