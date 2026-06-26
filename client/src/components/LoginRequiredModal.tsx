import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'

interface LoginRequiredModalProps {
  onClose: () => void
}

export default function LoginRequiredModal({ onClose }: LoginRequiredModalProps) {
  const navigate = useNavigate()

  return (
    <>
      {/* Dimmed backdrop — closes modal on click outside */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(5,5,15,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-2xl border border-[rgba(0,191,255,0.2)] p-8 text-center"
          style={{ background: '#11112A', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          onClick={(e) => e.stopPropagation()} // prevent backdrop click from also firing
        >
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img src={logo} alt="Indian Bounty.fun" className="w-12 h-12 object-contain" />
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-5">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                         border text-[#BF5FFF] text-xs font-semibold tracking-widest uppercase"
              style={{ borderColor: 'rgba(191,95,255,0.25)', background: 'rgba(191,95,255,0.07)' }}
            >
              🔒 Login Required
            </div>
          </div>

          <h2 className="font-bold text-xl sm:text-2xl text-white mb-2">
            You need to log in
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-7">
            Log in to submit your entry for this bounty.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-white font-bold text-sm tracking-wider
                         px-8 py-3.5 rounded-lg transition-all duration-200
                         hover:-translate-y-0.5 hover:opacity-90"
              style={{
                background: 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
                boxShadow: '0 0 24px rgba(0,191,255,0.25)',
              }}
            >
              Go to Login →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white/40 hover:text-white/70 text-sm font-medium bg-transparent border-0 cursor-pointer transition-colors"
            >
              Go back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  )
}