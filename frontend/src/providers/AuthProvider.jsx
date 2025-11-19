import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import { AUTH_EVENTS, subscribeAuthEvents } from '../utils/authEvents'

const AuthContext = createContext(null)
const USER_KEY = 'socialhub:user'
const TOKEN_KEY = 'socialhub:token'
const DEMO_TOKEN = 'demo-token'

const buildDemoUser = (payload) => ({
  id: 0,
  name: payload?.name || payload?.email?.split('@')?.[0] || 'Product Explorer',
  email: payload?.email || 'demo@social.app',
  headline: 'Exploring SocialSphere',
})

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      delete apiClient.defaults.headers.common.Authorization
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  const enterDemoMode = useCallback(
    (payload) => {
      const demoUser = buildDemoUser(payload)
      setUser(demoUser)
      setToken(DEMO_TOKEN)
      setError(null)
      return demoUser
    },
    [],
  )

  const authenticate = useCallback(async (endpoint, payload, { allowDemoFallback = false } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.post(endpoint, payload)
      setUser(data.user)
      setToken(data.token)
      return data.user
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to reach the server. Please try again.'
      setError(message)
      if (!err.response && allowDemoFallback) {
        return enterDemoMode(payload)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [enterDemoMode])

  const login = useCallback((credentials) => authenticate('/auth/login', credentials), [authenticate])
  const register = useCallback(
    (payload) => authenticate('/auth/register', payload, { allowDemoFallback: true }),
    [authenticate],
  )

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setError(null)
  }, [])

  const updateProfile = useCallback(
    async (updates) => {
      setLoading(true)
      try {
        const { data } = await apiClient.put('/users/me', updates)
        setUser((prev) => ({ ...prev, ...data }))
        return data
      } catch (err) {
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, logout, updateProfile, enterDemoMode }),
    [user, token, loading, error, login, register, logout, updateProfile, enterDemoMode],
  )

  useEffect(() => {
    const unsubscribe = subscribeAuthEvents((event) => {
      if (event.type === AUTH_EVENTS.UNAUTHORIZED) {
        logout()
        setError(event.message || 'Please log in again.')
        navigate('/auth/login', { replace: true })
      }
    })
    return unsubscribe
  }, [logout, navigate])

  useEffect(() => {
    if (!token || token === DEMO_TOKEN) return undefined

    let active = true

    const hydrateUser = async () => {
      setLoading(true)
      try {
        const { data } = await apiClient.get('/users/me')
        if (active) {
          setUser(data)
        }
      } catch (err) {
        if (!active) return
        if (!err.response) {
          setError('Unable to reach the server. Please check your connection.')
          return
        }
        if (err.response.status !== 401) {
          const message = err.response?.data?.message || 'Failed to refresh your session.'
          setError(message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    hydrateUser()

    return () => {
      active = false
      setLoading(false)
    }
  }, [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
