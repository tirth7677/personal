import { Link } from 'react-router-dom'

export default function NotFound() {
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
          <span className="font-bold text-lg tracking-tight">
            <span className="text-white">Indian </span>
            <span className="text-[#00BFFF]">Bounty</span>
            <span className="text-[#BF5FFF]">.</span>
            <span className="text-white">fun</span>
          </span>
        </Link>
        <Link
          to="/"
          className="px-5 py-2 rounded-md border border-[#00BFFF] text-[#00BFFF] text-xs font-bold tracking-widest uppercase hover:bg-[rgba(0,191,255,0.1)] transition-all duration-200 no-underline"
        >
          Home
        </Link>
      </nav>

      {/* 404 CONTENT */}
      <section
        className="relative z-10 min-h-[calc(100vh-64px)]
                   flex flex-col items-center justify-center text-center
                   px-4 sm:px-8 py-20"
      >
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8
                     border text-[#BF5FFF] text-xs font-semibold tracking-widest uppercase"
          style={{ borderColor: 'rgba(191,95,255,0.25)', background: 'rgba(191,95,255,0.07)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#BF5FFF]"
            style={{ animation: 'pulseDot 1.8s ease-in-out infinite' }}
          />
          Error 404
        </div>

        {/* Big glowing 404 */}
        <h1
          className="font-bold leading-[1] tracking-tight text-7xl sm:text-8xl lg:text-9xl mb-6"
          style={{
            background: 'linear-gradient(90deg, #00BFFF 0%, #BF5FFF 60%, #FF2D78 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>

        {/* Message */}
        <h2 className="font-bold text-2xl sm:text-3xl text-white mb-4">
          This bounty doesn't exist
        </h2>
        <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-md mb-10">
          The page you're looking for has been claimed, moved, or never existed in the first place.
          Let's get you back on track.
        </p>

        {/* CTA */}
        <Link
          to="/"
          className="text-white font-bold text-sm tracking-wider
                     px-8 py-3.5 rounded-lg transition-all duration-200
                     hover:-translate-y-0.5 hover:opacity-90 no-underline inline-block"
          style={{
            background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
            boxShadow: '0 0 24px rgba(0,191,255,0.25)',
          }}
        >
          ← Back to Home
        </Link>
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