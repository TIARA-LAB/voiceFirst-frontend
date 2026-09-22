import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuth } from '@/features/auth'
import { ApiError, api } from '@/lib/api-client'

export default function VerificationPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/auth/verify', { code })
      navigate('/business-setup', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const destination = user?.phone ? `+234 *** *** ${user.phone.slice(-3)}` : 'your phone'

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-bold text-brand-700">VoiceFirst</p>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Verify your identity</h1>
        <p className="mt-1 text-sm text-slate-500">
          We sent a one-time code to {destination}. Enter it below.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <Input
            label="Verification code"
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          />

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button type="submit" fullWidth size="lg" disabled={code.length < 6} loading={submitting}>
            Verify
          </Button>
        </form>
      </div>
    </div>
  )
}