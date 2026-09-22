import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <PageHeader title="Page not found" subtitle="That page does not exist." />
      <Link to="/app/dashboard" className="mt-4 text-sm font-semibold text-brand-700">
        Back to dashboard
      </Link>
    </div>
  )
}