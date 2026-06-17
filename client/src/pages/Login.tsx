import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // REQUIRED — lets the browser store & send the httpOnly cookie
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Logged in successfully' })

        // Optional: keep basic user info in memory for UI use (NOT the token — that's httpOnly, JS can't see it)
        if (data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }

        setTimeout(() => navigate('/dashboard'), 1000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid email or password.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not connect to server. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#05050F] text-white font-['Space_Grotesk',sans-serif] min-h-screen overflow-x-hidden">

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

      {/* NAVBAR */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 lg:px-12 h-16 border-b border-[rgba(0,191,255,0.1)]"
        style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src={logo} alt="Indian Bounty.fun" className="w-8 h-8 object-contain" />
          <span className="font-bold text-base sm:text-lg tracking-tight">
            <span className="text-white">Indian </span>
            <span className="text-[#00BFFF]">Bounty</span>
            <span className="text-[#BF5FFF]">.</span>
            <span className="text-white">fun</span>
          </span>
        </Link>
        <Link
          to="/"
          className="px-4 sm:px-5 py-2 rounded-md border border-[#00BFFF] text-[#00BFFF] text-xs font-bold tracking-widest uppercase hover:bg-[rgba(0,191,255,0.1)] transition-all duration-200 no-underline"
        >
          Home
        </Link>
      </nav>

      {/* LOGIN FORM */}
      <section className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-8 py-10 sm:py-12">
        <div className="w-full max-w-md">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                         border text-[#BF5FFF] text-xs font-semibold tracking-widest uppercase"
              style={{ borderColor: 'rgba(191,95,255,0.25)', background: 'rgba(191,95,255,0.07)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#BF5FFF]"
                style={{ animation: 'pulseDot 1.8s ease-in-out infinite' }}
              />
              Welcome Back
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-center tracking-tight text-white mb-2">
            Log In
          </h1>
          <p className="text-white/40 text-xs sm:text-sm text-center mb-8 px-2">
            Enter your details to access your bounties and wallet.
          </p>

          {/* Card */}
          <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-5 sm:p-8">

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg text-white text-sm placeholder-white/25
                             focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-16 rounded-lg text-white text-sm placeholder-white/25
                               focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-[#00BFFF] text-xs font-bold tracking-wide uppercase
                               bg-transparent border-0 cursor-pointer
                               hover:opacity-70 transition-opacity"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Inline API message */}
              {message && (
                <div
                  className={`flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm font-medium border ${
                    message.type === 'success'
                      ? 'text-[#00BFFF] border-[rgba(0,191,255,0.35)]'
                      : 'text-[#FF2D78] border-[rgba(255,45,120,0.35)]'
                  }`}
                  style={{
                    background:
                      message.type === 'success'
                        ? 'rgba(0,191,255,0.1)'
                        : 'rgba(255,45,120,0.1)',
                  }}
                >
                  <span className="shrink-0">{message.type === 'success' ? '✓' : '⚠'}</span>
                  <span className="leading-relaxed">{message.text}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="text-white font-bold text-sm tracking-wider
                           px-8 py-3.5 rounded-lg transition-all duration-200 mt-2
                           hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                  boxShadow: '0 0 24px rgba(0,191,255,0.25)',
                }}
              >
                {loading ? 'Logging in...' : 'Log In →'}
              </button>

            </form>

          </div>

          {/* Register link */}
          <p className="text-center text-white/40 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00BFFF] hover:opacity-70 transition-opacity no-underline font-semibold">
              Create one
            </Link>
          </p>

        </div>
      </section>

      {/* FOOTER */}
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

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  )
}