import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { ReportSummary } from '@/types'

export type ReportPeriod = 'today' | '7d' | '30d' | 'all'

export function useDashboardReport() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => api.get<ReportSummary>('/reports/dashboard'),
  })
}

export function useProfitLossReport(period: ReportPeriod = 'all') {
  return useQuery({
    queryKey: ['reports', 'profit-loss', period],
    queryFn: () =>
      api.get<ReportSummary>(
        `/reports/profit-loss${period !== 'all' ? `?period=${period}` : ''}`,
      ),
  })
}

export interface ProductReportRow {
  productId: string
  name: string
  quantitySold: number
  revenueKobo: number
}

export function useProductReport(period: ReportPeriod = 'all') {
  return useQuery({
    queryKey: ['reports', 'products', period],
    queryFn: () =>
      api.get<ProductReportRow[]>(
        `/reports/products${period !== 'all' ? `?period=${period}` : ''}`,
      ),
  })
}