import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { useStock } from '@/features/inventory'
import { formatQuantity } from '@/lib/formatters'

export default function StockPage() {
  const { data: stock, isLoading, isError } = useStock()

  return (
    <div>
      <PageHeader title="Stock" subtitle="Current quantities across your products." />

      {isLoading && (
        <Card className="flex justify-center py-12">
          <Spinner />
        </Card>
      )}

      {isError && (
        <Card className="py-8 text-center text-sm text-slate-500">Could not load stock levels.</Card>
      )}

      {!isLoading && !isError && (!stock || stock.length === 0) && (
        <Card className="py-10 text-center text-sm text-slate-600">
          No stock tracked yet. Stock updates automatically after sales and purchases.
        </Card>
      )}

      <div className="space-y-2">
        {stock?.map((entry) => {
          const low = entry.lowStockThreshold != null && entry.currentQuantity <= entry.lowStockThreshold
          return (
            <Card key={entry.productId} className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{entry.name}</p>
                <p className="text-xs text-slate-500">
                  {formatQuantity(entry.currentQuantity, entry.unit)}
                </p>
              </div>
              {low ? (
                <StatusBadge label="Low stock" tone="danger" />
              ) : (
                <StatusBadge label="In stock" tone="success" />
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}