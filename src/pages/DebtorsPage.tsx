import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { useDebtors } from '@/features/debtors'
import { formatKoboAsNaira } from '@/lib/formatters'

export default function DebtorsPage() {
  const { data: debtors, isLoading, isError } = useDebtors()

  return (
    <div>
      <PageHeader title="Debtors" subtitle="Customers who owe you money." />

      {isLoading && (
        <Card className="flex justify-center py-12">
          <Spinner />
        </Card>
      )}

      {isError && (
        <Card className="py-8 text-center text-sm text-slate-500">Could not load debtors.</Card>
      )}

      {!isLoading && !isError && (!debtors || debtors.length === 0) && (
        <Card className="py-10 text-center text-sm text-slate-600">
          No outstanding debts. Credit sales create debtor records automatically.
        </Card>
      )}

      <div className="space-y-2">
        {debtors?.map((debtor) => (
          <Card key={debtor.id} className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{debtor.name}</p>
              {debtor.phone && <p className="text-xs text-slate-500">{debtor.phone}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {formatKoboAsNaira(debtor.outstandingBalanceKobo)}
              </span>
              {debtor.settled && <StatusBadge label="Settled" tone="success" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}