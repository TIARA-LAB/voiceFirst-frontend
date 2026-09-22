import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Link } from 'react-router-dom'

export default function ProcessingStatusPage() {
  return (
    <div>
      <PageHeader title="Processing" subtitle="We are working on something." />
      <Card className="py-10 text-center">
        <p className="text-sm text-slate-600">
          The processing status page will show live progress for the audio pipeline:
        </p>
        <p className="text-xs text-slate-400">
          Uploaded → Voice AI understands the transaction → Product matching → Pending confirmation created.
        </p>
        <Link to="/app/record" className="mt-4 inline-block text-sm font-semibold text-brand-700">
          Back to recording
        </Link>
      </Card>
    </div>
  )
}