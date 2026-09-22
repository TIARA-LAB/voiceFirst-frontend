import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, LayoutList } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { Input, Select } from '@/components/Input'
import { useTransactions } from '@/features/ledger'
import { formatDate, formatKoboAsNaira, formatTime } from '@/lib/formatters'
import type { Transaction, TransactionIntent } from '@/types'

const INTENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'sale', label: 'Sales' },
  { value: 'purchase', label: 'Purchases' },
  { value: 'expense', label: 'Expenses' },
  { value: 'stock_in', label: 'Stock in' },
  { value: 'debt', label: 'Credit sales' },
  { value: 'payment', label: 'Debt payments' },
]

const PERIOD_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

const INTENT_TONES: Record<TransactionIntent, { badge: string; label: string }> = {
  sale: { badge: 'bg-brand-100 text-brand-800', label: 'Sale' },
  purchase: { badge: 'bg-sky-100 text-sky-800', label: 'Purchase' },
  expense: { badge: 'bg-red-100 text-red-800', label: 'Expense' },
  stock_in: { badge: 'bg-violet-100 text-violet-800', label: 'Stock in' },
  debt: { badge: 'bg-amber-100 text-amber-800', label: 'Credit sale' },
  payment: { badge: 'bg-slate-200 text-slate-800', label: 'Payment' },
}

function inRange(createdAt: string, period: string): boolean {
  if (period === 'all') return true
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const days = period === 'today' ? 0 : period === '7d' ? 6 : period === '30d' ? 29 : 0
  const cutoff = new Date(startOfToday)
  cutoff.setDate(cutoff.getDate() - days)
  return new Date(createdAt) >= cutoff
}

function groupByDay(transactions: Transaction[]): { key: string; items: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>()
  for (const transaction of transactions) {
    const key = formatDate(transaction.createdAt)
    const list = groups.get(key) ?? []
    list.push(transaction)
    groups.set(key, list)
  }
  return [...groups.entries()]
    .map(([key, items]) => ({
      key,
      items: items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    }))
    .sort((a, b) => new Date(b.items[0].createdAt).getTime() - new Date(a.items[0].createdAt).getTime())
}

export default function LedgerPage() {
  const { data: transactions, isLoading, isError } = useTransactions()
  const [search, setSearch] = useState('')
  const [intent, setIntent] = useState('')
  const [period, setPeriod] = useState('all')

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (transactions ?? []).filter((transaction) => {
      if (intent && transaction.intent !== intent) return false
      if (!inRange(transaction.createdAt, period)) return false
      if (!needle) return true
      const matchesCounterparty = transaction.counterparty
        ?.toLowerCase()
        .includes(needle)
      const matchesProduct = transaction.items.some((item) =>
        item.productName?.toLowerCase().includes(needle),
      )
      return Boolean(matchesCounterparty || matchesProduct)
    })
  }, [transactions, search, intent, period])

  const filteredTotal = filtered.reduce((sum, t) => sum + t.totalKobo, 0)
  const groups = useMemo(() => groupByDay(filtered), [filtered])
  const isEmpty = !isLoading && !isError && filtered.length === 0

  return (
    <div>
      <PageHeader
        title="Ledger"
        subtitle="Search, filter, and review everything you have recorded."
      />

      <div className="mb-3 space-y-2">
        <Input
          label=""
          placeholder="Search product, customer, or supplier…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          icon={<Search className="h-4 w-4 text-slate-400" />}
        />
        <div className="grid grid-cols-2 gap-2">
          <Select label="" aria-label="Filter by transaction type" value={intent} onChange={(event) => setIntent(event.target.value)}>
            {INTENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select label="" aria-label="Filter by period" value={period} onChange={(event) => setPeriod(event.target.value)}>
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && (
        <Card className="flex justify-center py-14">
          <Spinner />
        </Card>
      )}

      {isError && (
        <Card className="py-10 text-center text-sm text-slate-500">
          Could not load the ledger. Check your connection.
        </Card>
      )}

      {isEmpty && (
        <EmptyState
          icon={<LayoutList className="h-7 w-7" />}
          title={transactions?.length ? 'No matching transactions' : 'No transactions yet'}
          description={
            transactions?.length
              ? 'Try a different search, type, or period.'
              : 'Record your first transaction by voice or confirm a pending draft.'
          }
          actionLabel={transactions?.length ? undefined : 'Record a transaction'}
          actionTo={transactions?.length ? undefined : '/app/record'}
        />
      )}

      {filtered.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
            <span className="text-sm text-slate-500">
              {filtered.length} transaction{filtered.length === 1 ? '' : 's'}
            </span>
            <span className="text-sm font-bold text-slate-900">
              {formatKoboAsNaira(filteredTotal)}
            </span>
          </div>

          <div className="space-y-5">
            {groups.map((group) => (
              <section key={group.key}>
                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.key}
                </h2>
                <div className="space-y-2">
                  {group.items.map((transaction) => {
                    const tone = INTENT_TONES[transaction.intent]
                    const products = transaction.items
                      .map((item) => item.productName ?? 'Unidentified')
                      .join(', ')
                    return (
                      <Link key={transaction.id} to={`/app/transactions/${transaction.id}`}>
                        <Card className="transition-colors hover:ring-slate-300">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone.badge}`}>
                                {tone.label}
                              </span>
                              <span className="truncate text-sm text-slate-600">{products}</span>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-slate-900">
                              {formatKoboAsNaira(transaction.totalKobo)}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                            <span>
                              {transaction.counterparty ?? '—'} · {formatTime(transaction.createdAt)}
                            </span>
                            {transaction.reversed && (
                              <span className="font-medium text-red-500">Reversed</span>
                            )}
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}