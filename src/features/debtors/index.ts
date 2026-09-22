import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Debtor } from '@/types'

export function useDebtors() {
  return useQuery({
    queryKey: ['debtors'],
    queryFn: () => api.get<Debtor[]>('/debtors'),
  })
}

export function useDebtor(id?: string) {
  return useQuery({
    queryKey: ['debtors', id],
    queryFn: () => api.get<Debtor>(`/debtors/${id}`),
    enabled: Boolean(id),
  })
}

export function useDebtorPayment(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { amountKobo: number; notes?: string }) =>
      api.post<Debtor>(`/debtors/${id}/payments`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useSetDebtorSettled(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { settled: boolean }) =>
      api.patch<Debtor>(`/debtors/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debtors'] })
    },
  })
}