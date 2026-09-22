import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useCreateProduct } from '@/features/products'
import { ApiError } from '@/lib/api-client'
import { nairaToKobo } from '@/lib/formatters'

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
  openingStock: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === '' || Number(value) >= 0, 'Enter a valid quantity'),
  lowStockThreshold: z
    .string()
    .optional()
    .refine((value) => value === undefined || value === '' || Number(value) >= 0, 'Enter a valid threshold'),
})

type ProductForm = z.infer<typeof productSchema>

function toOptionalNumber(value: string): number | null {
  return value === '' ? null : Number(value)
}

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const createProduct = useCreateProduct()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) })

  const onSubmit = async (values: ProductForm) => {
    setSubmitError(null)
    try {
      await createProduct.mutateAsync({
        name: values.name,
        aliases: values.aliases
          ? values.aliases.split(',').map((alias) => alias.trim()).filter(Boolean)
          : [],
        defaultUnit: values.defaultUnit || null,
        unitPriceKobo: toOptionalNumber(values.unitPrice ?? '') != null ? nairaToKobo(Number(values.unitPrice)) : null,
        costPriceKobo: toOptionalNumber(values.costPrice ?? '') != null ? nairaToKobo(Number(values.costPrice)) : null,
        openingStock: toOptionalNumber(values.openingStock ?? ''),
        lowStockThreshold: toOptionalNumber(values.lowStockThreshold ?? ''),
      })
      navigate('/app/products')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Could not save the product.')
    }
  }

  return (
    <div>
      <PageHeader title="Add product" subtitle="Prices are stored safely as kobo." />

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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Opening stock"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="15"
              error={errors.openingStock?.message}
              {...register('openingStock')}
            />
            <Input
              label="Low-stock alert at"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="5"
              error={errors.lowStockThreshold?.message}
              {...register('lowStockThreshold')}
            />
          </div>
        </Card>

        {submitError && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
        )}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Save product
        </Button>
      </form>
    </div>
  )
}