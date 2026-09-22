import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Button, Spinner } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { useCancelDraft, useConfirmation, useConfirmDraft } from '@/features/confirmations'
import { formatKoboAsNaira, formatQuantity } from '@/lib/formatters'
import type { TransactionIntent } from '@/types'

const INTENT_LABELS: Record<TransactionIntent, string> = {
  sale: 'Sale',
  purchase: 'Purchase',
  expense: 'Expense',
  stock_in: 'Stock in',
  debt: 'Debt',
  payment: 'Payment',
}

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>()
  const { data: confirmation, isLoading, isError } = useConfirmation(id)
  const confirmMutation = useConfirmDraft(id)
  const cancelMutation = useCancelDraft(id)

  if (isLoading) {
    return (
      <Card className="flex justify-center py-16">
        <Spinner />
      </Card>
    )
  }

  if (isError || !confirmation) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-lg font-semibold">Confirmation not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          This confirmation may have expired or been processed already.
        </p>
        <Link to="/app/dashboard" className="mt-4 inline-block text-sm font-semibold text-brand-700">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const parsed = confirmation.parsed

  return (
    <div>
      <PageHeader
        title="Confirm transaction"
        subtitle="Review what we understood before anything is saved."
      />

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">{INTENT_LABELS[parsed.intent]}</h2>
          <StatusBadge label={`${Math.round(parsed.confidence * 100)}% sure`} tone="info" />
        </div>

        <div className="divide-y divide-slate-100">
          {parsed.items.map((item, index) => (
            <div key={index} className="space-y-1 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{item.name ?? 'Unidentified product'}</p>
                {item.quantity != null && (
                  <p className="text-sm text-slate-600">
                    {formatQuantity(item.quantity, item.unit)} × {formatKoboAsNaira(item.unitPriceKobo)}
                  </p>
                )}
              </div>
              {item.lineTotalKobo != null && (
                <p className="text-right text-sm font-medium text-slate-900">
                  {formatKoboAsNaira(item.lineTotalKobo)}
                </p>
              )}
              {!item.name && (
                <p className="text-xs font-medium text-red-600">No product identified — cannot confirm.</p>
              )}
            </div>
          ))}

          {parsed.items.length === 0 && (
            <p className="py-4 text-sm text-slate-500">No items were identified in this recording.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">Total</span>
          <span className="text-xl font-bold text-slate-900">
            {formatKoboAsNaira(parsed.totalKobo ?? 0)}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Payment</dt>
            <dd className="font-medium capitalize">{parsed.paymentMethod ?? 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Customer / supplier</dt>
            <dd className="truncate font-medium">{parsed.counterparty ?? 'Not specified'}</dd>
          </div>
        </dl>

        {(parsed.missingFields.length > 0 || parsed.ambiguities.length > 0) && (
          <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            {parsed.missingFields.length > 0 && (
              <p>Missing: {parsed.missingFields.join(', ')}</p>
            )}
            {parsed.ambiguities.length > 0 && (
              <p>Unclear: {parsed.ambiguities.join(', ')}</p>
            )}
          </div>
        )}

        {parsed.items.some((item) => !item.name) && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
            It looks like a product was not recognised. Edit the transaction before confirming.
          </p>
        )}
      </Card>

      <div className="mt-4 flex gap-2">
        <Button
          fullWidth
          loading={confirmMutation.isPending}
          disabled={parsed.items.some((item) => !item.name)}
          onClick={() => confirmMutation.mutate()}
        >
          Confirm
        </Button>
        <Button variant="secondary" fullWidth>
          <Link to={`/app/edit/${id}`} className="block w-full text-center">
            Edit
          </Link>
        </Button>
        <Button variant="ghost" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
          Cancel
        </Button>
      </div>
    </div>
  )
}