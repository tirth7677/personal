import { useEffect } from 'react'

interface ImageLightboxProps {
  src: string
  alt?: string
  onClose: () => void
}

export default function ImageLightbox({ src, alt = 'Image', onClose }: ImageLightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    // Prevent background scroll while lightbox is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(5,5,15,0.95)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close image"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full
                   flex items-center justify-center text-white text-xl font-bold
                   border border-[rgba(0,191,255,0.3)] bg-transparent cursor-pointer
                   hover:border-[rgba(0,191,255,0.6)] hover:bg-[rgba(0,191,255,0.1)]
                   transition-all duration-200 z-10"
        style={{ background: 'rgba(17,17,42,0.8)' }}
      >
        ✕
      </button>

      {/* Image — click stops propagation so clicking the image itself doesn't close */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
      />
    </div>
  )
}