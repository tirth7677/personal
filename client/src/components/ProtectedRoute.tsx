import { useState, useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate()

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
          // keep bcoins in sync with the source of truth
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
        <div
          className="w-8 h-8 rounded-full border-2 border-[rgba(0,191,255,0.2)] border-t-[#00BFFF] animate-spin"
        />
      </div>
    )
  }

  // Not authenticated — block page entirely with login-required modal
  if (!authenticated) {
    return (
      <div className="bg-[#05050F] text-white font-['Space_Grotesk',sans-serif] min-h-screen overflow-x-hidden relative">

        {/* GRID BACKGROUND */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,191,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,191,255,0.07) 0%, transparent 70%)' }}
          />
        </div>

        {/* Dimmed backdrop */}
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(5,5,15,0.75)', backdropFilter: 'blur(4px)' }}
        />

        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="w-full max-w-sm rounded-2xl border border-[rgba(0,191,255,0.2)] p-8 text-center"
            style={{ background: '#11112A', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <img src={logo} alt="Indian Bounty.fun" className="w-12 h-12 object-contain" />
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-5">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                           border text-[#BF5FFF] text-xs font-semibold tracking-widest uppercase"
                style={{ borderColor: 'rgba(191,95,255,0.25)', background: 'rgba(191,95,255,0.07)' }}
              >
                🔒 Login Required
              </div>
            </div>

            <h2 className="font-bold text-xl sm:text-2xl text-white mb-2">
              You need to log in
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-7">
              This page is only available to logged-in users. Please log in to continue.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="text-white font-bold text-sm tracking-wider
                           px-8 py-3.5 rounded-lg transition-all duration-200
                           hover:-translate-y-0.5 hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                  boxShadow: '0 0 24px rgba(0,191,255,0.25)',
                }}
              >
                Go to Login →
              </button>
              <Link
                to="/"
                className="text-white/40 hover:text-white/70 text-sm font-medium no-underline transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated — render the actual protected page
  return <>{children}</>
}