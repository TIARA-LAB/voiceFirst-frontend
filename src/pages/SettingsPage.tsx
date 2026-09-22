import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { useAuth } from '@/features/auth'

export default function SettingsPage() {
  const { user, business, logout } = useAuth()

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and business preferences." />

      <div className="space-y-4">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Business</p>
          <p className="mt-1 font-semibold text-slate-900">{business?.name ?? 'No business yet'}</p>
          {business?.category && <p className="text-sm text-slate-500">{business.category}</p>}
          {!business?.onboardingCompleted && (
            <Link
              to="/business-setup"
              className="mt-2 inline-block text-sm font-semibold text-brand-700"
            >
              Finish onboarding →
            </Link>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
          <p className="mt-1 text-sm text-slate-600">
            {user?.phone ?? user?.email ?? 'Account'}
          </p>
        </Card>

        <Card className="space-y-1">
          <Link to="/app/sync" className="block py-1 text-sm font-medium text-slate-700">
            Sync center
          </Link>
          <Link to="/app/stock" className="block py-1 text-sm font-medium text-slate-700">
            Stock
          </Link>
          <Link to="/app/debtors" className="block py-1 text-sm font-medium text-slate-700">
            Debtors
          </Link>
          <Link to="/app/reports" className="block py-1 text-sm font-medium text-slate-700">
            Reports
          </Link>
        </Card>

        <Button variant="danger" fullWidth onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  )
}