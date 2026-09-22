import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { useProfitLossReport } from '@/features/reports'
import { formatKoboAsNaira } from '@/lib/formatters'

interface RowProps {
  label: string
  value: number
  emphasis?: boolean
  negative?: boolean
}

function Row({ label, value, emphasis = false, negative = false }: RowProps) {
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
  const { data: report, isLoading, isError } = useProfitLossReport()

  return (
    <div>
      <PageHeader title="Reports" subtitle="Profit and loss overview." />

      {isLoading && (
        <Card className="flex justify-center py-12">
          <Spinner />
        </Card>
      )}

      {isError && (
        <Card className="py-8 text-center text-sm text-slate-500">Could not load reports.</Card>
      )}

      {report && (
        <Card>
          <div className="space-y-1.5">
            <Row label="Revenue" value={report.revenueKobo} />
            <Row label="Cost of goods sold" value={report.costOfGoodsSoldKobo} negative />
            <Row label="Gross profit" value={report.grossProfitKobo} emphasis />
            <div className="my-2 border-t border-slate-100" />
            <Row label="Expenses" value={report.expensesKobo} negative />
            <Row
              label={report.estimated ? 'Estimated net profit' : 'Net profit'}
              value={report.estimatedNetProfitKobo}
              emphasis
            />
            <div className="my-2 border-t border-slate-100" />
            <Row label="Transactions" value={report.transactionCount} />
          </div>
          {report.estimated && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Some figures are labelled "Estimated profit" because cost price data is incomplete for
              some products.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}