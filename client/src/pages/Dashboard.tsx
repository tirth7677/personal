import Layout from '../components/Layout'

export default function Dashboard() {
  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-16 lg:py-24 max-w-6xl mx-auto">

        <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">Dashboard</div>
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
          Welcome back
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-lg mb-12">
          Create a bounty for the world to chase, or jump in as a participant and start winning Bcoins.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">

          <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-7
                          hover:border-[rgba(0,191,255,0.35)] hover:-translate-y-1
                          transition-all duration-250">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4
                         border border-[rgba(0,191,255,0.15)]"
              style={{ background: 'rgba(0,191,255,0.08)' }}
            >
              🎯
            </div>
            <div className="font-semibold text-base text-white mb-2">Create a Bounty</div>
            <div className="text-white/45 text-sm leading-relaxed">
              Post a task, set the Bcoin prize, and pick the winner yourself.
            </div>
          </div>

          <div className="bg-[#11112A] border border-[rgba(191,95,255,0.15)] rounded-xl p-7
                          hover:border-[rgba(191,95,255,0.35)] hover:-translate-y-1
                          transition-all duration-250">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4
                         border border-[rgba(191,95,255,0.15)]"
              style={{ background: 'rgba(191,95,255,0.08)' }}
            >
              🏆
            </div>
            <div className="font-semibold text-base text-white mb-2">Become a Participant</div>
            <div className="text-white/45 text-sm leading-relaxed">
              Browse open bounties and submit your entry — free to enter.
            </div>
          </div>

        </div>

      </section>
    </Layout>
  )
}