/**
 * Formatting helpers. All monetary values in the domain are expressed as
 * integer kobo and converted only at the presentation boundary.
 */

export const NAIRA_PER_KOBO = 100

export function koboToNaira(kobo: number): number {
  return kobo / NAIRA_PER_KOBO
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * NAIRA_PER_KOBO)
}

export function formatKoboAsNaira(
  kobo: number | null | undefined,
  options: { decimals?: boolean; compact?: boolean } = {},
): string {
  if (kobo == null) return '—'
  const { decimals = false, compact = false } = options
  const naira = koboToNaira(kobo)
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
    ...(compact ? { notation: 'compact' as const } : {}),
  }).format(naira)
  return formatted
}

export function formatQuantity(
  quantity: number | null | undefined,
  unit?: string | null,
): string {
  if (quantity == null) return '—'
  const numeric = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 2 }).format(quantity)
  return unit ? `${numeric} ${unit}` : numeric
}

export function formatDateTime(input: string | number | Date): string {
  const date = typeof input === 'object' ? input : new Date(input)
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDate(input: string | number | Date): string {
  const date = typeof input === 'object' ? input : new Date(input)
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDuration(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}