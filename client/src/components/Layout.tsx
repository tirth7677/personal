import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { useUser } from '../context/UserContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearUser } = useUser()

  const [profileOpen, setProfileOpen] = useState(false)
  const [bountyOpen, setBountyOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const bountyRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (bountyRef.current && !bountyRef.current.contains(e.target as Node)) {
        setBountyOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      // proceed with client-side logout even if the request fails
    } finally {
      clearUser()
      localStorage.removeItem('user')
      navigate('/')
    }
  }

  const isActive = (path: string) => location.pathname === path
  const isBountyActive = isActive('/bounty/create') || isActive('/bounty/mine')

  const firstLetter = user?.username ? user.username.charAt(0).toUpperCase() : '?'

  return (
    <div className="bg-[#05050F] text-white font-['Space_Grotesk',sans-serif] min-h-screen overflow-x-hidden flex flex-col">

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

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between
                   px-4 sm:px-6 lg:px-10 h-16
                   border-b border-[rgba(0,191,255,0.1)]"
        style={{ background: 'rgba(5,5,15,0.9)', backdropFilter: 'blur(12px)' }}
      >
        {/* Left — Logo + Name */}
        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline shrink-0">
          <img src={logo} alt="Indian Bounty.fun" className="w-8 h-8 object-contain" />
          <span className="font-bold text-base sm:text-lg tracking-tight hidden sm:inline">
            <span className="text-white">Indian </span>
            <span className="text-[#00BFFF]">Bounty</span>
            <span className="text-[#BF5FFF]">.</span>
            <span className="text-white">fun</span>
          </span>
        </Link>

        {/* Center — Bounty dropdown / Participant (desktop) */}
        <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">

          {/* Bounty dropdown */}
          <div className="relative" ref={bountyRef}>
            <button
              onClick={() => setBountyOpen(!bountyOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold tracking-widest uppercase
                          transition-all duration-200 border bg-transparent cursor-pointer
                          ${isBountyActive
                            ? 'text-[#00BFFF] border-[#00BFFF] bg-[rgba(0,191,255,0.1)]'
                            : 'text-white/50 border-transparent hover:text-white hover:border-[rgba(0,191,255,0.2)]'}`}
            >
              Bounty
              <span className={`text-[0.6rem] transition-transform duration-200 ${bountyOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {bountyOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-12 w-48 rounded-xl border border-[rgba(0,191,255,0.15)]
                           overflow-hidden z-50"
                style={{ background: '#11112A', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                <Link
                  to="/bounty/create"
                  onClick={() => setBountyOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm no-underline border-b border-white/5
                              transition-colors duration-150
                              ${isActive('/bounty/create')
                                ? 'text-[#00BFFF] bg-[rgba(0,191,255,0.08)]'
                                : 'text-white/70 hover:bg-[rgba(0,191,255,0.08)] hover:text-white'}`}
                >
                  <span>🎯</span> Create Bounty
                </Link>
                <Link
                  to="/bounty/mine"
                  onClick={() => setBountyOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm no-underline
                              transition-colors duration-150
                              ${isActive('/bounty/mine')
                                ? 'text-[#00BFFF] bg-[rgba(0,191,255,0.08)]'
                                : 'text-white/70 hover:bg-[rgba(0,191,255,0.08)] hover:text-white'}`}
                >
                  <span>📋</span> View My Bounty
                </Link>
              </div>
            )}
          </div>

          {/* Participant */}
          <Link
            to="/participant"
            className={`px-4 py-2 rounded-md text-xs font-bold tracking-widest uppercase no-underline
                        transition-all duration-200 border
                        ${isActive('/participant')
                          ? 'text-[#BF5FFF] border-[#BF5FFF] bg-[rgba(191,95,255,0.1)]'
                          : 'text-white/50 border-transparent hover:text-white hover:border-[rgba(191,95,255,0.2)]'}`}
          >
            Participant
          </Link>
        </div>

        {/* Right — Bcoin balance + Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">

          {/* Bcoin balance pill — display only, not clickable */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       border border-[rgba(0,191,255,0.2)] cursor-default select-none"
            style={{ background: 'rgba(0,191,255,0.06)' }}
          >
            <span className="text-sm">🪙</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-[#00BFFF]">
              {(user?.bcoins ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center
                         border border-[rgba(0,191,255,0.25)] bg-transparent cursor-pointer
                         hover:border-[rgba(0,191,255,0.5)] transition-all duration-200
                         font-bold text-sm text-[#BF5FFF]"
              style={{ background: 'rgba(191,95,255,0.08)' }}
              aria-label="Profile menu"
            >
              {firstLetter}
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-12 w-56 rounded-xl border border-[rgba(0,191,255,0.15)]
                           overflow-hidden z-50"
                style={{ background: '#11112A', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                {/* Username header */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="text-white/35 text-[0.65rem] font-semibold tracking-wide uppercase mb-0.5">
                    Signed in as
                  </div>
                  <div className="text-white text-sm font-bold truncate">
                    {user?.username ?? 'Loading...'}
                  </div>
                </div>

                <Link
                  to="/wallet"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/70
                             hover:bg-[rgba(0,191,255,0.08)] hover:text-white
                             transition-colors duration-150 no-underline border-b border-white/5"
                >
                  <span>💳</span> Payment
                </Link>
                <Link
                  to="/payment"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/70
                             hover:bg-[rgba(0,191,255,0.08)] hover:text-white
                             transition-colors duration-150 no-underline border-b border-white/5"
                >
                  <span>🧾</span> Payment History
                </Link>
                <Link
                  to="/bcoins/history"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/70
                             hover:bg-[rgba(0,191,255,0.08)] hover:text-white
                             transition-colors duration-150 no-underline border-b border-white/5"
                >
                  <span>🪙</span> Bcoins History
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#FF2D78]
                             hover:bg-[rgba(255,45,120,0.08)]
                             transition-colors duration-150 w-full text-left bg-transparent border-0 cursor-pointer"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger for center nav links */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1 bg-transparent border-0 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-white/50 rounded" />
            <span className="block w-5 h-0.5 bg-white/50 rounded" />
            <span className="block w-5 h-0.5 bg-white/50 rounded" />
          </button>
        </div>
      </nav>

      {/* Mobile menu — Bounty links / Participant */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed top-16 left-0 right-0 z-40
                     flex flex-col gap-3 px-4 py-4
                     border-b border-[rgba(0,191,255,0.1)]"
          style={{ background: 'rgba(5,5,15,0.97)', backdropFilter: 'blur(12px)' }}
        >
          <div className="text-white/30 text-[0.65rem] font-semibold tracking-widest uppercase px-1">Bounty</div>
          <Link
            to="/bounty/create"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-center px-4 py-3 rounded-lg text-sm font-bold tracking-wider uppercase no-underline border
                        ${isActive('/bounty/create')
                          ? 'text-[#00BFFF] border-[#00BFFF] bg-[rgba(0,191,255,0.1)]'
                          : 'text-white/60 border-white/10'}`}
          >
            Create Bounty
          </Link>
          <Link
            to="/bounty/mine"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-center px-4 py-3 rounded-lg text-sm font-bold tracking-wider uppercase no-underline border
                        ${isActive('/bounty/mine')
                          ? 'text-[#00BFFF] border-[#00BFFF] bg-[rgba(0,191,255,0.1)]'
                          : 'text-white/60 border-white/10'}`}
          >
            View My Bounty
          </Link>

          <div className="text-white/30 text-[0.65rem] font-semibold tracking-widest uppercase px-1 mt-2">Participant</div>
          <Link
            to="/participant"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-center px-4 py-3 rounded-lg text-sm font-bold tracking-wider uppercase no-underline border
                        ${isActive('/participant')
                          ? 'text-[#BF5FFF] border-[#BF5FFF] bg-[rgba(191,95,255,0.1)]'
                          : 'text-white/60 border-white/10'}`}
          >
            Participant
          </Link>
        </div>
      )}

      {/* ══════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════ */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer
        className="relative z-10 px-4 sm:px-8 lg:px-16 py-8
                   flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap
                   border-t border-[rgba(0,191,255,0.1)]"
      >
        <div className="font-bold text-base">
          <span className="text-white">Indian </span>
          <span className="text-[#00BFFF]">Bounty</span>
          <span className="text-[#BF5FFF]">.</span>
          <span className="text-white">fun</span>
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          {[
            { label: 'Terms',   href: '/terms' },
            { label: 'Privacy', href: '/privacy' },
          ].map(({ label, href }) => (
            <Link key={label} to={href} className="text-white/30 hover:text-[#00BFFF] text-xs no-underline transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <div className="text-white/25 text-xs">© 2026 Indian Bounty.fun · Made in India 🇮🇳</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
      `}</style>
    </div>
  )
}