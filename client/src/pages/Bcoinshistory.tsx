import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'

interface BcoinUsage {
  id: number
  userId: number
  type: 'debit' | 'credit' | string
  amount: number
  reason: string
  createdAt: string
}

const PAGE_SIZE = 10

// Maps backend reason codes to human-friendly labels + icons.
// Add new entries here as more transaction types get introduced (bounty_won, withdrawal, etc.)
const REASON_MAP: Record<string, { label: string; icon: string }> = {
  bounty_posted: { label: 'Bounty posted', icon: '🎯' },
  bounty_won: { label: 'Bounty won', icon: '🏆' },
  deposit: { label: 'Bcoins added', icon: '💰' },
  withdrawal: { label: 'Withdrawal', icon: '🏦' },
  refund: { label: 'Refund', icon: '↩️' },
}

function getReasonInfo(reason: string) {
  return REASON_MAP[reason] ?? { label: reason.replace(/_/g, ' '), icon: '🪙' }
}

export default function BcoinsHistory() {
  const [usage, setUsage] = useState<BcoinUsage[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = useCallback(async (cursor?: number) => {
    try {
      const url = new URL('http://localhost:5000/api/v1/payment/bcoins-usage')
      url.searchParams.set('limit', String(PAGE_SIZE))
      if (cursor) url.searchParams.set('cursor', String(cursor))

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        const { usage: newUsage, nextCursor: newCursor, hasMore: more } = data.data
        setUsage((prev) => (cursor ? [...prev, ...newUsage] : newUsage))
        setNextCursor(newCursor)
        setHasMore(more)
        setError(null)
      } else {
        setError(data.message || 'Failed to load Bcoins history.')
      }
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const handleLoadMore = () => {
    if (!nextCursor) return
    setLoadingMore(true)
    fetchUsage(nextCursor)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-16 lg:py-24 max-w-4xl mx-auto">

        <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">Wallet</div>
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
          Bcoins History
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-lg mb-10">
          Every Bcoin movement on your account — deposits, bounties posted, and prizes won.
        </p>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-[rgba(0,191,255,0.1)] animate-pulse"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm font-medium border text-[#FF2D78]"
            style={{ background: 'rgba(255,45,120,0.1)', borderColor: 'rgba(255,45,120,0.35)' }}
          >
            <span className="shrink-0">⚠</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && usage.length === 0 && (
          <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-10 text-center">
            <div className="text-3xl mb-3">🪙</div>
            <div className="font-semibold text-white mb-1">No activity yet</div>
            <div className="text-white/40 text-sm">Your Bcoin movements will show up here.</div>
          </div>
        )}

        {/* Usage list */}
        {!loading && !error && usage.length > 0 && (
          <div className="flex flex-col gap-3">
            {usage.map((entry) => {
              const isCredit = entry.type === 'credit'
              const { label, icon } = getReasonInfo(entry.reason)

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl
                             bg-[#11112A] border border-[rgba(0,191,255,0.12)]
                             hover:border-[rgba(0,191,255,0.25)] transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border"
                      style={
                        isCredit
                          ? { background: 'rgba(0,191,255,0.08)', borderColor: 'rgba(0,191,255,0.2)' }
                          : { background: 'rgba(255,45,120,0.08)', borderColor: 'rgba(255,45,120,0.2)' }
                      }
                    >
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{label}</div>
                      <div className="text-white/35 text-xs">{formatDate(entry.createdAt)}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono text-sm font-bold ${
                        isCredit ? 'text-[#00BFFF]' : 'text-[#FF2D78]'
                      }`}
                    >
                      {isCredit ? '+' : '−'} 🪙 {entry.amount.toLocaleString()}
                    </div>
                    <div
                      className={`text-xs font-semibold tracking-wide uppercase ${
                        isCredit ? 'text-[#00BFFF]/60' : 'text-[#FF2D78]/70'
                      }`}
                    >
                      {entry.type}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Load more */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="mt-2 text-white/60 font-semibold text-sm tracking-wide
                           px-6 py-3 rounded-lg border border-[rgba(0,191,255,0.2)]
                           hover:border-[rgba(0,191,255,0.4)] hover:text-white
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}

      </section>
    </Layout>
  )
}