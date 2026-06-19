import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import CountdownTimer from '../components/CountdownTimer'

interface Bounty {
  id: number
  title: string
  price: number
  timeLimit: string
  description: string
  filePath: string | null // signed URL from backend, or null if no attachment
  active: boolean
  createdAt: string
  userId: number
  user: {
    id: number
    username: string
  }
}

const PAGE_SIZE = 9

export default function Dashboard() {
  const navigate = useNavigate()

  const [bounties, setBounties] = useState<Bounty[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBounties = useCallback(async (cursor?: number) => {
    try {
      const url = new URL('http://localhost:5000/api/v1/bounty/all')
      url.searchParams.set('limit', String(PAGE_SIZE))
      if (cursor) url.searchParams.set('cursor', String(cursor))

      const res = await fetch(url.toString(), { method: 'GET' })
      const data = await res.json()

      if (data.success) {
        const { bounties: newBounties, nextCursor: newCursor, hasMore: more } = data.data
        setBounties((prev) => (cursor ? [...prev, ...newBounties] : newBounties))
        setNextCursor(newCursor)
        setHasMore(more)
        setError(null)
      } else {
        setError(data.message || 'Failed to load bounties.')
      }
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchBounties()
  }, [fetchBounties])

  const handleLoadMore = () => {
    if (!nextCursor) return
    setLoadingMore(true)
    fetchBounties(nextCursor)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const isImageFile = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url.split('?')[0])

  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-12 lg:py-16 max-w-6xl mx-auto">

        {/* Header — minimal, just orienting the page */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase">Bounties</div>
              <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </div>
            </div>
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
              Open Bounties
            </h1>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-xl border border-[rgba(0,191,255,0.1)] animate-pulse"
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
        {!loading && !error && bounties.length === 0 && (
          <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-12 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <div className="font-semibold text-white mb-1">No bounties yet</div>
            <div className="text-white/40 text-sm">Be the first to post one.</div>
          </div>
        )}

        {/* Bounty grid */}
        {!loading && !error && bounties.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bounties.map((bounty) => (
                <div
                  key={bounty.id}
                  onClick={() => navigate(`/bounty/${bounty.id}`)}
                  className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl
                             hover:border-[rgba(191,95,255,0.4)] hover:-translate-y-0.5
                             transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
                >
                  {/* Attachment preview — image renders directly, other files show a file chip */}
                  {bounty.filePath && (
                    isImageFile(bounty.filePath) ? (
                      <div className="w-full h-40 overflow-hidden bg-black/30">
                        <img
                          src={bounty.filePath}
                          alt={bounty.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <a
                        href={bounty.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 text-xs font-semibold text-[#00BFFF]
                                   border-b border-[rgba(0,191,255,0.1)] no-underline hover:bg-[rgba(0,191,255,0.05)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📎 View attachment
                      </a>
                    )
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Top row — username + price */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-[#BF5FFF] text-xs font-semibold tracking-wide uppercase
                                   px-2.5 py-1 rounded-full border border-[rgba(191,95,255,0.2)]"
                        style={{ background: 'rgba(191,95,255,0.1)' }}
                      >
                        {bounty.user.username}
                      </span>
                      <span className="font-mono text-[#00BFFF] text-sm font-bold">
                        🪙 {bounty.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Title + full description, no clamping — show everything */}
                    <div className="font-semibold text-[0.95rem] text-white mb-2 leading-snug">
                      {bounty.title}
                    </div>
                    <div className="text-white/45 text-sm mb-5 leading-relaxed flex-1 whitespace-pre-wrap">
                      {bounty.description}
                    </div>

                    {/* Live countdown bar */}
                    <div className="mb-3">
                      <CountdownTimer targetDate={bounty.timeLimit} />
                    </div>

                    {/* Footer — posted date */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-white/30 text-xs">Posted {formatDate(bounty.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-white/60 font-semibold text-sm tracking-wide
                             px-6 py-3 rounded-lg border border-[rgba(0,191,255,0.2)]
                             hover:border-[rgba(0,191,255,0.4)] hover:text-white
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}

      </section>
    </Layout>
  )
}