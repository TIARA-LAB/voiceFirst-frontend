import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Business } from '@/types'

export interface BusinessDraft {
  name: string
  category?: string
  country?: string
  currency?: string
  timezone?: string
  preferredLanguage?: string
}

export function useBusiness() {
  return useQuery({
    queryKey: ['business'],
    queryFn: () => api.get<Business>('/business'),
  })
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<BusinessDraft>) =>
      api.patch<Business>('/business', patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(['business'], updated)
    },
  })
}