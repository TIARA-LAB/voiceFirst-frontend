import { Link } from 'react-router-dom'
import { Mic, LayoutList, PackagePlus } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardHeader } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { useDashboardReport } from '@/features/reports'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { formatKoboAsNaira } from '@/lib/formatters'

const quickActions = [
  { to: '/app/record', label: 'Record a transaction', icon: Mic, tone: 'bg-brand-600 text-white' },
  { to: '/app/ledger', label: 'View ledger', icon: LayoutList, tone: 'bg-slate-900 text-white' },
  { to: '/app/products/new', label: 'Add product', icon: PackagePlus, tone: 'bg-white text-slate-800 ring-1 ring-slate-200' },
]

export default function DashboardPage() {
  const report = useDashboardReport()
  const online = useOnlineStatus()

  return (
    <div>
      <PageHeader
        title="Good day"
        subtitle={online ? 'Here is how your business is doing.' : 'You are offline. Records will sync when you reconnect.'}
      />

      <div className="space-y-4">
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick actions</h2>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-xs font-semibold ${action.tone}`}
              >
                <action.icon className="h-5 w-5" />
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Today's summary
          </h2>
          {report.isLoading && (
            <Card className="flex items-center justify-center py-10">
              <Spinner />
            </Card>
          )}
          {report.isError && (
            <Card>
              <CardHeader
                title="Summary unavailable"
                subtitle="We could not load today's numbers. If you have not added products or transactions yet, this is normal."
              />
              <Link to="/app/record" className="text-sm font-semibold text-brand-700">
                Record your first transaction →
              </Link>
            </Card>
          )}
          {report.isSuccess && report.data && (
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Revenue" value={formatKoboAsNaira(report.data.revenueKobo)} tone="text-slate-900" />
              <Metric label="Expenses" value={formatKoboAsNaira(report.data.expensesKobo)} tone="text-red-600" />
              <Metric
                label={report.data.estimated ? 'Estimated profit' : 'Net profit'}
                value={formatKoboAsNaira(report.data.estimatedNetProfitKobo)}
                tone="text-brand-700"
              />
              <Metric label="Transactions" value={String(report.data.transactionCount)} tone="text-slate-900" />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-lg font-bold ${tone}`}>{value}</p>
    </Card>
  )
}