import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { Spinner } from '@/components/Button'

export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function PublicOnly() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }
  return <Outlet />
}

export function FullScreenLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50">
      <Spinner size="lg" />
    </div>
  )
}