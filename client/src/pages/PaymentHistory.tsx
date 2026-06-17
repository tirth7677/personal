import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'

interface PaymentBreakdown {
  amountPaid: number
  platformFee: number
  bcoinsCredited: number
}

interface Payment {
  id: number
  userId: number
  amount: number // stored in paise on backend
  status: 'success' | 'failed' | string
  createdAt: string
  breakdown: PaymentBreakdown
}

const PAGE_SIZE = 10

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async (cursor?: number) => {
    try {
      const url = new URL('http://localhost:5000/api/v1/payment/history')
      url.searchParams.set('limit', String(PAGE_SIZE))
      if (cursor) url.searchParams.set('cursor', String(cursor))

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        const { payments: newPayments, nextCursor: newCursor, hasMore: more } = data.data

        setPayments((prev) => (cursor ? [...prev, ...newPayments] : newPayments))
        setNextCursor(newCursor)
        setHasMore(more)
        setError(null)
      } else {
        setError(data.message || 'Failed to load payment history.')
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleLoadMore = () => {
    if (!nextCursor) return
    setLoadingMore(true)
    fetchHistory(nextCursor)
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-16 lg:py-24 max-w-4xl mx-auto">

        <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">Wallet</div>
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
          Payment History
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-lg mb-10">
          A full, transparent breakdown of every Bcoin deposit you've made — what you paid,
          what went to platform fees, and what was credited to your wallet.
        </p>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-[rgba(0,191,255,0.1)] animate-pulse"
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
        {!loading && !error && payments.length === 0 && (
          <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-10 text-center">
            <div className="text-3xl mb-3">🪙</div>
            <div className="font-semibold text-white mb-1">No transactions yet</div>
            <div className="text-white/40 text-sm">Once you add Bcoins, your history will show up here.</div>
          </div>
        )}

        {/* Payment list */}
        {!loading && !error && payments.length > 0 && (
          <div className="flex flex-col gap-3">
            {payments.map((payment) => {
              const isSuccess = payment.status === 'success'

              return (
                <div
                  key={payment.id}
                  className="rounded-xl bg-[#11112A] border border-[rgba(0,191,255,0.12)]
                             hover:border-[rgba(0,191,255,0.25)] transition-all duration-200 overflow-hidden"
                >
                  {/* Top row — status, date, transaction id */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 border"
                        style={
                          isSuccess
                            ? { background: 'rgba(0,191,255,0.08)', borderColor: 'rgba(0,191,255,0.2)' }
                            : { background: 'rgba(255,45,120,0.08)', borderColor: 'rgba(255,45,120,0.2)' }
                        }
                      >
                        {isSuccess ? '✓' : '✕'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">
                          {isSuccess ? 'Bcoins added' : 'Payment failed'}
                        </div>
                        <div className="text-white/35 text-xs">{formatDate(payment.createdAt)}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${
                          isSuccess
                            ? 'text-[#00BFFF] border-[rgba(0,191,255,0.3)] bg-[rgba(0,191,255,0.08)]'
                            : 'text-[#FF2D78] border-[rgba(255,45,120,0.3)] bg-[rgba(255,45,120,0.08)]'
                        }`}
                      >
                        {payment.status}
                      </div>
                    </div>
                  </div>

                  {/* Full transparent breakdown — everything from the API */}
                  <div className="grid grid-cols-3 gap-px border-t border-[rgba(255,255,255,0.06)]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="px-5 py-3 flex flex-col gap-0.5">
                      <span className="text-white/35 text-[0.65rem] font-semibold tracking-wide uppercase">Amount Paid</span>
                      <span className="font-mono text-white text-sm font-bold">
                        ₹{payment.breakdown.amountPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="px-5 py-3 flex flex-col gap-0.5">
                      <span className="text-white/35 text-[0.65rem] font-semibold tracking-wide uppercase">Platform Fee</span>
                      <span className="font-mono text-[#FF2D78] text-sm font-bold">
                        {payment.breakdown.platformFee > 0 ? `− ₹${payment.breakdown.platformFee.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    <div className="px-5 py-3 flex flex-col gap-0.5">
                      <span className="text-white/35 text-[0.65rem] font-semibold tracking-wide uppercase">Bcoins Credited</span>
                      <span className="font-mono text-[#00BFFF] text-sm font-bold">
                        {payment.breakdown.bcoinsCredited > 0 ? `🪙 ${payment.breakdown.bcoinsCredited.toLocaleString()}` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Raw transaction id — full transparency */}
                  <div className="px-5 py-2 border-t border-[rgba(255,255,255,0.05)]">
                    <span className="text-white/25 text-[0.65rem] font-mono">Transaction ID: {payment.id}</span>
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