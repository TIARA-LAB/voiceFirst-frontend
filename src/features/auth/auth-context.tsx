import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  api,
  clearToken,
  clearStoredUser,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '@/lib/api-client'
import type { Business, User } from '@/types'

interface AuthContextValue {
  user: User | null
  business: Business | null
  token: string | null
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<User>
  register: (payload: {
    name?: string
    phone?: string
    email?: string
    password: string
  }) => Promise<User>
  logout: () => void
  setBusiness: (business: Business | null) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const BUSINESS_KEY = 'voicefirst.business'

function readBusiness(): Business | null {
  const stored = getStoredUser<{ business?: Business }>() ?? getStoredUser<Business>()
  return stored && 'name' in stored ? (stored as Business) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>())
  const [business, setBusinessState] = useState<Business | null>(() => readBusiness())

  const persistSession = useCallback((accessToken: string, nextUser: User) => {
    setToken(accessToken)
    setStoredUser(nextUser)
    setTokenState(accessToken)
    setUser(nextUser)
  }, [])

  const login = useCallback(
    async (identifier: string, password: string): Promise<User> => {
      const result = await api.post<{ token: string; user: User }>('/auth/login', {
        identifier,
        password,
      })
      persistSession(result.token, result.user)
      return result.user
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload: {
      name?: string
      phone?: string
      email?: string
      password: string
    }): Promise<User> => {
      const result = await api.post<{ token: string; user: User }>('/auth/register', payload)
      persistSession(result.token, result.user)
      return result.user
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    clearToken()
    clearStoredUser()
    localStorage.removeItem(BUSINESS_KEY)
    setTokenState(null)
    setUser(null)
    setBusinessState(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    const me = await api.get<User>('/auth/me')
    setStoredUser(me)
    setUser(me)
  }, [token])

  const setBusiness = useCallback((next: Business | null) => {
    if (next) {
      localStorage.setItem(BUSINESS_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(BUSINESS_KEY)
    }
    setBusinessState(next)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      business,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      setBusiness,
      refreshUser,
    }),
    [user, business, token, login, register, logout, setBusiness, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}