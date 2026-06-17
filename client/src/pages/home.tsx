import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <div className="bg-[#05050F] text-white font-['Space_Grotesk',sans-serif] min-h-screen overflow-x-hidden">

            {/* ── GRID BACKGROUND ── */}
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
                    style={{
                        background:
                            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,191,255,0.07) 0%, transparent 70%)',
                    }}
                />
            </div>

            {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
            <nav
                className="sticky top-0 z-50 flex items-center justify-between
                   px-4 sm:px-8 lg:px-12 h-16
                   border-b border-[rgba(0,191,255,0.1)]"
                style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(12px)' }}
            >
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 no-underline">
                    <img src={logo} alt="Indian Bounty.fun" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight">
                        <span className="text-white">Indian </span>
                        <span className="text-[#00BFFF]">Bounty</span>
                        <span className="text-[#BF5FFF]">.</span>
                        <span className="text-white">fun</span>
                    </span>
                </Link>

                {/* Desktop links */}
                <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
                    <li>
                        <a href="#how" className="text-white/50 hover:text-[#00BFFF] text-xs font-semibold tracking-widest uppercase transition-colors duration-200 no-underline">
                            How it works
                        </a>
                    </li>
                    <li>
                        <a href="#bcoins" className="text-white/50 hover:text-[#00BFFF] text-xs font-semibold tracking-widest uppercase transition-colors duration-200 no-underline">
                            Bcoins
                        </a>
                    </li>
                    <li>
                        <Link
                            to="/dashboard"
                            className="px-5 py-2 rounded-md border border-white/15 text-white/70
                         text-xs font-bold tracking-widest uppercase
                         hover:border-[rgba(191,95,255,0.4)] hover:text-white transition-all duration-200 no-underline"
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/login"
                            className="px-5 py-2 rounded-md border border-[#00BFFF] text-[#00BFFF]
                         text-xs font-bold tracking-widest uppercase
                         hover:bg-[rgba(0,191,255,0.1)] transition-all duration-200 no-underline"
                        >
                            Launch App
                        </Link>
                    </li>
                </ul>

                {/* Hamburger */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-1 bg-transparent border-0 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="block w-5 h-0.5 bg-white/50 rounded" />
                    <span className="block w-5 h-0.5 bg-white/50 rounded" />
                    <span className="block w-5 h-0.5 bg-white/50 rounded" />
                </button>
            </nav>

            {/* Mobile menu */}
            {menuOpen && (
                <div
                    className="md:hidden fixed top-16 left-0 right-0 z-40
                     flex flex-col gap-5 px-6 py-6
                     border-b border-[rgba(0,191,255,0.1)]"
                    style={{ background: 'rgba(5,5,15,0.97)', backdropFilter: 'blur(12px)' }}
                >
                    {['#how', '#bcoins'].map((href, i) => (
                        <a
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className="text-white/60 hover:text-[#00BFFF] text-sm font-medium
                         pb-3 border-b border-white/5 no-underline transition-colors"
                        >
                            {['How it works', 'Bcoins'][i]}
                        </a>
                    ))}
                    <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="text-center px-5 py-3 rounded-lg border border-white/15
                       text-white/70 text-sm font-bold tracking-wider uppercase
                       hover:border-[rgba(191,95,255,0.4)] hover:text-white transition-all duration-200 no-underline"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="text-center px-5 py-3 rounded-lg border border-[#00BFFF]
                       text-[#00BFFF] text-sm font-bold tracking-wider uppercase
                       hover:bg-[rgba(0,191,255,0.1)] transition-all duration-200 no-underline mt-1"
                    >
                        Launch App
                    </Link>
                </div>
            )}

            {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
            <section
                className="relative z-10 min-h-[calc(100vh-64px)]
                   flex flex-col items-center justify-center text-center
                   px-4 sm:px-8 pt-16 pb-20"
            >
                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8
                     border text-[#BF5FFF] text-xs font-semibold tracking-widest uppercase"
                    style={{
                        borderColor: 'rgba(191,95,255,0.25)',
                        background: 'rgba(191,95,255,0.07)',
                    }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full bg-[#BF5FFF]"
                        style={{ animation: 'pulseDot 1.8s ease-in-out infinite' }}
                    />
                    India's First Bounty Platform
                </div>

                {/* Headline */}
                <h1
                    className="font-bold leading-[1.05] tracking-tight
             text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
             max-w-4xl mb-6"
                >
                    <span className="block whitespace-nowrap text-white">Create the Challenge.</span>
                    <span className="block whitespace-nowrap text-white">Control the Outcome.</span>
                    <span
                        className="block whitespace-nowrap"
                        style={{
                            background: 'linear-gradient(90deg, #00BFFF 0%, #BF5FFF 60%, #FF2D78 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        The Dark Side Pays.
                    </span>
                </h1>

                {/* Subheadline — primary */}
                <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl mb-4">
                    Turn any idea into a bounty. A Devil's Dare. A Sin Challenge. A Temptation Tournament. A Midnight Quest. Set the reward, make the rules, and watch competitors battle for your approval. Your bounty. Your arena. Your winner.
                </p>

                {/* Category pills — "bounty on anything" social proof */}
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                    {[
                        "😈 Sin Challenges",
                        "🔥 Temptation Tournament",
                        "💋 Lust Quests",
                        "🖤 Devil's Dares",
                        "🥀 Toxic Talent Battles",
                        "🎭 After-Hours Competitions",
                        "⚡ Forbidden Bounties",
                        "🌙 Midnight Challenges",
                    ].map((pill) => (
                        <span
                            key={pill}
                            className="px-3 py-1.5 rounded-full text-xs font-medium text-white/40
                         border border-white/8"
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                            {pill}
                        </span>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
            <section id="how" className="relative z-10 px-4 sm:px-8 lg:px-16 py-20 lg:py-28 max-w-6xl mx-auto">
                <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">How it works</div>
                <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">Simple as 1, 2, 3, 4</h2>
                <p className="text-white/50 text-base leading-relaxed max-w-lg mb-12">
                    No complicated rules. Post anything, let the best entry win, Bcoins hit your wallet instantly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        {
                            num: '01',
                            icon: '💰',
                            title: 'Add Bcoins',
                            desc: 'Top up your wallet via UPI. ₹1 = 1 Bcoin. Instant credit, no waiting.',
                        },
                        {
                            num: '02',
                            icon: '🎯',
                            title: 'Post or enter a bounty',
                            desc: "Put Bcoins on anything — a dare, a challenge, a Bounty, a bet. Or jump into someone else's bounty and compete for the pot.",
                        },
                        {
                            num: '03',
                            icon: '⚡',
                            title: 'Owner picks the winner',
                            desc: "You review every entry and crown whoever you want. Don't decide in time? Our system picks randomly — no one walks away empty.",
                        },
                        {
                            num: '04',
                            icon: '🏆',
                            title: 'Instant UPI payout',
                            desc: 'Bcoins convert to INR and land in your UPI account within minutes. No forms, no delays.',
                        },
                    ].map(({ num, icon, title, desc }) => (
                        <div
                            key={num}
                            className="relative bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-7
                         hover:border-[rgba(0,191,255,0.35)] hover:-translate-y-1
                         transition-all duration-250 overflow-hidden group"
                        >
                            {/* Top accent bar on hover */}
                            <div
                                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-250 rounded-t-xl"
                                style={{ background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)' }}
                            />
                            <div className="font-mono text-[#00BFFF] text-xs font-bold tracking-widest mb-4">{num} —</div>
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4
                           border border-[rgba(0,191,255,0.15)]"
                                style={{ background: 'rgba(0,191,255,0.08)' }}
                            >
                                {icon}
                            </div>
                            <div className="font-semibold text-base text-white mb-2">{title}</div>
                            <div className="text-white/45 text-sm leading-relaxed">{desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════
          BCOIN SECTION
      ══════════════════════════════════════ */}
            <section id="bcoins" className="relative z-10 px-4 sm:px-8 lg:px-16 py-20 lg:py-28">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Coin Visual */}
                    <div className="flex items-center justify-center">
                        <div
                            className="relative flex items-center justify-center
                         w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72
                         rounded-full border-2 border-[rgba(0,191,255,0.2)]"
                            style={{ animation: 'slowSpin 18s linear infinite' }}
                        >
                            <div className="absolute inset-2.5 rounded-full border border-[rgba(191,95,255,0.15)]" />
                            <div
                                className="w-[60%] h-[60%] rounded-full border-2 border-[rgba(0,191,255,0.4)]
                           flex flex-col items-center justify-center"
                                style={{
                                    background: 'radial-gradient(circle, rgba(0,191,255,0.15) 0%, rgba(191,95,255,0.1) 100%)',
                                    animation: 'slowSpin 18s linear infinite reverse',
                                }}
                            >
                                <div
                                    className="font-mono font-bold text-3xl"
                                    style={{
                                        background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    BC
                                </div>
                                <div className="text-white/30 text-[0.55rem] tracking-widest uppercase mt-0.5">Bcoin</div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">Bcoin</div>
                        <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
                            India's bounty currency
                        </h2>
                        <p className="text-white/50 text-base leading-relaxed mb-8 max-w-md">
                            Simple, transparent, instant. Every rupee you put in becomes a Bcoin.
                            Every Bcoin you win converts straight back to rupees.
                        </p>

                        <div className="flex flex-col gap-3">
                            {[
                                { label: '1 Bcoin', val: '= ₹1.00 INR' },
                                { label: 'Deposit via', val: 'UPI / Razorpay' },
                                { label: 'Platform fee', val: '10% on deposit' },
                                { label: 'Withdrawal', val: 'Anytime via UPI' },
                            ].map(({ label, val }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between px-5 py-4 rounded-xl
                             bg-[#11112A] border border-[rgba(0,191,255,0.15)]"
                                >
                                    <span className="text-white/50 text-sm">{label}</span>
                                    <span className="font-mono text-[#00BFFF] text-sm font-bold">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

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
                        { label: 'Terms', href: '/terms' },
                        { label: 'Privacy', href: '/privacy' },
                    ].map(({ label, href }) => (
                        <Link key={label} to={href} className="text-white/30 hover:text-[#00BFFF] text-xs no-underline transition-colors">
                            {label}
                        </Link>
                    ))}
                </div>
                <div className="text-white/25 text-xs">© 2026 Indian Bounty.fun · Made in India 🇮🇳</div>
            </footer>

            {/* ── Keyframe styles ── */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

        </div>
    )
}