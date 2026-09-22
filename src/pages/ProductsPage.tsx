import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Package } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { StatChip } from '@/components/StatChip'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/Input'
import { StatusBadge } from '@/components/StatusBadge'
import { useArchiveProduct, useProducts, useUpdateProduct } from '@/features/products'
import { useStock } from '@/features/inventory'
import { formatKoboAsNaira, formatQuantity } from '@/lib/formatters'
import type { Product } from '@/types'

function ProductActions({ product }: { product: Product }) {
  const archive = useArchiveProduct(product.id)
  const update = useUpdateProduct(product.id)
  const busy = archive.isPending || update.isPending

  if (product.archived) {
    return (
      <button
        type="button"
        disabled={busy}
        className="text-xs font-semibold text-slate-500 hover:underline disabled:opacity-60"
        onClick={() => void update.mutateAsync({ archived: false })}
      >
        {busy ? 'Restoring…' : 'Restore'}
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={busy}
      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
      onClick={() => {
        if (
          window.confirm(
            `Archive "${product.name}"? Archived products no longer match in recordings.`,
          )
        ) {
          void archive.mutate()
        }
      }}
    >
      {busy ? 'Archiving…' : 'Archive'}
    </button>
  )
}

export default function ProductsPage() {
  const { data: products, isLoading, isError } = useProducts()
  const stockQuery = useStock()
  const [search, setSearch] = useState('')

  const stockByProduct = useMemo(() => {
    const map = new Map<string, { current: number; unit: string | null }>()
    for (const entry of stockQuery.data ?? []) {
      map.set(entry.productId, { current: entry.currentQuantity, unit: entry.unit })
    }
    return map
  }, [stockQuery.data])

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return products ?? []
    return (products ?? []).filter((product) =>
      [product.name, ...product.aliases, product.defaultUnit ?? '']
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [products, search])

  const lowStockCount = useMemo(
    () =>
      (products ?? []).filter((product) => {
        const stock = stockByProduct.get(product.id)
        return (
          product.lowStockThreshold != null &&
          stock != null &&
          stock.current <= product.lowStockThreshold
        )
      }).length,
    [products, stockByProduct],
  )

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Products" subtitle="Your catalog powers product matching." />
        <Card className="flex justify-center py-14">
          <Spinner />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Add products so voice matches them in your recordings."
        trailing={
          <Link
            to="/app/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Add
          </Link>
        }
      />

      {isError && (
        <Card className="py-10 text-center text-sm text-slate-500">
          Could not load your products. Check your connection.
        </Card>
      )}

      {!isError && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <StatChip label="Total products" value={String(products?.length ?? 0)} />
            <StatChip
              label="Low stock"
              value={String(lowStockCount)}
              tone={lowStockCount > 0 ? 'warning' : 'neutral'}
            />
          </div>

          <div className="mb-4">
            <Input
              label=""
              placeholder="Search products or aliases…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              icon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={<Package className="h-7 w-7" />}
              title={products?.length ? 'No matching products' : 'No products yet'}
              description={
                products?.length
                  ? 'Try a different search term.'
                  : 'Add your first product so the voice AI can match what you say.'
              }
              actionLabel={products?.length ? undefined : 'Add your first product'}
              actionTo={products?.length ? undefined : '/app/products/new'}
            />
          ) : (
            <div className="space-y-2">
              {visible.map((product) => {
                const stock = stockByProduct.get(product.id)
                const low =
                  product.lowStockThreshold != null &&
                  stock != null &&
                  stock.current <= product.lowStockThreshold
                return (
                  <Card key={product.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">{product.name}</p>
                          {product.archived && <StatusBadge label="Archived" tone="neutral" />}
                          {low && <StatusBadge label="Low stock" tone="danger" />}
                        </div>
                        {product.aliases.length > 0 && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {product.aliases.join(', ')}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm font-bold text-slate-900">
                        {formatKoboAsNaira(product.unitPriceKobo)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Unit: {product.defaultUnit ?? '—'}</span>
                      <span>
                        {stock ? formatQuantity(stock.current, stock.unit) : 'No stock tracked'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <Link
                        to={`/app/products/${product.id}/edit`}
                        className="text-xs font-semibold text-brand-700 hover:underline"
                      >
                        Edit
                      </Link>
                      <ProductActions product={product} />
                    </div>
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