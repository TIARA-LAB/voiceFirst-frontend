import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Button'
import { useProducts } from '@/features/products'
import { formatKoboAsNaira } from '@/lib/formatters'

export default function ProductsPage() {
  const { data: products, isLoading, isError } = useProducts()

  const linkStyles =
    'inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700'

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Your catalog powers product matching in recordings."
        trailing={
          <Link to="/app/products/new" className={linkStyles}>
            Add
          </Link>
        }
      />

      {isLoading && (
        <Card className="flex justify-center py-12">
          <Spinner />
        </Card>
      )}

      {isError && (
        <Card className="py-8 text-center text-sm text-slate-500">
          Could not load your products.
        </Card>
      )}

      {!isLoading && !isError && (!products || products.length === 0) && (
        <Card className="py-10 text-center">
          <p className="text-sm text-slate-600">No products yet. Add one so voice matches it in your recordings.</p>
          <Link to="/app/products/new" className={`mt-3 inline-block ${linkStyles}`}>
            Add your first product
          </Link>
        </Card>
      )}

      <div className="space-y-2">
        {products?.map((product) => (
          <Card key={product.id} className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-500">
                {product.defaultUnit ? `Per ${product.defaultUnit}` : 'No default unit'}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {formatKoboAsNaira(product.unitPriceKobo)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}