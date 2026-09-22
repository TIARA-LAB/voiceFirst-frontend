import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type { Product } from '@/types'

export type ProductDraft = Omit<Product, 'id' | 'businessId' | 'createdAt' | 'archived'>

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products'),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draft: ProductDraft) => api.post<Product>('/products', draft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<ProductDraft>) =>
      api.patch<Product>(`/products/${id}`, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useArchiveProduct(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ id: string }>(`/products/${id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}