import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useUser } from '../context/UserContext'

declare global {
  interface Window {
    Razorpay: any
  }
}

const PRESET_AMOUNTS = [100, 500, 1000]

export default function Wallet() {
  const { user, refreshUser } = useUser()

  const [selectedAmount, setSelectedAmount] = useState<number | null>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load Razorpay checkout script once
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setMessage({ type: 'error', text: 'Failed to load payment gateway. Please refresh and try again.' })
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const getFinalAmount = (): number => {
    if (customAmount) return parseInt(customAmount, 10)
    return selectedAmount || 0
  }

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt)
    setCustomAmount('')
  }

  const handleCustomChange = (val: string) => {
    // allow only digits
    const cleaned = val.replace(/[^0-9]/g, '')
    setCustomAmount(cleaned)
    setSelectedAmount(null)
  }

  const handleAddBcoins = async () => {
    setMessage(null)
    const amount = getFinalAmount()

    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount.' })
      return
    }

    if (!scriptLoaded || !window.Razorpay) {
      setMessage({ type: 'error', text: 'Payment gateway is still loading. Please wait a moment.' })
      return
    }

    setLoading(true)

    try {
      // STEP 1 — Create order on our backend
      const orderRes = await fetch('http://localhost:5000/api/v1/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      })

      const orderData = await orderRes.json()

      if (!orderData.success) {
        setMessage({ type: 'error', text: orderData.message || 'Could not create payment order.' })
        setLoading(false)
        return
      }

      const { orderId, amount: orderAmount, currency, keyId } = orderData.data

      // STEP 2 — Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: orderAmount,
        currency,
        name: 'Indian Bounty.fun',
        description: `Add ${amount} Bcoins`,
        order_id: orderId,
        theme: {
          color: '#BF5FFF',
          backdrop_color: 'rgba(5,5,15,0.85)',
        },
        method: {
          upi: true,
          card: true,
          netbanking: false,
          wallet: false,
          paylater: false,
          emi: false,
        },
        handler: async (response: any) => {
          // STEP 3 — Verify payment on our backend
          try {
            const verifyRes = await fetch('http://localhost:5000/api/v1/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              // Refresh shared UserContext — this single call updates the balance
              // everywhere it's displayed (this page AND the navbar pill in Layout)
              // since both read from the same context instance.
              await refreshUser()
              setMessage({ type: 'success', text: verifyData.message || 'Bcoins credited successfully!' })
            } else {
              setMessage({ type: 'error', text: verifyData.message || 'Payment verification failed.' })
            }
          } catch {
            setMessage({ type: 'error', text: 'Could not verify payment. Contact support if money was deducted.' })
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setMessage({ type: 'error', text: 'Payment cancelled.' })
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not connect to server. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <Layout>
      <section className="px-4 sm:px-8 lg:px-16 py-16 lg:py-24 max-w-4xl mx-auto">

        <div className="text-[#00BFFF] text-xs font-semibold tracking-widest uppercase mb-3">Wallet</div>
        <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
          Your Bcoins
        </h1>
        <p className="text-white/50 text-base leading-relaxed max-w-lg mb-10">
          Add Bcoins to post bounties. ₹1 = 1 Bcoin, with a 10% platform fee on deposit.
        </p>

        {/* Balance card — reads directly from shared UserContext */}
        <div
          className="rounded-2xl border border-[rgba(0,191,255,0.2)] p-8 mb-10"
          style={{ background: 'linear-gradient(135deg, rgba(0,191,255,0.06) 0%, rgba(191,95,255,0.08) 100%)' }}
        >
          <div className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-2">Current Balance</div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🪙</span>
            <span
              className="font-mono font-bold text-4xl sm:text-5xl"
              style={{
                background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {(user?.bcoins ?? 0).toLocaleString()}
            </span>
            <span className="text-white/40 text-sm font-semibold">Bcoins</span>
          </div>
        </div>

        {/* Add Bcoins card */}
        <div className="bg-[#11112A] border border-[rgba(0,191,255,0.15)] rounded-xl p-6 sm:p-8">
          <h2 className="font-bold text-lg sm:text-xl text-white mb-1">Add Bcoins</h2>
          <p className="text-white/40 text-sm mb-6">Choose an amount or enter a custom one.</p>

          {/* Preset buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => handleSelectPreset(amt)}
                className={`py-3 rounded-lg text-sm font-bold tracking-wide border transition-all duration-200
                            ${selectedAmount === amt && !customAmount
                              ? 'text-[#00BFFF] border-[#00BFFF] bg-[rgba(0,191,255,0.1)]'
                              : 'text-white/60 border-white/10 hover:border-[rgba(0,191,255,0.3)]'}`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex flex-col gap-1.5 mb-6">
            <label htmlFor="customAmount" className="text-white/50 text-xs font-semibold tracking-wide uppercase">
              Custom amount (₹)
            </label>
            <input
              id="customAmount"
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-lg text-white text-sm placeholder-white/25
                         focus:outline-none focus:border-[#00BFFF] transition-colors duration-200"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
            />
          </div>

          {/* Fee breakdown — full transparency */}
          {getFinalAmount() > 0 && (
            <div
              className="rounded-lg mb-6 border border-[rgba(0,191,255,0.12)] divide-y divide-[rgba(255,255,255,0.06)]"
              style={{ background: 'rgba(0,191,255,0.04)' }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/50 text-sm">You pay</span>
                <span className="font-mono text-white text-sm font-bold">
                  ₹{getFinalAmount().toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/50 text-sm">Platform fee (10%)</span>
                <span className="font-mono text-[#FF2D78] text-sm font-bold">
                  − ₹{Math.ceil(getFinalAmount() * 0.1).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-white/60 text-sm font-semibold">You'll receive</span>
                <span className="font-mono text-[#00BFFF] text-sm font-bold">
                  🪙 {Math.floor(getFinalAmount() * 0.9).toLocaleString()} Bcoins
                </span>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm font-medium border mb-6 ${
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
            onClick={handleAddBcoins}
            disabled={loading || getFinalAmount() <= 0}
            className="w-full text-white font-bold text-sm tracking-wider
                       px-8 py-3.5 rounded-lg transition-all duration-200
                       hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
              boxShadow: '0 0 24px rgba(0,191,255,0.25)',
            }}
          >
            {loading ? 'Processing...' : `Add ₹${getFinalAmount() || 0} via UPI →`}
          </button>
        </div>

      </section>
    </Layout>
  )
}