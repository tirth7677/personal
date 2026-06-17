export default function Privacy() {
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
          <a href="/terms" className="text-white/50 hover:text-[#00BFFF] text-xs font-semibold tracking-widest uppercase transition-colors duration-200 no-underline">
            Terms
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
          Privacy Policy
        </h1>
        <p className="text-white/40 text-sm">Effective date: 1 January 2026</p>
        <p className="text-white/50 text-base leading-relaxed mt-4 max-w-2xl">
          Your privacy matters to us. This page explains exactly what data we collect,
          why we collect it, and our commitment to never sharing it with anyone outside this platform.
          No fluff, no jargon.
        </p>
      </div>

      {/* COMMITMENT CARDS */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 pt-12 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { icon: '🚫', title: 'Zero data sharing',        desc: 'We do not sell, rent, or share your data with any third party. Period.' },
            { icon: '🛡️', title: 'No ads, no tracking',     desc: 'We run no advertising. We have no third-party tracking on this platform.' },
            { icon: '🔐', title: 'You own your data',        desc: 'You can ask us to delete your data at any time.' },
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
            title: 'What We Collect',
            content: [
              'We collect only what we need to run the platform. Nothing more.',
              'Account information: your phone number (for login), your display name, and your UPI ID (only used when you request a withdrawal).',
              'Transaction records: your Bcoin deposit history, wallet balance, bounties you funded, prizes you won, and withdrawal requests. We keep this to ensure your wallet is accurate and disputes can be resolved.',
              'Bounty and submission content: the bounties you create and the entries you submit. This is visible to other users as part of how the platform works.',
              'Basic technical data: your IP address and device type. This is used only for security — to detect unusual activity and protect your account.',
            ],
          },
          {
            num: '02',
            title: 'What We Do NOT Collect',
            content: [
              'We do not collect your bank account number, card details, or any payment credentials. All payments are processed by Razorpay. We only receive a confirmation that your payment was successful — never your payment details.',
              'We do not collect your Aadhaar, PAN, or any government ID unless you specifically request a large withdrawal that requires identity verification under financial regulations.',
              'We do not access your contacts, camera, microphone, or location.',
              'We do not track your activity on any other website or app.',
            ],
          },
          {
            num: '03',
            title: 'How We Use Your Data',
            content: [
              'Your phone number is used to log you in. That is its only purpose.',
              'Your UPI ID is used only when you withdraw Bcoins. We send it to Razorpay to process the payout, and that is the only time it leaves our system.',
              'Your transaction and wallet data is used to keep your balance accurate and resolve any disputes.',
              'Your bounty and submission content is used to run the platform — displaying bounties, managing entries, and settling winners.',
              'Technical data is used to keep the platform secure. Nothing else.',
            ],
          },
          {
            num: '04',
            title: 'We Do Not Share Your Data — With Anyone',
            content: [
              'This is our core commitment: Indian Bounty.fun does not share your personal data with any third party for any commercial, marketing, or analytical purpose.',
              'We do not sell your data. We do not share it with advertisers. We do not pass it to data brokers. We do not use it to build profiles about you.',
              'The only exception is Razorpay, our payment gateway. When you make a deposit or withdrawal, Razorpay processes the transaction. We share only what is strictly required for that transaction — nothing more. Razorpay does not receive your bounty content, your submission history, or any other platform data.',
              'If we are ever required by law to share data, we will assess that request carefully and only comply if legally obligated to do so.',
            ],
          },
          {
            num: '05',
            title: 'How We Protect Your Data',
            content: [
              'Your data is stored on secure servers. We use encryption to protect data in storage and in transit.',
              'Access to user data within our team is limited strictly to what is needed to operate and maintain the platform.',
              'We do not use third-party analytics tools or advertising networks that would have access to your data.',
            ],
          },
          {
            num: '06',
            title: 'Cookies',
            content: [
              'We use only one type of cookie — a session cookie that keeps you logged in while you use the platform. It is deleted when you log out.',
              'We do not use advertising cookies or any third-party tracking cookies.',
            ],
          },
          {
            num: '07',
            title: 'How Long We Keep Your Data',
            content: [
              'We keep your account data for as long as your account is active.',
              'Transaction records are kept for 7 years as required by financial regulations.',
              'If you delete your account, we will remove your personal data within 30 days, except for transaction records which must be retained as described above.',
            ],
          },
          {
            num: '08',
            title: 'Your Rights',
            content: [
              'You can ask us to show you the data we hold about you.',
              'You can ask us to correct any inaccurate data.',
              'You can ask us to delete your account and data at any time.',
              'To make any of these requests, reach out to us through the platform.',
            ],
          },
          {
            num: '09',
            title: 'Changes to This Policy',
            content: [
              'If we update this Privacy Policy, we will update the effective date at the top of this page. We will also notify you through the platform if the changes are significant.',
              'Continuing to use the platform after an update means you accept the revised policy.',
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