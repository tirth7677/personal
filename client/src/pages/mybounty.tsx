import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import CountdownTimer from '../components/CountdownTimer'

interface Bounty {
  id: number
  title: string
  price: number
  timeLimit: string
  description: string
  filePath: string | null
  active: boolean
  createdAt: string
  userId: number
}

type FilterType = 'all' | 'active' | 'inactive'

const PAGE_SIZE = 10

export default function MyBounty() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const fetchMyBounties = useCallback(async (activeFilter: FilterType, cursor?: number) => {
    try {
      const url = new URL('http://localhost:5000/api/v1/bounty/mine')
      url.searchParams.set('limit', String(PAGE_SIZE))
      if (cursor) url.searchParams.set('cursor', String(cursor))
      if (activeFilter === 'active') url.searchParams.set('active', 'true')
      if (activeFilter === 'inactive') url.searchParams.set('active', 'false')

      const res = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        const { bounties: newBounties, nextCursor: newCursor, hasMore: more } = data.data
        setBounties((prev) => (cursor ? [...prev, ...newBounties] : newBounties))
        setNextCursor(newCursor)
        setHasMore(more)
        setError(null)
      } else {
        setError(data.message || 'Failed to load your bounties.')
      }
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Re-fetch from scratch whenever the filter changes
  useEffect(() => {
    setLoading(true)
    setBounties([])
    fetchMyBounties(filter)
  }, [filter, fetchMyBounties])

  const handleLoadMore = () => {
    if (!nextCursor) return
    setLoadingMore(true)
    fetchMyBounties(filter, nextCursor)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const isImageFile = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url.split('?')[0])

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Closed' },
  ]

  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-16 lg:py-24 max-w-5xl mx-auto">

        <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">Bounty</div>
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
          My Bounties
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-lg mb-8">
          Every bounty you've posted, in one place.
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase border transition-all duration-200
                          ${filter === key
                            ? 'text-[#00BFFF] border-[#00BFFF] bg-[rgba(0,191,255,0.1)]'
                            : 'text-white/50 border-white/10 hover:border-[rgba(0,191,255,0.25)] hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-[rgba(0,191,255,0.1)] animate-pulse"
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
          <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-10 text-center">
            <div className="text-3xl mb-3">📋</div>
            <div className="font-semibold text-white mb-1">
              {filter === 'all' ? "You haven't posted any bounties yet" : `No ${filter} bounties`}
            </div>
            <div className="text-white/40 text-sm">Head to Create Bounty to post your first one.</div>
          </div>
        )}

        {/* Bounty list */}
        {!loading && !error && bounties.length > 0 && (
          <div className="flex flex-col gap-3">
            {bounties.map((bounty) => (
              <div
                key={bounty.id}
                className="rounded-xl bg-[#11112A] border border-[rgba(0,191,255,0.12)]
                           hover:border-[rgba(0,191,255,0.25)] transition-all duration-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-5">

                  {/* Image preview, if attachment exists and is an image */}
                  {bounty.filePath && isImageFile(bounty.filePath) && (
                    <div className="w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-black/30 shrink-0">
                      <img
                        src={bounty.filePath}
                        alt={bounty.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Status + date + price row */}
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[0.65rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full border ${
                            bounty.active
                              ? 'text-[#00BFFF] border-[rgba(0,191,255,0.3)] bg-[rgba(0,191,255,0.08)]'
                              : 'text-white/40 border-white/10 bg-white/5'
                          }`}
                        >
                          {bounty.active ? 'Active' : 'Closed'}
                        </span>
                        <span className="text-white/30 text-xs">Posted {formatDate(bounty.createdAt)}</span>
                      </div>
                      <span className="font-mono text-[#00BFFF] text-sm font-bold shrink-0">
                        🪙 {bounty.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="text-white text-sm font-semibold mb-1.5">{bounty.title}</div>

                    {/* Full description, no clamping */}
                    <p className="text-white/40 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                      {bounty.description}
                    </p>

                    {/* Non-image attachment link */}
                    {bounty.filePath && !isImageFile(bounty.filePath) && (
                      <a
                        href={bounty.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00BFFF] no-underline hover:opacity-70 transition-opacity mb-3"
                      >
                        📎 View attachment
                      </a>
                    )}

                    {/* Live countdown bar */}
                    <CountdownTimer targetDate={bounty.timeLimit} />
                  </div>
                </div>
              </div>
            ))}

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