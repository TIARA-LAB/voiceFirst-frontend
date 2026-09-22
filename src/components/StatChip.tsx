import { Card } from '@/components/Card'

export interface StatChipProps {
  label: string
  value: string
  tone?: 'neutral' | 'brand' | 'danger' | 'warning'
  sub?: string
}

const valueTones = {
  neutral: 'text-slate-900',
  brand: 'text-brand-700',
  danger: 'text-red-600',
  warning: 'text-amber-600',
} as const

export function StatChip({ label, value, tone = 'neutral', sub }: StatChipProps) {
  return (
    <Card className="p-3.5">
      <p className="truncate text-xs text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-lg font-bold ${valueTones[tone]}`}>{value}</p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-slate-400">{sub}</p>}
    </Card>
  )
}