import { Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PagePlaceholderProps {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Construction className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">{description}</p>
      </div>
      <Link
        to="/app/dashboard"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
      >
        Back to dashboard
      </Link>
    </div>
  )
}