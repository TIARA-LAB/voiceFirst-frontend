import { useMemo, useState, type FormEvent } from 'react'
import { Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Button, Spinner } from '@/components/Button'
import { StatChip } from '@/components/StatChip'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/Input'
import { StatusBadge } from '@/components/StatusBadge'
import {
  useDebtorPayment,
  useDebtors,
  useSetDebtorSettled,
} from '@/features/debtors'
import { formatKoboAsNaira, nairaToKobo } from '@/lib/formatters'
import type { Debtor } from '@/types'

type Filter = 'all' | 'outstanding' | 'settled'

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'outstanding', label: 'Outstanding' },
  { value: 'settled', label: 'Settled' },
]

function PaymentForm({ debtor, onDone }: { debtor: Debtor; onDone: () => void }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const payment = useDebtorPayment(debtor.id)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const naira = Number(amount)
    if (!amount || Number.isNaN(naira) || naira <= 0) {
      setError('Enter a valid amount.')
      return
    }
    payment.mutate(
      { amountKobo: nairaToKobo(naira) },
      {
        onSuccess: onDone,
        onError: () => setError('Could not record the payment.'),
      },
    )
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-2 rounded-xl bg-slate-50 p-3" noValidate>
      <div className="flex items-end gap-2">
        <Input
          label=""
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="Amount paid (₦)"
          autoFocus
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <Button type="submit" size="md" loading={payment.isPending} className="shrink-0">
          Save
        </Button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </form>
  )
}

function SettleButton({ debtor }: { debtor: Debtor }) {
  const settle = useSetDebtorSettled(debtor.id)
  return (
    <button
      type="button"
      disabled={settle.isPending}
      className="text-xs font-semibold text-slate-500 hover:underline disabled:opacity-60"
      onClick={() => {
        if (
          window.confirm(
            `Mark ${debtor.name}'s debt as settled? Their outstanding balance will remain recorded.`,
          )
        ) {
          void settle.mutate({ settled: true })
        }
      }}
    >
      {settle.isPending ? 'Settling…' : 'Settle'}
    </button>
  )
}

export default function DebtorsPage() {  const { data: debtors, isLoading, isError } = useDebtors()
  const [filter, setFilter] = useState<Filter>('outstanding')
  const [search, setSearch] = useState('')
  const [payingFor, setPayingFor] = useState<string | null>(null)

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return (debtors ?? []).filter((debtor) => {
      if (filter === 'outstanding' && debtor.settled) return false
      if (filter === 'settled' && !debtor.settled) return false
      if (!needle) return true
      return `${debtor.name} ${debtor.phone ?? ''}`.toLowerCase().includes(needle)
    })
  }, [debtors, filter, search])

  const totalOutstanding = (debtors ?? [])
    .filter((debtor) => !debtor.settled)
    .reduce((sum, debtor) => sum + debtor.outstandingBalanceKobo, 0)
  const openCount = (debtors ?? []).filter((debtor) => !debtor.settled).length

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Debtors" subtitle="Customers who owe you money." />
        <Card className="flex justify-center py-14">
          <Spinner />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Debtors" subtitle="Track who owes you and record payments." />

      {isError && (
        <Card className="py-10 text-center text-sm text-slate-500">
          Could not load debtors. Check your connection.
        </Card>
      )}

      {!isError && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <StatChip label="Outstanding" value={formatKoboAsNaira(totalOutstanding)} tone="brand" sub={`${openCount} open debt${openCount === 1 ? '' : 's'}`} />
            <StatChip label="Settled" value={String((debtors ?? []).filter((d) => d.settled).length)} />
          </div>

          <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                  filter === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <Input
              label=""
              placeholder="Search by name or phone…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              icon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title={debtors?.length ? 'No matching debtors' : 'No debtors yet'}
              description={
                debtors?.length
                  ? 'Try a different filter or search.'
                  : 'Credit sales create debtor records automatically.'
              }
            />
          ) : (
            <div className="space-y-2">
              {visible.map((debtor) => (
                <Card key={debtor.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{debtor.name}</p>
                      {debtor.phone && <p className="text-xs text-slate-400">{debtor.phone}</p>}
                    </div>
                    <p className="shrink-0 text-sm font-bold text-slate-900">
                      {formatKoboAsNaira(debtor.outstandingBalanceKobo)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {debtor.settled ? (
                      <StatusBadge label="Settled" tone="success" />
                    ) : (
                      <StatusBadge label={`Owes ${formatKoboAsNaira(debtor.outstandingBalanceKobo)}`} tone="warning" />
                    )}
                    {!debtor.settled && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setPayingFor(payingFor === debtor.id ? null : debtor.id)}
                          className="text-xs font-semibold text-brand-700 hover:underline"
                        >
                          {payingFor === debtor.id ? 'Close' : 'Record payment'}
                        </button>
                        {debtor.outstandingBalanceKobo > 0 && <SettleButton debtor={debtor} />}
                      </div>
                    )}
                  </div>

                  {payingFor === debtor.id && (
                    <PaymentForm
                      debtor={debtor}
                      onDone={() => {
                        setPayingFor(null)
                      }}
                    />
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}