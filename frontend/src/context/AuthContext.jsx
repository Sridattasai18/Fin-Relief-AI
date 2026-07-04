import { createContext, useContext, useState, useCallback } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

const TOKEN_KEY = 'finrelief_token'
const USER_KEY  = 'finrelief_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user,  setUser]  = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const _persist = useCallback((tokenValue, userObj) => {
    localStorage.setItem(TOKEN_KEY, tokenValue)
    localStorage.setItem(USER_KEY, JSON.stringify(userObj))
    setToken(tokenValue)
    setUser(userObj)
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const { data } = await client.post('/auth/register', { name, email, password })
    _persist(data.access_token, data.user)
    return data
  }, [_persist])

  const login = useCallback(async ({ email, password }) => {
    const { data } = await client.post('/auth/login', { email, password })
    _persist(data.access_token, data.user)
    return data
  }, [_persist])

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout')
    } catch {
      // Swallow — blacklist happens server-side, we clear client regardless
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
    }
  }, [])

  /**
   * "Try Demo" flow:
   * 1. Attempt to login with the shared demo account.
   * 2. If login fails (not registered yet), register it, then seed demo loans.
   * 3. Redirect handled by the caller component.
   */
  const tryDemo = useCallback(async () => {
    const DEMO_EMAIL    = 'demo@finrelief.ai'
    const DEMO_PASSWORD = 'finrelief-demo-2024'
    const DEMO_NAME     = 'Demo User'

    try {
      // Try login first
      return await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
    } catch {
      // Account doesn't exist — register then seed
      const result = await register({
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      try {
        await client.post('/demo/seed')
      } catch {
        // Seed may already exist — not a fatal error
      }
      return result
    }
  }, [login, register])

  const isAuthenticated = Boolean(token && user)

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, register, login, logout, tryDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
