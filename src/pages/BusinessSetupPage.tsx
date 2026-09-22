import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Select } from '@/components/Input'
import { useUpdateBusiness } from '@/features/business'
import { useAuth } from '@/features/auth'
import { ApiError } from '@/lib/api-client'

const businessSchema = z.object({
  name: z.string().min(2, 'Enter your business name'),
  category: z.string().optional(),
  preferredLanguage: z.string().optional(),
})

type BusinessForm = z.infer<typeof businessSchema>

const CATEGORIES = [
  'Provision store',
  'Foodstuff',
  'Beverages / drinks',
  'Small supermarket',
  'Cosmetics',
  'Household goods',
  'Clothing and accessories',
  'Spare parts / electronics',
  'Other',
]

export default function BusinessSetupPage() {
  const { setBusiness } = useAuth()
  const updateBusiness = useUpdateBusiness()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessForm>({ resolver: zodResolver(businessSchema) })

  const onSubmit = async (values: BusinessForm) => {
    setSubmitError(null)
    try {
      const updated = await updateBusiness.mutateAsync({
        name: values.name,
        category: values.category || undefined,
        preferredLanguage: values.preferredLanguage || undefined,
      })
      setBusiness(updated)
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : 'Could not save business details.',
      )
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-bold text-brand-700">VoiceFirst</p>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Tell us about your business</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your records will be kept private and organised under this business.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="Business name"
            placeholder="Aisha's Provision Store"
            autoFocus
            error={errors.name?.message}
            {...register('name')}
          />

          <Select label="Business category (optional)" {...register('category')}>
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>

          <Select label="Preferred language (optional)" {...register('preferredLanguage')}>
            <option value="">Not selected</option>
            <option value="en">English</option>
            <option value="en-pidgin">Nigerian Pidgin</option>
          </Select>

          {submitError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Continue to dashboard
          </Button>
        </form>
      </div>
    </div>
  )
}