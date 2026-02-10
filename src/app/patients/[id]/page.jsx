'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { db, storage } from '../../lib/firebase' 
import { ref, get, update } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import Link from 'next/link'

export default function PatientDetails() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prescription, setPrescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reports, setReports] = useState([])

  useEffect(() => {
    const fetchPatient = async () => {
      const patientRef = ref(db, `bookings/${id}`)
      const snapshot = await get(patientRef)
      if (snapshot.exists()) {
        const data = snapshot.val()
        setPatient(data)
        setPrescription(data.prescription || '')
        setReports(data.reports || [])
      }
      setLoading(false)
    }
    fetchPatient()
  }, [id])

  // --- WHATSAPP SHARE LOGIC ---
  const shareViaWhatsApp = () => {
    if (!patient) return;
    
    const message = `*PRESCRIPTION: ${patient.name}*\n\n` +
                    `*Treatment:* ${patient.treatment}\n` +
                    `*Date:* ${patient.date}\n\n` +
                    `*Doctor's Notes:*\n${prescription}\n\n` +
                    `_Sent via Clinic Management System_`;

    // Clean phone number (remove spaces, plus signs, dashes)
    const cleanPhone = patient.phone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const deleteReport = async (reportIndex, fileUrl) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const fileRef = storageRef(storage, fileUrl);
      await deleteObject(fileRef);
      const updatedReports = reports.filter((_, index) => index !== reportIndex);
      await update(ref(db, `bookings/${id}`), { reports: updatedReports });
      setReports(updatedReports);
      alert("Report deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Error deleting file.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fileId = Date.now()
      const fileReference = storageRef(storage, `patient_reports/${id}/${fileId}_${file.name}`)
      const uploadResult = await uploadBytes(fileReference, file)
      const downloadURL = await getDownloadURL(uploadResult.ref)
      const updatedReports = [...reports, { 
        name: file.name, 
        url: downloadURL, 
        date: new Date().toISOString(),
        fullPath: fileReference.fullPath 
      }]
      await update(ref(db, `bookings/${id}`), { reports: updatedReports })
      setReports(updatedReports)
    } catch (err) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const savePrescription = async () => {
    setIsSaving(true)
    try {
      await update(ref(db, `bookings/${id}`), { prescription, lastUpdated: new Date().toISOString() })
      alert('Saved!')
    } catch (err) {
      alert('Error')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="p-10 text-center animate-pulse text-teal-600 font-bold">Loading...</div>
  if (!patient) return <div className="p-10 text-center">Not found</div>

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12">
      <div className="max-w-6xl mx-auto print:hidden">
        <Link href="/patients" className="text-teal-600 font-bold text-sm flex items-center gap-2 mb-6 hover:translate-x-[-4px] transition-transform">
          ← Back to Patients
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-6 text-center text-white">
                <div className="w-20 h-20 rounded-2xl bg-teal-500 mx-auto flex items-center justify-center text-3xl font-black mb-4">
                  {patient.name?.charAt(0)}
                </div>
                <h1 className="text-xl font-bold">{patient.name}</h1>
                <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{patient.patientType}</p>
              </div>
              
              <div className="p-6 space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b pb-1">Personal Info</h3>
                <DetailItem label="Full Name" value={patient.name} />
                <DetailItem label="Phone Number" value={patient.phone} />
                <DetailItem label="Email" value={patient.email || 'N/A'} />
                
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b pb-1 pt-4">Clinical Info</h3>
                <DetailItem label="Main Complaint" value={patient.treatment} />
                <DetailItem label="Appointment" value={patient.date} />
                <DetailItem label="Time Slot" value={patient.time} />
                <DetailItem label="Booking ID" value={id.toUpperCase()} />
              </div>
            </div>

            {/* Reports Management */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Reports & Files</h3>
              <div className="space-y-3 mb-4">
                {reports.map((file, idx) => (
                  <div key={idx} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(file.date).toLocaleDateString()}</span>
                       <button 
                        onClick={() => deleteReport(idx, file.url)}
                        className="text-red-400 hover:text-red-600 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         DELETE
                       </button>
                    </div>
                    <a href={file.url} target="_blank" className="text-xs font-bold text-teal-700 truncate hover:underline">
                      {file.name}
                    </a>
                  </div>
                ))}
              </div>
              <label className="w-full flex flex-col items-center justify-center py-4 border-2 border-dashed rounded-2xl cursor-pointer bg-teal-50/30 border-teal-200 hover:bg-teal-50 transition-colors">
                <span className="text-[10px] font-black text-teal-700 uppercase">{uploading ? 'Processing...' : '+ Upload/Update Report'}</span>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Right Column: Clinical Notes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-teal-100 p-2 rounded-lg text-sm">📋</span> Doctor's Prescription
                </h2>
                
                {/* NEW: WHATSAPP SHARE BUTTON */}
                <button 
                  onClick={shareViaWhatsApp}
                  className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#20ba5a] transition-all shadow-md shadow-green-100"
                >
                  <span>Share on WhatsApp</span>
                </button>
              </div>

              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Start typing symptoms, diagnosis, and medicines..."
                className="w-full h-[500px] p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none text-slate-700 leading-relaxed focus:border-teal-400 transition-colors"
              />
              <div className="mt-6 flex gap-3">
                <button onClick={savePrescription} disabled={isSaving} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors">
                  {isSaving ? 'Saving...' : 'Save Patient File'}
                </button>
                <button onClick={() => window.print()} className="px-8 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRINT SECTION ─── */}
      <div className="hidden print:block p-8 bg-white text-black">
        <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Medical Report</h1>
            <p className="text-sm text-slate-500 font-bold">Patient ID: {id.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-sm font-medium">{patient.phone} | {patient.email || 'No Email'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-xl">
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400">Treatment / Complaint</p>
            <p className="font-bold">{patient.treatment}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400">Appointment Date</p>
            <p className="font-bold">{patient.date} at {patient.time}</p>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-lg font-black border-b-2 border-slate-200 mb-4 pb-1 uppercase tracking-widest text-slate-400">Doctor's Prescription</h3>
          <div className="whitespace-pre-wrap text-lg leading-relaxed text-slate-800 font-medium">
            {prescription || "No prescription notes recorded."}
          </div>
        </div>

        {reports.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-black border-b-2 border-slate-200 mb-6 pb-1 uppercase tracking-widest text-slate-400">Attached Medical Reports</h3>
            <div className="flex flex-col gap-8">
              {reports.map((file, idx) => (
                <div key={idx} className="page-break-inside-avoid">
                  <p className="text-xs font-bold text-slate-500 mb-2 uppercase italic">
                    Report {idx + 1}: {file.name}
                  </p>
                  {file.url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      className="w-full h-auto rounded-lg border-2 border-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-sm text-slate-400">
                      Non-Image File: {file.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .page-break-inside-avoid { page-break-inside: avoid; break-inside: avoid; display: block; }
          img { max-height: 90vh; object-fit: contain; }
        }
      `}</style>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-xs font-bold text-slate-800">{value}</p>
    </div>
  )
}