import { useState } from 'react'
import { ChevronDown, Package, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { StatChip } from '@/components/StatChip'
import { EmptyState } from '@/components/EmptyState'
import { StatusBadge } from '@/components/StatusBadge'
import { useStock, useStockMovements } from '@/features/inventory'
import { formatDate, formatQuantity } from '@/lib/formatters'
import type { StockMovement } from '@/types'

function MovementList({ productId }: { productId: string }) {
  const { data: movements, isLoading } = useStockMovements(productId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
        <Spinner size="sm" /> Loading movements…
      </div>
    )
  }

  if (!movements || movements.length === 0) {
    return <p className="py-2 text-xs text-slate-400">No movements recorded yet.</p>
  }

  return (
    <ul className="divide-y divide-slate-50">
      {movements.slice(0, 10).map((movement: StockMovement) => (
        <li key={movement.id} className="flex items-center justify-between py-2 text-xs">
          <span className="flex items-center gap-2 text-slate-600">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                movement.delta >= 0 ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-600'
              }`}
            >
              {movement.delta >= 0 ? <ArrowDownToLine className="h-3.5 w-3.5" /> : <ArrowUpFromLine className="h-3.5 w-3.5" />}
            </span>
            <span>
              {movement.delta >= 0 ? 'Stock in' : 'Stock out'} · {movement.reason}
            </span>
          </span>
          <span className="text-slate-500">{formatDate(movement.createdAt)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function StockPage() {
  const { data: stock, isLoading, isError } = useStock()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Stock" subtitle="Current quantities across your products." />
        <Card className="flex justify-center py-14">
          <Spinner />
        </Card>
      </div>
    )
  }

  const lowCount = (stock ?? []).filter(
    (entry) => entry.lowStockThreshold != null && entry.currentQuantity <= entry.lowStockThreshold,
  ).length

  return (
    <div>
      <PageHeader title="Stock" subtitle="Current quantities and movement history." />

      {isError && (
        <Card className="py-10 text-center text-sm text-slate-500">
          Could not load stock levels. Check your connection.
        </Card>
      )}

      {!isError && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <StatChip label="Products tracked" value={String(stock?.length ?? 0)} />
            <StatChip label="Low stock" value={String(lowCount)} tone={lowCount ? 'warning' : 'neutral'} />
          </div>

          {stock && stock.length === 0 ? (
            <EmptyState
              icon={<Package className="h-7 w-7" />}
              title="Nothing tracked yet"
              description="Stock updates automatically after sales and purchases are confirmed."
            />
          ) : (
            <div className="space-y-2">
              {(stock ?? []).map((entry) => {
                const low =
                  entry.lowStockThreshold != null && entry.currentQuantity <= entry.lowStockThreshold
                const isOpen = expanded === entry.productId
                const fill =
                  entry.lowStockThreshold != null && entry.lowStockThreshold > 0
                    ? Math.min(1, entry.currentQuantity / (entry.lowStockThreshold * 2))
                    : 1
                return (
                  <Card key={entry.productId} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{entry.name}</p>
                        <p className="text-xs text-slate-500">
                          {entry.lowStockThreshold != null
                            ? `Low-stock alert at ${entry.lowStockThreshold}`
                            : 'No threshold set'}
                        </p>
                      </div>
                      {low ? (
                        <StatusBadge label="Low stock" tone="danger" />
                      ) : (
                        <StatusBadge label="In stock" tone="success" />
                      )}
                    </div>

                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatQuantity(entry.currentQuantity, entry.unit)}
                      </p>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : entry.productId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700"
                      >
                        Movements
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${low ? 'bg-red-500' : 'bg-brand-500'}`}
                        style={{ width: `${Math.max(8, fill * 100)}%` }}
                      />
                    </div>

                    {isOpen && (
                      <div className="rounded-xl bg-slate-50 px-3 py-1">
                        <MovementList productId={entry.productId} />
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}