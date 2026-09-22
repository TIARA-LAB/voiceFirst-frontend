import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuth } from '@/features/auth'
import { ApiError } from '@/lib/api-client'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your phone number or email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginForm) => {
    setSubmitError(null)
    try {
      await login(values.identifier, values.password)
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Login failed. Try again.')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-bold text-brand-700">VoiceFirst</p>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in with your phone or email.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <Input
            label="Phone or email"
            autoComplete="username"
            placeholder="0801 234 5678 or you@example.com"
            error={errors.identifier?.message}
            {...register('identifier')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {submitError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to VoiceFirst?{' '}
          <Link to="/register" className="font-semibold text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}