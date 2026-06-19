import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import CountdownTimer from '../components/CountdownTimer'
import LoginRequiredModal from '../components/LoginRequiredModal'
import ImageLightbox from '../components/ImageLightbox'
import { useUser } from '../context/UserContext'

interface SubmissionUser {
  id: number
  username: string
}

interface Submission {
  id: number
  userId: number
  filePath: string | null
  comment: string | null
  createdAt: string
  user: SubmissionUser
}

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
  user: SubmissionUser
  submissions: Submission[]
}

const isImageFile = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url.split('?')[0])

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: userLoading } = useUser()

  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fullscreen image viewer — holds the currently opened image URL, or null when closed
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Submission form state
  const [showForm, setShowForm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitStage, setSubmitStage] = useState<'idle' | 'uploading' | 'submitting'>('idle')
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchBounty = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`http://localhost:5000/api/v1/bounty/${id}`, { method: 'GET' })
      const data = await res.json()

      if (data.success) {
        setBounty(data.data.bounty)
        setError(null)
      } else {
        setError(data.message || 'Failed to load this bounty.')
      }
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBounty()
  }, [fetchBounty])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) {
      setFile(null)
      setFilePreview(null)
      return
    }
    setFile(selected)
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setFilePreview(reader.result as string)
      reader.readAsDataURL(selected)
    } else {
      setFilePreview(null)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
  }

  // Gate for the "Add Your Submission" button — checks auth from shared UserContext
  // before opening the form. If not logged in, shows the login-required modal instead.
  const handleAddSubmissionClick = () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    setShowForm(true)
  }

  // Same two-step signed-URL pattern as bounty creation, but pointed at the
  // submission endpoint and scoped with bountyId.
  const uploadSubmissionFile = async (fileToUpload: File, bountyId: number): Promise<string> => {
    const urlRes = await fetch('http://localhost:5000/api/v1/submission/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        filename: fileToUpload.name,
        contentType: fileToUpload.type,
        bountyId,
      }),
    })

    const urlData = await urlRes.json()
    if (!urlData.success) {
      throw new Error(urlData.message || 'Could not get an upload URL.')
    }

    const { uploadUrl, filePath } = urlData.data

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': fileToUpload.type },
      body: fileToUpload,
    })

    if (!putRes.ok) {
      throw new Error('File upload to storage failed. Please try again.')
    }

    return filePath
  }

  const handleSubmitEntry = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)

    if (!bounty) return

    // Defensive re-check — in case the session expired while the form was open
    if (!user) {
      setShowForm(false)
      setShowLoginModal(true)
      return
    }

    if (!comment.trim() && !file) {
      setSubmitMessage({ type: 'error', text: 'Add a comment or attach a file before submitting.' })
      return
    }

    setSubmitting(true)

    try {
      let filePath: string | null = null

      if (file) {
        setSubmitStage('uploading')
        filePath = await uploadSubmissionFile(file, bounty.id)
      }

      setSubmitStage('submitting')

      const res = await fetch('http://localhost:5000/api/v1/submission/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bountyId: bounty.id,
          filePath,
          comment: comment.trim() || null,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSubmitMessage({ type: 'success', text: data.message || 'Submission sent successfully!' })
        setComment('')
        removeFile()
        await fetchBounty() // refresh the submission list to show the new entry
        setTimeout(() => setShowForm(false), 1200)
      } else {
        setSubmitMessage({ type: 'error', text: data.message || 'Failed to submit.' })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not connect to server. Please try again.'
      setSubmitMessage({ type: 'error', text: msg })
    } finally {
      setSubmitting(false)
      setSubmitStage('idle')
    }
  }

  // Derived state
  const deadlinePassed = bounty ? new Date(bounty.timeLimit).getTime() <= Date.now() : false
  const isClosed = bounty ? !bounty.active || deadlinePassed : false
  const isOwner = bounty && user ? bounty.userId === user.id : false
  const alreadySubmitted = bounty && user ? bounty.submissions.some((s) => s.userId === user.id) : false

  const submitLabel =
    submitStage === 'uploading'  ? 'Uploading file...' :
    submitStage === 'submitting' ? 'Sending submission...' :
    'Send Submission →'

  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-12 lg:py-16 max-w-6xl mx-auto">

        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-medium no-underline mb-6 transition-colors"
        >
          ← Back to bounties
        </Link>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 h-96 rounded-xl border border-[rgba(0,191,255,0.1)] animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
            <div
              className="h-96 rounded-xl border border-[rgba(0,191,255,0.1)] animate-pulse"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
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

        {/* Main content */}
        {!loading && !error && bounty && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ════════ LEFT — Bounty details + submissions feed ════════ */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Bounty card */}
              <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl overflow-hidden">

                {bounty.filePath && (
                  isImageFile(bounty.filePath) ? (
                    <button
                      onClick={() => setLightboxImage(bounty.filePath)}
                      className="w-full h-64 sm:h-80 flex items-center justify-center bg-black/30
                                 cursor-zoom-in border-0 p-0 group relative overflow-hidden"
                      aria-label="View full image"
                    >
                      <img
                        src={bounty.filePath}
                        alt={bounty.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100
                                   transition-opacity duration-200"
                        style={{ background: 'rgba(5,5,15,0.3)' }}
                      >
                        <span className="text-white text-xs font-bold tracking-wide uppercase px-3 py-1.5 rounded-full border border-white/30"
                              style={{ background: 'rgba(17,17,42,0.7)' }}>
                          🔍 View full size
                        </span>
                      </div>
                    </button>
                  ) : (
                    <a
                      href={bounty.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-[#00BFFF]
                                 border-b border-[rgba(0,191,255,0.1)] no-underline hover:bg-[rgba(0,191,255,0.05)]"
                    >
                      📎 View attachment
                    </a>
                  )
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <span
                      className="text-[#BF5FFF] text-xs font-semibold tracking-wide uppercase
                                 px-2.5 py-1 rounded-full border border-[rgba(191,95,255,0.2)]"
                      style={{ background: 'rgba(191,95,255,0.1)' }}
                    >
                      Posted by {bounty.user.username}
                    </span>
                    <span className="font-mono text-[#00BFFF] text-base font-bold">
                      🪙 {bounty.price.toLocaleString()}
                    </span>
                  </div>

                  <h1 className="font-bold text-2xl sm:text-3xl text-white mb-4 leading-snug">
                    {bounty.title}
                  </h1>

                  <p className="text-white/55 text-base leading-relaxed mb-6 whitespace-pre-wrap">
                    {bounty.description}
                  </p>

                  <div className="mb-2">
                    <CountdownTimer targetDate={bounty.timeLimit} />
                  </div>

                  <div className="text-white/30 text-xs pt-3 border-t border-white/5 mt-4">
                    Posted {formatDate(bounty.createdAt)}
                  </div>
                </div>
              </div>

              {/* Submissions feed */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-white">
                    Submissions <span className="text-white/30 font-normal">({bounty.submissions.length})</span>
                  </h2>
                </div>

                {bounty.submissions.length === 0 ? (
                  <div className="bg-[#11112A] border border-[rgba(0,191,255,0.12)] rounded-xl p-8 text-center">
                    <div className="text-2xl mb-2">📭</div>
                    <div className="text-white/50 text-sm">No submissions yet. Be the first.</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {bounty.submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="bg-[#11112A] border border-[rgba(0,191,255,0.12)] rounded-xl overflow-hidden"
                      >
                        {submission.filePath && isImageFile(submission.filePath) && (
                          <button
                            onClick={() => setLightboxImage(submission.filePath)}
                            className="w-full h-48 sm:h-64 flex items-center justify-center bg-black/30
                                       cursor-zoom-in border-0 p-0 group relative overflow-hidden"
                            aria-label="View full image"
                          >
                            <img
                              src={submission.filePath}
                              alt="Submission"
                              className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                            />
                            <div
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100
                                         transition-opacity duration-200"
                              style={{ background: 'rgba(5,5,15,0.3)' }}
                            >
                              <span className="text-white text-xs font-bold tracking-wide uppercase px-3 py-1.5 rounded-full border border-white/30"
                                    style={{ background: 'rgba(17,17,42,0.7)' }}>
                                🔍 View full size
                              </span>
                            </div>
                          </button>
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm font-semibold">{submission.user.username}</span>
                            <span className="text-white/30 text-xs">{formatDate(submission.createdAt)}</span>
                          </div>
                          {submission.comment && (
                            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap mb-2">
                              {submission.comment}
                            </p>
                          )}
                          {submission.filePath && !isImageFile(submission.filePath) && (
                            <a
                              href={submission.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00BFFF] no-underline hover:opacity-70 transition-opacity"
                            >
                              📎 View attachment
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ════════ RIGHT — Sticky submission action panel ════════ */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 flex flex-col gap-4">

                {/* Status / CTA card */}
                <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-6">

                  {isClosed ? (
                    <div className="text-center py-4">
                      <div className="text-2xl mb-2">🔒</div>
                      <div className="text-[#FF2D78] font-bold text-sm mb-1">Submissions closed</div>
                      <div className="text-white/35 text-xs">This bounty is no longer accepting entries.</div>
                    </div>
                  ) : isOwner ? (
                    <div className="text-center py-4">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-white font-bold text-sm mb-1">This is your bounty</div>
                      <div className="text-white/35 text-xs">You can't submit to your own bounty.</div>
                    </div>
                  ) : alreadySubmitted ? (
                    <div className="text-center py-4">
                      <div className="text-2xl mb-2">✅</div>
                      <div className="text-[#00BFFF] font-bold text-sm mb-1">Submission sent</div>
                      <div className="text-white/35 text-xs">You've already submitted to this bounty.</div>
                    </div>
                  ) : !showForm ? (
                    <button
                      onClick={handleAddSubmissionClick}
                      disabled={userLoading}
                      className="w-full text-white font-bold text-sm tracking-wider
                                 px-6 py-3.5 rounded-lg transition-all duration-200
                                 hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{
                        background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                        boxShadow: '0 0 24px rgba(0,191,255,0.25)',
                      }}
                    >
                      Add Your Submission →
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitEntry} className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">Your submission</span>
                        <button
                          type="button"
                          onClick={() => setShowForm(false)}
                          className="text-white/30 hover:text-white text-xs bg-transparent border-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Comment */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="comment" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                          Comment
                        </label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Describe your entry..."
                          className="w-full px-3.5 py-2.5 rounded-lg text-white text-sm placeholder-white/25 resize-none
                                     focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
                        />
                      </div>

                      {/* File */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                          Attachment <span className="text-white/30 font-normal">(optional)</span>
                        </label>

                        {!file ? (
                          <label
                            htmlFor="submissionFile"
                            className="flex flex-col items-center justify-center gap-1.5 px-3 py-6 rounded-lg border-2 border-dashed
                                       border-[rgba(0,191,255,0.2)] cursor-pointer hover:border-[rgba(0,191,255,0.4)]
                                       transition-colors duration-200"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                          >
                            <span className="text-lg">📎</span>
                            <span className="text-white/40 text-xs">Click to attach a file</span>
                            <input id="submissionFile" type="file" onChange={handleFileChange} className="hidden" />
                          </label>
                        ) : (
                          <div
                            className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-[rgba(0,191,255,0.15)]"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {filePreview ? (
                                <img src={filePreview} alt="Preview" className="w-8 h-8 rounded object-cover shrink-0" />
                              ) : (
                                <span className="text-base shrink-0">📄</span>
                              )}
                              <span className="text-white/70 text-xs truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="text-[#FF2D78] text-[0.65rem] font-bold uppercase bg-transparent border-0 cursor-pointer hover:opacity-70 shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {submitMessage && (
                        <div
                          className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border ${
                            submitMessage.type === 'success'
                              ? 'text-[#00BFFF] border-[rgba(0,191,255,0.35)]'
                              : 'text-[#FF2D78] border-[rgba(255,45,120,0.35)]'
                          }`}
                          style={{
                            background: submitMessage.type === 'success' ? 'rgba(0,191,255,0.1)' : 'rgba(255,45,120,0.1)',
                          }}
                        >
                          <span className="shrink-0">{submitMessage.type === 'success' ? '✓' : '⚠'}</span>
                          <span className="leading-relaxed">{submitMessage.text}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full text-white font-bold text-sm tracking-wider
                                   px-6 py-3 rounded-lg transition-all duration-200
                                   hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        style={{
                          background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                          boxShadow: '0 0 24px rgba(0,191,255,0.25)',
                        }}
                      >
                        {submitting ? submitLabel : 'Send Submission →'}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

      </section>

      {/* Login-required modal overlay — triggered by clicking "Add Your Submission" while logged out */}
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}

      {/* Fullscreen image lightbox — opened by clicking any bounty or submission image */}
      {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </Layout>
  )
}