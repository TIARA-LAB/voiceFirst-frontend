export type TransactionIntent =
  | 'sale'
  | 'purchase'
  | 'expense'
  | 'stock_in'
  | 'debt'
  | 'payment'

export type PaymentMethod =
  | 'cash'
  | 'transfer'
  | 'pos'
  | 'credit'
  | 'partial'
  | 'unknown'

export type VoiceState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'recorded'
  | 'queued_offline'
  | 'uploading'
  | 'processing'
  | 'awaiting_confirmation'
  | 'confirming'
  | 'completed'
  | 'failed'

export type SyncState =
  | 'local_recorded'
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'awaiting_confirmation'
  | 'confirmed'
  | 'syncing'
  | 'synced'
  | 'failed'

export interface User {
  id: string
  phone?: string | null
  email?: string | null
  verified: boolean
  createdAt: string
}

export interface Business {
  id: string
  name: string
  category: string | null
  country: string
  currency: string
  timezone: string
  preferredLanguage: string | null
  dailySummaryTime: string
  onboardingCompleted: boolean
  createdAt: string
}

export interface ProductContext {
  id: string
  name: string
  aliases: string[]
  defaultUnit: string | null
  unitPriceKobo: number | null
  costPriceKobo: number | null
}

export interface ParsedTransactionItem {
  name: string | null
  quantity: number | null
  unit: string | null
  unitPriceKobo: number | null
  lineTotalKobo: number | null
  matchedProductId: string | null
  confidence: number
}

export interface ParsedTransaction {
  intent: TransactionIntent
  items: ParsedTransactionItem[]
  totalKobo: number | null
  paymentMethod: PaymentMethod | null
  counterparty: string | null
  confidence: number
  missingFields: string[]
  ambiguities: string[]
}

export interface PendingConfirmation {
  id: string
  businessId: string
  parsed: ParsedTransaction
  state: 'pending' | 'confirmed' | 'cancelled' | 'expired'
  expiresAt: string
  createdAt: string
}

export interface Product {
  id: string
  businessId: string
  name: string
  aliases: string[]
  defaultUnit: string | null
  unitPriceKobo: number | null
  costPriceKobo: number | null
  openingStock: number | null
  lowStockThreshold: number | null
  archived: boolean
  createdAt: string
}

export interface TransactionItem {
  id: string
  transactionId: string
  productId: string | null
  productName: string | null
  quantity: number
  unit: string | null
  unitPriceKobo: number | null
  lineTotalKobo: number | null
}

export interface Transaction {
  id: string
  businessId: string
  intent: TransactionIntent
  items: TransactionItem[]
  totalKobo: number
  paymentMethod: PaymentMethod | null
  counterparty: string | null
  reversed: boolean
  source: string
  createdAt: string
}

export interface Debtor {
  id: string
  businessId: string
  name: string
  phone: string | null
  outstandingBalanceKobo: number
  settled: boolean
  createdAt: string
}

export interface StockMovement {
  id: string
  businessId: string
  productId: string
  delta: number
  quantityAfter: number
  reason: string
  transactionId: string | null
  createdAt: string
}

export interface ReportSummary {
  revenueKobo: number
  costOfGoodsSoldKobo: number
  grossProfitKobo: number
  expensesKobo: number
  estimatedNetProfitKobo: number
  transactionCount: number
  estimated: boolean
}