import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const diffMs = new Date(targetDate).getTime() - Date.now()

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60)
  const seconds = Math.floor((diffMs / 1000) % 60)

  return { days, hours, minutes, seconds, expired: false }
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    // re-sync immediately in case targetDate changed
    setTimeLeft(calculateTimeLeft(targetDate))

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-1.5 text-[#FF2D78] text-xs font-bold tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78]" />
        Closed
      </div>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  // Pick which units to show — don't waste space on "00d" if it's been days already and now under an hour
  const showDays = timeLeft.days > 0
  const urgent = timeLeft.days === 0 && timeLeft.hours === 0 // under 1 hour left

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <span className="text-white/35 text-[0.65rem] font-semibold tracking-wide uppercase">Time left</span>
        <div
          className={`flex items-center gap-1 font-mono text-xs font-bold tabular-nums ${
            urgent ? 'text-[#FF2D78]' : 'text-[#00BFFF]'
          }`}
        >
          {showDays && <span>{timeLeft.days}d</span>}
          <span>{pad(timeLeft.hours)}h</span>
          <span>{pad(timeLeft.minutes)}m</span>
          <span>{pad(timeLeft.seconds)}s</span>
        </div>
      </div>

      {/* Progress bar visual — pulses red under 1 hour */}
      <div className="w-full h-1 rounded-full overflow-hidden bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'animate-pulse' : ''}`}
          style={{
            width: '100%',
            background: urgent
              ? 'linear-gradient(90deg, #FF2D78, #FF6B9D)'
              : 'linear-gradient(90deg, #00BFFF, #BF5FFF)',
          }}
        />
      </div>
    </div>
  )
}