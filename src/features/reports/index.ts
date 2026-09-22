import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { ReportSummary } from '@/types'

export function useDashboardReport() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: () => api.get<ReportSummary>('/reports/dashboard'),
  })
}

export function useProfitLossReport() {
  return useQuery({
    queryKey: ['reports', 'profit-loss'],
    queryFn: () => api.get<ReportSummary>('/reports/profit-loss'),
  })
}