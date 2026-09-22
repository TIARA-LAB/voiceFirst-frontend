import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Button, Spinner } from '@/components/Button'
import { Input } from '@/components/Input'
import { useProduct, useUpdateProduct } from '@/features/products'
import { ApiError } from '@/lib/api-client'
import { koboToNaira, nairaToKobo } from '@/lib/formatters'

const productSchema = z.object({
  name: z.string().min(2, 'Enter a product name'),
  aliases: z.string().optional(),
  defaultUnit: z.string().optional(),
  unitPrice: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === '' || Number(value) >= 0, 'Enter a valid price'),
  costPrice: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === '' || Number(value) >= 0, 'Enter a valid cost'),
  lowStockThreshold: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === '' || Number(value) >= 0, 'Enter a valid threshold'),
})

type ProductForm = z.infer<typeof productSchema>

function displayNaira(kobo: number | null | undefined): string {
  return kobo == null ? '' : String(koboToNaira(kobo))
}

function toNumber(value: string | undefined): number | null {
  return value == null || value === '' ? null : Number(value)
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, isError } = useProduct(id)
  const updateProduct = useUpdateProduct(id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) })

  useEffect(() => {
    if (!product) return
    reset({
      name: product.name,
      aliases: product.aliases.join(', '),
      defaultUnit: product.defaultUnit ?? '',
      unitPrice: displayNaira(product.unitPriceKobo),
      costPrice: displayNaira(product.costPriceKobo),
      lowStockThreshold:
        product.lowStockThreshold == null ? '' : String(product.lowStockThreshold),
    })
  }, [product, reset])

  const onSubmit = async (values: ProductForm) => {
    setSubmitError(null)
    try {
      const unitPrice = toNumber(values.unitPrice)
      const costPrice = toNumber(values.costPrice)
      await updateProduct.mutateAsync({
        name: values.name,
        aliases: values.aliases
          ? values.aliases.split(',').map((alias) => alias.trim()).filter(Boolean)
          : [],
        defaultUnit: values.defaultUnit || null,
        unitPriceKobo: unitPrice != null ? nairaToKobo(unitPrice) : null,
        costPriceKobo: costPrice != null ? nairaToKobo(costPrice) : null,
        lowStockThreshold: toNumber(values.lowStockThreshold),
      })
      navigate('/app/products')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Could not update the product.')
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Edit product" />
        <Card className="flex justify-center py-14">
          <Spinner />
        </Card>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-lg font-semibold">Product not found</h1>
        <Link to="/app/products" className="mt-3 inline-block text-sm font-semibold text-brand-700">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Edit product" subtitle={product.name} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Card className="space-y-4">
          <Input
            label="Product name"
            placeholder="e.g. Coca-Cola 50cl"
            autoFocus
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Aliases (comma separated)"
            placeholder="e.g. Coke, Coca, Coke bottle"
            hint="Voice matches these names too."
            error={errors.aliases?.message}
            {...register('aliases')}
          />
          <Input
            label="Default unit"
            placeholder="e.g. bottle, bag, mudu, crate"
            error={errors.defaultUnit?.message}
            {...register('defaultUnit')}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Selling price (₦)"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="1500"
              error={errors.unitPrice?.message}
              {...register('unitPrice')}
            />
            <Input
              label="Cost price (₦)"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="1200"
              error={errors.costPrice?.message}
              {...register('costPrice')}
            />
          </div>
          <Input
            label="Low-stock alert at"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="5"
            error={errors.lowStockThreshold?.message}
            {...register('lowStockThreshold')}
          />
        </Card>

        {submitError && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" fullWidth loading={isSubmitting}>
            Save changes
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate('/app/products')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}