import type { Transaction } from '@/types'

export interface BestSeller {
  name: string
  quantity: number
  revenueKobo: number
}

export interface CreditActivity {
  newCreditKobo: number
  paymentsKobo: number
  creditCount: number
  paymentCount: number
}

export interface Totals {
  revenueKobo: number
  expensesKobo: number
  count: number
}

export function bestSellers(
  transactions: Transaction[],
  limit = 5,
): BestSeller[] {
  const aggregate = new Map<string, BestSeller>()

  for (const transaction of transactions) {
    if (transaction.intent !== 'sale' || transaction.reversed) continue
    for (const item of transaction.items) {
      if (!item.productName) continue
      const current =
        aggregate.get(item.productName) ?? {
          name: item.productName,
          quantity: 0,
          revenueKobo: 0,
        }
      current.quantity += item.quantity
      current.revenueKobo += item.lineTotalKobo ?? 0
      aggregate.set(item.productName, current)
    }
  }

  return [...aggregate.values()]
    .sort((a, b) => b.revenueKobo - a.revenueKobo)
    .slice(0, limit)
}

export function creditActivity(transactions: Transaction[]): CreditActivity {
  let newCreditKobo = 0
  let paymentsKobo = 0
  let creditCount = 0
  let paymentCount = 0

  for (const transaction of transactions) {
    if (transaction.reversed) continue
    if (transaction.intent === 'debt') {
      newCreditKobo += transaction.totalKobo
      creditCount += 1
    } else if (transaction.intent === 'payment') {
      paymentsKobo += transaction.totalKobo
      paymentCount += 1
    }
  }

  return { newCreditKobo, paymentsKobo, creditCount, paymentCount }
}

export function totals(transactions: Transaction[]): Totals {
  let revenueKobo = 0
  let expensesKobo = 0
  let count = 0

  for (const transaction of transactions) {
    if (transaction.reversed) continue
    count += 1
    if (transaction.intent === 'sale') {
      revenueKobo += transaction.totalKobo
    } else if (
      transaction.intent === 'expense' ||
      transaction.intent === 'purchase'
    ) {
      expensesKobo += transaction.totalKobo
    }
  }

  return { revenueKobo, expensesKobo, count }
}

export function inPeriod(timestamp: string, period: string): boolean {
  if (period === 'all') return true
  const date = new Date(timestamp)
  const days = period === 'today' ? 0 : period === '7d' ? 6 : period === '30d' ? 29 : 0
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - days)
  return date >= cutoff
}