/**
 * Typed fetch wrapper for the NestJS REST API.
 * Attaches the bearer token, serializes JSON, and normalizes errors.
 */

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? '/api'

const TOKEN_KEY = 'voicefirst.token'
const USER_KEY = 'voicefirst.user'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setStoredUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function newIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  idempotencyKey?: string
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface ApiResponse<T> {
  status: number
  data: T
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, idempotencyKey, headers, signal } = options

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  if (idempotencyKey) {
    requestHeaders['Idempotency-Key'] = idempotencyKey
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? 'Request timed out'
        : 'You appear to be offline. Please check your connection.'
    throw new ApiError(0, message, 'network_error')
  }

  let payload: unknown = null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null)
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`
    const code =
      payload && typeof payload === 'object' && 'code' in payload
        ? String((payload as { code: unknown }).code)
        : undefined
    if (response.status === 401) {
      clearToken()
      clearStoredUser()
    }
    throw new ApiError(response.status, message, code, payload)
  }

  return payload as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}

export function uploadAudio(
  blob: Blob,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const formData = new FormData()
  formData.append('audio', blob, `recording-${idempotencyKey}.webm`)
  formData.append(
    'metadata',
    JSON.stringify({ mimeType: blob.type, size: blob.size }),
  )

  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  headers['Idempotency-Key'] = idempotencyKey

  return fetch(`${API_BASE_URL}/audio`, {
    method: 'POST',
    headers,
    body: formData,
    signal,
  }).then(async (response) => {
    if (!response.ok) {
      let message = `Upload failed with status ${response.status}`
      try {
        const payload = (await response.json()) as { message?: string }
        if (payload.message) message = payload.message
      } catch {
        // ignore malformed body
      }
      throw new ApiError(response.status, message, 'upload_failed')
    }
    return response.json()
  })
}