// app/utils/dateUtils.js

export function generateSlots() {
  const slots = []

  // --- Morning Shift: 10:00 AM to 2:00 PM ---
  // We loop from 10 to 13 (1 PM). 
  // The last slot added will be 13:30 (1:30 PM), finishing at 2:00 PM.
  for (let h = 10; h <= 13; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }

  // --- Evening Shift: 4:00 PM to 8:00 PM ---
  // 4 PM is 16:00. We loop from 16 to 19 (7 PM).
  // The last slot added will be 19:30 (7:30 PM), finishing at 8:00 PM.
  for (let h = 16; h <= 19; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }

  return slots
}

export function getBookedTimes(date, bookings) {
  if (!bookings) return []
  return bookings
    .filter((b) => b.date === date)
    .map((b) => b.time)
}

export function formatTime12(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}

export function isToday(dateString) {
  const today = new Date().toISOString().split('T')[0]
  return dateString === today
}

export function getCurrentTimeHHMM() {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function isSlotInPast(slotHHMM, currentHHMM) {
  // Simple string comparison works for "HH:MM" format
  return slotHHMM <= currentHHMM
}