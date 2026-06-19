import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useUser } from '../context/UserContext'

export default function CreateBounty() {
  const navigate = useNavigate()
  const { user, refreshUser } = useUser()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Minimum allowed datetime — now, formatted for the input[type=datetime-local]
  const minDateTime = new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const parsedPrice = Number(price)

    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' })
      return
    }
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid positive Bcoin price.' })
      return
    }
    if ((user?.bcoins ?? 0) < parsedPrice) {
      setMessage({ type: 'error', text: `Insufficient Bcoins. You have ${user?.bcoins ?? 0}, but this bounty costs ${parsedPrice}.` })
      return
    }
    if (!timeLimit) {
      setMessage({ type: 'error', text: 'Please select a deadline.' })
      return
    }
    if (new Date(timeLimit).getTime() <= Date.now()) {
      setMessage({ type: 'error', text: 'Deadline must be in the future.' })
      return
    }
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Description is required.' })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('price', price)
      formData.append('timeLimit', new Date(timeLimit).toISOString())
      formData.append('description', description)
      if (file) formData.append('file', file)

      const res = await fetch('http://localhost:5000/api/v1/bounty/create', {
        method: 'POST',
        credentials: 'include',
        body: formData, // no Content-Type header — browser sets multipart boundary automatically
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Bounty created successfully!' })
        await refreshUser() // sync the new (lower) Bcoin balance everywhere instantly
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create bounty.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not connect to server. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const parsedPriceLive = Number(price) || 0
  const remainingAfter = (user?.bcoins ?? 0) - parsedPriceLive

  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-16 lg:py-24 max-w-3xl mx-auto">

        <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">Create</div>
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
          Post a Bounty
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-lg mb-10">
          Set the prize, set the deadline, set the rules. You pick the winner — or our system will if you don't.
        </p>

        {/* Current balance strip */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-xl mb-8 border border-[rgba(0,191,255,0.15)]"
          style={{ background: 'rgba(0,191,255,0.04)' }}
        >
          <span className="text-white/50 text-sm">Your balance</span>
          <span className="font-mono text-[#00BFFF] text-sm font-bold">
            🪙 {(user?.bcoins ?? 0).toLocaleString()} Bcoins
          </span>
        </div>

        <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design a logo for my food startup"
                className="w-full px-4 py-3 rounded-lg text-white text-sm placeholder-white/25
                           focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>

            {/* Price + Deadline side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="price" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                  Prize (Bcoins)
                </label>
                <input
                  id="price"
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-lg text-white text-sm placeholder-white/25
                             focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="timeLimit" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                  Deadline
                </label>
                <input
                  id="timeLimit"
                  type="datetime-local"
                  required
                  min={minDateTime}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-white text-sm
                             focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Live balance preview */}
            {parsedPriceLive > 0 && (
              <div
                className={`rounded-lg border divide-y divide-[rgba(255,255,255,0.06)] ${
                  remainingAfter < 0 ? 'border-[rgba(255,45,120,0.3)]' : 'border-[rgba(0,191,255,0.12)]'
                }`}
                style={{ background: remainingAfter < 0 ? 'rgba(255,45,120,0.06)' : 'rgba(0,191,255,0.04)' }}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-white/50 text-sm">Bounty cost</span>
                  <span className="font-mono text-white text-sm font-bold">🪙 {parsedPriceLive.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-white/60 text-sm font-semibold">Remaining after posting</span>
                  <span className={`font-mono text-sm font-bold ${remainingAfter < 0 ? 'text-[#FF2D78]' : 'text-[#00BFFF]'}`}>
                    🪙 {remainingAfter.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                Description
              </label>
              <textarea
                id="description"
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain exactly what you want. Be specific — clearer briefs get better entries."
                className="w-full px-4 py-3 rounded-lg text-white text-sm placeholder-white/25 resize-none
                           focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
              />
            </div>

            {/* File upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-white/50 text-xs font-semibold tracking-wide uppercase">
                Attachment <span className="text-white/30 font-normal">(optional)</span>
              </label>

              {!file ? (
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-lg border-2 border-dashed
                             border-[rgba(0,191,255,0.2)] cursor-pointer hover:border-[rgba(0,191,255,0.4)]
                             transition-colors duration-200"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-2xl">📎</span>
                  <span className="text-white/40 text-sm">Click to attach a reference file</span>
                  <input id="file" type="file" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-[rgba(0,191,255,0.15)]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-10 h-10 rounded object-cover shrink-0" />
                    ) : (
                      <span className="text-xl shrink-0">📄</span>
                    )}
                    <span className="text-white/70 text-sm truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-[#FF2D78] text-xs font-bold uppercase tracking-wide bg-transparent border-0 cursor-pointer hover:opacity-70 transition-opacity shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Message */}
            {message && (
              <div
                className={`flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm font-medium border ${
                  message.type === 'success'
                    ? 'text-[#00BFFF] border-[rgba(0,191,255,0.35)]'
                    : 'text-[#FF2D78] border-[rgba(255,45,120,0.35)]'
                }`}
                style={{
                  background: message.type === 'success' ? 'rgba(0,191,255,0.1)' : 'rgba(255,45,120,0.1)',
                }}
              >
                <span className="shrink-0">{message.type === 'success' ? '✓' : '⚠'}</span>
                <span className="leading-relaxed">{message.text}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="text-white font-bold text-sm tracking-wider
                         px-8 py-3.5 rounded-lg transition-all duration-200 mt-2
                         hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                boxShadow: '0 0 24px rgba(0,191,255,0.25)',
              }}
            >
              {loading ? 'Posting bounty...' : 'Post Bounty →'}
            </button>

          </form>
        </div>

      </section>
    </Layout>
  )
}