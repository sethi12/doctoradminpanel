'use client'

import { useState } from 'react'
import { DOCTOR_WHATSAPP } from '../constants/treatments'
import { formatTime12 } from '../utils/dateUtils'

export default function SuccessModal({
  showModal,
  setShowModal,
  newBooking,
  setNewBooking
}) {
  const [isSending, setIsSending] = useState(false)

  if (!showModal || !newBooking) return null

  const sendWhatsApp = (number, message) => {
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${number}?text=${encoded}`, '_blank')
  }

  const handleConfirm = () => {
    if (isSending) return
    setIsSending(true)

    const patientToDoctorMsg = 
      `Hello Doctor,\n\n` +
      `New online booking received!\n\n` +
      `👤 Name: ${newBooking.name}\n` +
      `📞 Phone: ${newBooking.phone}\n` +
      `📅 Date: ${newBooking.date}\n` +
      `⏰ Time: ${formatTime12(newBooking.time)}\n` +
      `🦷 Treatment: ${newBooking.treatment}\n` +
      `👤 Type: ${newBooking.patientType}\n\n` +
      `Thank you!`

    sendWhatsApp(DOCTOR_WHATSAPP, patientToDoctorMsg)

    setTimeout(() => {
      setIsSending(false)
      setShowModal(false)
      setNewBooking(null)
    }, 1200)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
      onClick={() => !isSending && setShowModal(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-teal-600 p-8 text-white text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl md:text-3xl font-bold">
            Appointment Booked!
          </h3>
          <p className="text-sm mt-2 opacity-90">
            One last step – confirm via WhatsApp
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-base">
            <div><p className="text-gray-600 font-medium">Date</p><p className="font-semibold text-gray-900">{newBooking.date}</p></div>
            <div><p className="text-gray-600 font-medium">Time</p><p className="font-semibold text-gray-900">{formatTime12(newBooking.time)}</p></div>
            <div><p className="text-gray-600 font-medium">Treatment</p><p className="font-semibold text-gray-900 break-words">{newBooking.treatment}</p></div>
            <div><p className="text-gray-600 font-medium">Patient</p><p className="font-semibold text-gray-900">{newBooking.name}</p></div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isSending}
            className={`w-full flex items-center justify-center gap-3 font-semibold py-4 px-6 rounded-2xl transition-all
              ${isSending
                ? 'bg-green-400 text-white cursor-wait'
                : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-md hover:shadow-lg'}
            `}
          >
            <span className="text-xl">📱</span>
            <span>{isSending ? 'Opening WhatsApp...' : 'Send Details to Doctor'}</span>
          </button>

          <p className="text-center text-sm text-gray-500">
            This opens WhatsApp with pre-filled details
          </p>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={() => setShowModal(false)}
            disabled={isSending}
            className={`w-full py-3 text-base font-medium transition-colors
              ${isSending ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}