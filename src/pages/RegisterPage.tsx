import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuth } from '@/features/auth'
import { ApiError } from '@/lib/api-client'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    phone: z.string().regex(/^\+?\d{7,15}$/, 'Enter a valid phone number'),
    email: z.union([z.literal(''), z.email('Enter a valid email')]).optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterForm) => {
    setSubmitError(null)
    try {
      await registerUser({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        password: values.password,
      })
      navigate('/business-setup', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Registration failed. Try again.')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-bold text-brand-700">VoiceFirst</p>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start recording your business by voice.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Aisha Mohammed"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Phone number"
            autoComplete="tel"
            placeholder="0801 234 5678"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Email (optional)"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {submitError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}