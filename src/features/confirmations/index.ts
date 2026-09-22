import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { PendingConfirmation } from '@/types'

export function useConfirmation(id?: string) {
  return useQuery({
    queryKey: ['confirmations', id],
    queryFn: () => api.get<PendingConfirmation>(`/confirmations/${id}`),
    enabled: Boolean(id),
    retry: 1,
  })
}

export function useConfirmDraft(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ id: string }>(`/confirmations/${id}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations', id] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['reports', 'dashboard'] })
    },
  })
}

export function useCancelDraft(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ id: string }>(`/confirmations/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmations', id] })
    },
  })
}