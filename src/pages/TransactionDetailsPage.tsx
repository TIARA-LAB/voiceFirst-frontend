import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Button, Spinner } from '@/components/Button'
import { useReverseTransaction, useTransaction } from '@/features/ledger'
import { formatDateTime, formatKoboAsNaira, formatQuantity } from '@/lib/formatters'
import type { TransactionIntent } from '@/types'

const INTENT_LABELS: Record<TransactionIntent, string> = {
  sale: 'Sale',
  purchase: 'Purchase',
  expense: 'Expense',
  stock_in: 'Stock in',
  debt: 'Debt',
  payment: 'Payment',
}

export default function TransactionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: transaction, isLoading, isError } = useTransaction(id)
  const reverse = useReverseTransaction(id)

  if (isLoading) {
    return (
      <Card className="flex justify-center py-16">
        <Spinner />
      </Card>
    )
  }

  if (isError || !transaction) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-lg font-semibold">Transaction not found</h1>
        <p className="mt-1 text-sm text-slate-500">It may have been reversed or the record no longer exists.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={INTENT_LABELS[transaction.intent]}
        subtitle={formatDateTime(transaction.createdAt)}
      />

      <Card className="space-y-4">
        <div className="divide-y divide-slate-100">
          {transaction.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="font-semibold text-slate-900">{item.productName ?? 'Unidentified'}</p>
                <p className="text-xs text-slate-500">
                  {formatQuantity(item.quantity, item.unit)} at {formatKoboAsNaira(item.unitPriceKobo)}
                </p>
              </div>
              <p className="font-semibold text-slate-900">{formatKoboAsNaira(item.lineTotalKobo)}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">Total</span>
          <span className="text-xl font-bold text-slate-900">{formatKoboAsNaira(transaction.totalKobo)}</span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Payment</dt>
            <dd className="font-medium capitalize">{transaction.paymentMethod ?? 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Counterparty</dt>
            <dd className="truncate font-medium">{transaction.counterparty ?? 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Status</dt>
            <dd className="font-medium">{transaction.reversed ? 'Reversed' : 'Active'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Source</dt>
            <dd className="font-medium capitalize">{transaction.source}</dd>
          </div>
        </dl>
      </Card>

      {!transaction.reversed && (
        <div className="mt-4">
          <Button
            variant="danger"
            fullWidth
            loading={reverse.isPending}
            onClick={() => {
              if (window.confirm('Reverse this transaction? This affects stock and balances.')) {
                reverse.mutate(undefined, { onSuccess: () => navigate('/app/ledger') })
              }
            }}
          >
            Reverse transaction
          </Button>
        </div>
      )}
    </div>
  )
}