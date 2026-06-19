import { useState, useEffect, type ReactNode } from 'react'
import LoginRequiredModal from './LoginRequiredModal'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        const data = await res.json()

        if (cancelled) return

        if (res.ok && data.success) {
          const stored = localStorage.getItem('user')
          if (stored) {
            try {
              const existing = JSON.parse(stored)
              localStorage.setItem('user', JSON.stringify({ ...existing, ...data.data.user }))
            } catch {
              localStorage.setItem('user', JSON.stringify(data.data.user))
            }
          }
          setAuthenticated(true)
        } else {
          setAuthenticated(false)
        }
      } catch {
        if (!cancelled) setAuthenticated(false)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [])

  // While checking, render nothing visible — blocks any flash of protected content
  if (checking) {
    return (
      <div className="bg-[#05050F] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(0,191,255,0.2)] border-t-[#00BFFF] animate-spin" />
      </div>
    )
  }

  // Not authenticated — block page entirely with login-required modal.
  // onClose is a no-op here since there's no underlying page content to "go back to" —
  // the protected page itself never rendered.
  if (!authenticated) {
    return (
      <div className="bg-[#05050F] min-h-screen relative">
        <LoginRequiredModal onClose={() => {}} />
      </div>
    )
  }

  // Authenticated — render the actual protected page
  return <>{children}</>
}