import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'
import { useConfirmation } from '@/features/confirmations'

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>()
  const { data: confirmation, isLoading } = useConfirmation(id)

  const intentLabel = confirmation?.parsed.intent
    ? confirmation.parsed.intent.charAt(0).toUpperCase() + confirmation.parsed.intent.slice(1)
    : 'transaction'

  return (
    <div>
      <PageHeader title="Edit transaction" subtitle={`Correct the ${intentLabel.toLowerCase()} before confirming.`} />

      {isLoading && (
        <Card className="py-8 text-center text-sm text-slate-500">Loading draft…</Card>
      )}

      <Card className="space-y-4">
        <p className="text-sm text-slate-600">
          The edit form will let you change the product, quantity, unit, price, payment method, and
          counterparty for the pending draft. Changes are sent with{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">PATCH /confirmations/:id</code>{' '}
          before confirmation.
        </p>
        <div className="flex gap-2">
          <Button>
            <Link to={`/app/confirmations/${id}`} className="block w-full">
              Back to confirmation
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}