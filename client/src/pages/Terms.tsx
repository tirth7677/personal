export default function Terms() {
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
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <span className="font-bold text-lg tracking-tight">
            <span className="text-white">Indian </span>
            <span className="text-[#00BFFF]">Bounty</span>
            <span className="text-[#BF5FFF]">.</span>
            <span className="text-white">fun</span>
          </span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="text-white/50 hover:text-[#00BFFF] text-xs font-semibold tracking-widest uppercase transition-colors duration-200 no-underline">
            Privacy
          </a>
          <a href="/" className="px-5 py-2 rounded-md border border-[#00BFFF] text-[#00BFFF] text-xs font-bold tracking-widest uppercase hover:bg-[rgba(0,191,255,0.1)] transition-all duration-200 no-underline">
            Home
          </a>
        </div>
      </nav>

      {/* HEADER */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 pt-16 pb-12 border-b border-[rgba(0,191,255,0.08)]">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border text-[#BF5FFF] text-xs font-semibold tracking-widest uppercase"
          style={{ borderColor: 'rgba(191,95,255,0.25)', background: 'rgba(191,95,255,0.07)' }}
        >
          Legal
        </div>
        <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-white/40 text-sm">Effective date: 1 January 2026</p>
        <p className="text-white/50 text-base leading-relaxed mt-4 max-w-2xl">
          These are the rules for using Indian Bounty.fun. They're written to be simple and clear.
          By using the platform, you agree to everything below.
        </p>
      </div>

      {/* QUICK CARDS */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 pt-12 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { icon: '🔒', title: 'Your data stays private',    desc: 'We do not sell, rent, or share your personal data with any third party.' },
            { icon: '💳', title: 'Bcoins are non-refundable', desc: 'All Bcoin purchases are final. Once credited to your wallet, no refunds.' },
            { icon: '🎯', title: 'Owner picks the winner',    desc: 'The bounty creator decides who wins. If they don\'t, we pick randomly.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-[#11112A] border border-[rgba(0,191,255,0.12)] rounded-xl p-5">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="font-semibold text-sm text-white mb-1">{title}</div>
              <div className="text-white/40 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTIONS */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        {[
          {
            num: '01',
            title: 'Who Can Use This Platform',
            content: [
              'You must be at least 18 years old to create an account and use Indian Bounty.fun. By using the platform, you confirm that you meet this requirement.',
              'You are responsible for keeping your account secure. Do not share your login access with anyone. Any activity that happens under your account is your responsibility.',
            ],
          },
          {
            num: '02',
            title: 'What This Platform Is',
            content: [
              'Indian Bounty.fun is a place where anyone can post a bounty — a task, challenge, dare, or creative brief — and offer Bcoins as a prize. Other users can submit entries. The person who posted the bounty (the Creator) decides who wins.',
              'If the Creator does not select a winner before the deadline, our system will pick one randomly from all valid submissions. This ensures every entry has a fair shot.',
              'We are a neutral platform. We do not judge, moderate, or guarantee the outcome of any bounty beyond what is described here.',
            ],
          },
          {
            num: '03',
            title: 'Bcoins — How They Work',
            content: [
              '₹1 = 1 Bcoin. When you deposit money via UPI, a platform fee of 10% is deducted at the time of deposit. So a ₹100 deposit gives you 90 Bcoins.',
              'Bcoins exist only within the platform. They are not a cryptocurrency or financial instrument. They cannot be transferred to another user\'s wallet or traded outside the platform.',
              'You can withdraw your Bcoins as INR to your UPI account at any time, as long as your account is active and in good standing.',
            ],
          },
          {
            num: '04',
            title: 'No Refunds — Ever',
            content: [
              'All Bcoin purchases are final and non-refundable. Once you have completed a payment and Bcoins have been credited to your wallet, we will not issue a refund for any reason.',
              'This includes situations such as: you changed your mind, you made an accidental purchase, your account was suspended, or there was a technical issue on your end.',
              'Please be sure before you buy. We are transparent about this upfront so there are no surprises.',
            ],
          },
          {
            num: '05',
            title: 'Posting & Entering Bounties',
            content: [
              'When you post a bounty, the Bcoin prize is deducted from your wallet immediately and held until the bounty is settled. You are responsible for writing a clear description of what you want.',
              'Entering a bounty is free. Participants do not spend Bcoins to submit — only Creators spend Bcoins to fund a bounty.',
              'Do not post bounties that are illegal, harmful, harassing, or dishonest. We reserve the right to remove any bounty that violates these rules and suspend the account that posted it.',
              'When you win a bounty, the Bcoins are credited to your wallet instantly. You can withdraw them to your UPI account at any time.',
            ],
          },
          {
            num: '06',
            title: 'Things You Must Not Do',
            content: [
              'You agree not to: create fake accounts to manipulate bounty outcomes; post content that is abusive, threatening, or illegal; attempt to hack, reverse-engineer, or disrupt the platform; impersonate another person or business.',
              'Breaking these rules can result in your account being permanently banned and your Bcoin balance being forfeited.',
            ],
          },
          {
            num: '07',
            title: 'Our Content Rights',
            content: [
              'Everything you submit to a bounty remains yours. However, by submitting an entry, you give the bounty Creator permission to use your submission for the purpose described in their bounty brief.',
              'The Indian Bounty.fun name, logo, and platform design are ours. You may not copy or use them without our written permission.',
            ],
          },
          {
            num: '08',
            title: 'Liability',
            content: [
              'We provide the platform as-is. We are not responsible for the actions of other users, the quality of bounty submissions, or the outcome of any bounty beyond what these Terms describe.',
              'We are not liable for any indirect loss, including loss of income or opportunity, arising from your use of the platform.',
            ],
          },
          {
            num: '09',
            title: 'Changes to These Terms',
            content: [
              'We may update these Terms from time to time. When we do, we will update the effective date at the top of this page. Continued use of the platform after any update means you accept the new Terms.',
            ],
          },
        ].map(({ num, title, content }) => (
          <div key={num} className="mb-12 pb-12 border-b border-[rgba(255,255,255,0.05)] last:border-0 last:pb-0">
            <div className="flex items-start gap-4 mb-5">
              <span className="font-mono text-[#00BFFF] text-xs font-bold tracking-widest pt-1 shrink-0">{num}</span>
              <h2 className="font-bold text-xl sm:text-2xl text-white">{title}</h2>
            </div>
            <div className="pl-8 flex flex-col gap-4">
              {content.map((para, i) => (
                <p key={i} className="text-white/50 text-sm sm:text-base leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 px-4 sm:px-8 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap border-t border-[rgba(0,191,255,0.1)]">
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
            <a key={label} href={href} className="text-white/30 hover:text-[#00BFFF] text-xs no-underline transition-colors">
              {label}
            </a>
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