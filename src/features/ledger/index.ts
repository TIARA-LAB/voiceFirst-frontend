import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Transaction } from '@/types'

export interface TransactionFilters {
  dateFrom?: string
  dateTo?: string
  intent?: string
  productId?: string
  search?: string
}

export function useTransactions(filters: TransactionFilters = {}) {
  const queryKey = ['transactions', filters]
  const queryFn = () => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value)
    }
    const qs = params.toString()
    return api.get<Transaction[]>(`/transactions${qs ? `?${qs}` : ''}`)
  }
  return useQuery({ queryKey, queryFn })
}

export function useTransaction(id?: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => api.get<Transaction>(`/transactions/${id}`),
    enabled: Boolean(id),
  })
}

export function useReverseTransaction(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ id: string }>(`/transactions/${id}/reverse`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard'] })
    },
  })
}