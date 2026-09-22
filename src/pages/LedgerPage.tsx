import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { Select } from '@/components/Input'
import { useTransactions } from '@/features/ledger'
import { formatKoboAsNaira, formatDate } from '@/lib/formatters'
import type { TransactionIntent } from '@/types'

const INTENTS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'sale', label: 'Sales' },
  { value: 'purchase', label: 'Purchases' },
  { value: 'expense', label: 'Expenses' },
  { value: 'stock_in', label: 'Stock in' },
  { value: 'debt', label: 'Debt' },
  { value: 'payment', label: 'Payments' },
]

const INTENT_COLORS: Record<TransactionIntent, string> = {
  sale: 'bg-brand-100 text-brand-800',
  purchase: 'bg-sky-100 text-sky-800',
  expense: 'bg-red-100 text-red-800',
  stock_in: 'bg-violet-100 text-violet-800',
  debt: 'bg-amber-100 text-amber-800',
  payment: 'bg-slate-200 text-slate-800',
}

export default function LedgerPage() {
  const [intent, setIntent] = useState('')
  const { data: transactions, isLoading, isError } = useTransactions({ intent })

  return (
    <div>
      <PageHeader title="Ledger" subtitle="Your business activity in one place." />

      <div className="mb-3">
        <Select label="" aria-label="Filter by transaction type" value={intent} onChange={(event) => setIntent(event.target.value)}>
          {INTENTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && (
        <Card className="flex justify-center py-12">
          <Spinner />
        </Card>
      )}

      {isError && (
        <Card className="py-8 text-center text-sm text-slate-500">
          Could not load the ledger. Check your connection.
        </Card>
      )}

      {!isLoading && !isError && (!transactions || transactions.length === 0) && (
        <Card className="py-10 text-center">
          <p className="text-sm text-slate-600">No transactions yet.</p>
          <Link to="/app/record" className="mt-2 inline-block text-sm font-semibold text-brand-700">
            Record your first transaction →
          </Link>
        </Card>
      )}

      <div className="space-y-2">
        {transactions?.map((transaction) => (
          <Link key={transaction.id} to={`/app/transactions/${transaction.id}`}>
            <Card className="hover:ring-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${INTENT_COLORS[transaction.intent]}`}>
                    {transaction.intent}
                  </span>
                  {transaction.counterparty && (
                    <span className="truncate text-sm text-slate-600">{transaction.counterparty}</span>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatKoboAsNaira(transaction.totalKobo)}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{formatDate(transaction.createdAt)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}