import { useMemo, useState } from 'react'
import { BarChart3, TrendingUp, Wallet, PackageX } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { StatChip } from '@/components/StatChip'
import { EmptyState } from '@/components/EmptyState'
import { useProfitLossReport, type ReportPeriod } from '@/features/reports'
import { bestSellers, creditActivity, inPeriod } from '@/features/reports/selectors'
import { useTransactions } from '@/features/ledger'
import { useStock } from '@/features/inventory'
import { formatKoboAsNaira, formatQuantity } from '@/lib/formatters'

const PERIODS: Array<{ value: ReportPeriod; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
]

type Section = 'best' | 'credit' | 'stock'

function Row({ label, value, emphasis = false, negative = false }: {
  label: string
  value: number
  emphasis?: boolean
  negative?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${emphasis ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
        {label}
      </span>
      <span className={`text-sm ${emphasis ? 'font-bold' : ''} ${negative ? 'text-red-600' : 'text-slate-900'}`}>
        {formatKoboAsNaira(value)}
      </span>
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('today')
  const report = useProfitLossReport(period)
  const { data: transactions } = useTransactions()
  const stockQuery = useStock()
  const [section, setSection] = useState<Section>('best')

  const periodTransactions = useMemo(
    () => (transactions ?? []).filter((t) => inPeriod(t.createdAt, period)),
    [transactions, period],
  )
  const sellers = useMemo(() => bestSellers(periodTransactions), [periodTransactions])
  const credit = useMemo(() => creditActivity(periodTransactions), [periodTransactions])
  const lowStock = useMemo(
    () =>
      (stockQuery.data ?? []).filter(
        (entry) => entry.lowStockThreshold != null && entry.currentQuantity <= entry.lowStockThreshold,
      ),
    [stockQuery.data],
  )

  return (
    <div>
      <PageHeader title="Reports" subtitle="Understand how your business is doing." />

      <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
        {PERIODS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPeriod(option.value)}
            className={`rounded-lg px-1 py-1.5 text-xs font-semibold transition-colors ${
              period === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {report.isLoading && (
        <Card className="flex justify-center py-14">
          <Spinner />
        </Card>
      )}

      {report.isError && (
        <Card className="py-10 text-center text-sm text-slate-500">
          Could not load reports. Check your connection.
        </Card>
      )}

      {report.data && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <StatChip label="Revenue" value={formatKoboAsNaira(report.data.revenueKobo)} tone="brand" />
            <StatChip label="Gross profit" value={formatKoboAsNaira(report.data.grossProfitKobo)} tone="neutral" />
            <StatChip
              label="Expenses"
              value={formatKoboAsNaira(report.data.expensesKobo)}
              tone="danger"
            />
            <StatChip
              label={report.data.estimated ? 'Est. net profit' : 'Net profit'}
              value={formatKoboAsNaira(report.data.estimatedNetProfitKobo)}
              tone={report.data.estimatedNetProfitKobo < 0 ? 'danger' : 'neutral'}
            />
          </div>

          <Card className="mb-4">
            <div className="space-y-1.5">
              <Row label="Revenue" value={report.data.revenueKobo} />
              <Row label="Cost of goods sold" value={report.data.costOfGoodsSoldKobo} negative />
              <Row label="Gross profit" value={report.data.grossProfitKobo} emphasis />
              <div className="my-2 border-t border-slate-100" />
              <Row label="Expenses" value={report.data.expensesKobo} negative />
              <Row
                label={report.data.estimated ? 'Estimated net profit' : 'Net profit'}
                value={report.data.estimatedNetProfitKobo}
                emphasis
              />
            </div>
            {report.data.estimated && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Some figures are "estimated" because cost-price data is missing for certain products.
              </p>
            )}
          </Card>
        </>
      )}

      <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {[
          { value: 'best' as Section, label: 'Best sellers' },
          { value: 'credit' as Section, label: 'Credit & debts' },
          { value: 'stock' as Section, label: 'Low stock' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSection(option.value)}
            className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              section === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {section === 'best' &&
        (sellers.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="h-7 w-7" />}
            title="No sales in this period"
            description="Best sellers appear once you record and confirm sales."
          />
        ) : (
          <Card className="divide-y divide-slate-50">
            {sellers.map((seller) => (
              <div key={seller.name} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{seller.name}</p>
                  <p className="text-xs text-slate-500">{formatQuantity(seller.quantity)} sold</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{formatKoboAsNaira(seller.revenueKobo)}</p>
              </div>
            ))}
          </Card>
        ))}

      {section === 'credit' &&
        (credit.creditCount + credit.paymentCount === 0 ? (
          <EmptyState
            icon={<Wallet className="h-7 w-7" />}
            title="No credit activity"
            description="New credit sales and debt payments will show up here."
          />
        ) : (
          <Card className="space-y-3">
            <ReportRow label="New credit sales" value={credit.newCreditKobo} count={credit.creditCount} />
            <ReportRow label="Debt payments received" value={credit.paymentsKobo} count={credit.paymentCount} />
          </Card>
        ))}

      {section === 'stock' &&
        (lowStock.length === 0 ? (
          <EmptyState
            icon={<PackageX className="h-7 w-7" />}
            title="Nothing running low"
            description="Products that approach their low-stock threshold appear here."
          />
        ) : (
          <div className="space-y-2">
            {lowStock.map((entry) => (
              <Card key={entry.productId} className="flex items-center justify-between">
                <p className="truncate font-semibold text-slate-900">{entry.name}</p>
                <p className="shrink-0 text-sm text-slate-600">
                  {formatQuantity(entry.currentQuantity, entry.unit)}
                </p>
              </Card>
            ))}
          </div>
        ))}
    </div>
  )
}

function ReportRow({ label, value, count }: { label: string; value: number; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-slate-600">
        <BarChart3 className="h-4 w-4 text-slate-400" />
        {label}
        {count > 0 && <span className="text-xs text-slate-400">· {count}</span>}
      </span>
      <span className="text-sm font-bold text-slate-900">{formatKoboAsNaira(value)}</span>
    </div>
  )
}