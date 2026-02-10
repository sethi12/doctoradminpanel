import { Suspense } from 'react'
import PatientsClient from './PatientsClient'

export const dynamic = 'force-dynamic'

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading patients…</div>}>
      <PatientsClient />
    </Suspense>
  )
}
