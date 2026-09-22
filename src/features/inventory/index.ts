import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { StockMovement } from '@/types'

export interface StockEntry {
  productId: string
  name: string
  unit: string | null
  currentQuantity: number
  lowStockThreshold: number | null
}

export function useStock() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: () => api.get<StockEntry[]>('/stock'),
  })
}

export function useStockMovements(productId?: string) {
  return useQuery({
    queryKey: ['stock', 'movements', productId],
    queryFn: () => api.get<StockMovement[]>(`/stock/${productId}/movements`),
    enabled: Boolean(productId),
  })
}

export function useStockAdjustment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { productId: string; delta: number; reason: string }) =>
      api.post<StockMovement>('/stock/adjustments', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}