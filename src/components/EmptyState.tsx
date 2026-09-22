import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}

export function EmptyState({ icon, title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </span>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-1 inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}