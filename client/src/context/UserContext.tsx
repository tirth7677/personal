import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface User {
  id: number
  username: string
  bcoins: number
}

interface UserContextValue {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
  clearUser: () => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success && data.data?.user) {
        setUser(data.data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
  }, [])

  // Fetch once when the app first mounts — every page sharing this provider
  // reads from the same state, so no two components ever show different numbers.
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return ctx
}