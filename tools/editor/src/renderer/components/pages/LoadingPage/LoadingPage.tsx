import { useEffect, useState } from 'react'

interface StudioLogoProps {
  className?: string
  animated?: boolean
}

export function StudioLogo({ className = 'h-24 w-24', animated = false }: StudioLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-label="Open PDF Template Studio"
    >
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B0F19" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="loopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="gridAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
        <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#4F46E5" floodOpacity="0.45" />
        </filter>
      </defs>

      {animated && (
        <style>{`
          @keyframes stemGrow {
            0% { transform: scaleY(0); opacity: 0; }
            35%, 100% { transform: scaleY(1); opacity: 1; }
          }
          @keyframes loopSweep {
            0%, 15% { transform: scaleX(0); opacity: 0; }
            50%, 100% { transform: scaleX(1); opacity: 1; }
          }
          @keyframes blockPop1 {
            0%, 35% { transform: scale(0) rotate(-12deg); opacity: 0; }
            65% { transform: scale(1.12) rotate(2deg); opacity: 1; }
            80%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes blockFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes crossSpin {
            0% { transform: rotate(0deg) scale(0.85); opacity: 0.45; }
            50% { transform: rotate(90deg) scale(1.2); opacity: 1; }
            100% { transform: rotate(180deg) scale(0.85); opacity: 0.45; }
          }
          .m-stem {
            transform-box: fill-box;
            transform-origin: bottom center;
            animation: stemGrow 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .m-loop {
            transform-box: fill-box;
            transform-origin: left center;
            animation: loopSweep 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .m-b1 {
            transform-box: fill-box;
            transform-origin: center;
            animation: blockPop1 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards, blockFloat 2s ease-in-out 1.2s infinite;
          }
          .m-b2 {
            transform-box: fill-box;
            transform-origin: center;
            animation: blockPop1 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both, blockFloat 2s ease-in-out 1.35s infinite;
          }
          .m-b3 {
            transform-box: fill-box;
            transform-origin: center;
            animation: blockPop1 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.24s both, blockFloat 2s ease-in-out 1.5s infinite;
          }
          .m-cross {
            transform-box: fill-box;
            transform-origin: center;
            animation: crossSpin 2.4s ease-in-out infinite;
          }
        `}</style>
      )}

      {/* Squircle Base */}
      <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bg2)" />

      {/* Subtle Golden Ratio Grid Lines */}
      <g stroke="#6366F1" strokeOpacity="0.16" strokeWidth="2">
        <line x1="148" y1="40" x2="148" y2="472" />
        <line x1="232" y1="40" x2="232" y2="472" />
        <line x1="364" y1="40" x2="364" y2="472" />
        <line x1="40" y1="120" x2="472" y2="120" />
        <line x1="40" y1="296" x2="472" y2="296" />
        <line x1="40" y1="392" x2="472" y2="392" />
      </g>
      <rect x="26" y="26" width="460" height="460" rx="110" stroke="#818CF8" strokeOpacity="0.35" strokeWidth="4" />

      {/* Geometric P Monogram + Layout Blocks */}
      <g filter="url(#glow2)">
        <path
          className={animated ? 'm-loop' : undefined}
          d="M 148 120 H 288 C 336 120 372 156 372 208 C 372 260 336 296 288 296 H 212 V 232 H 280 C 296 232 308 222 308 208 C 308 194 296 184 280 184 H 148 Z"
          fill="url(#loopGrad)"
        />
        <rect
          className={animated ? 'm-stem' : undefined}
          x="148"
          y="120"
          width="64"
          height="272"
          rx="32"
          fill="url(#stemGrad)"
        />
        <rect
          className={animated ? 'm-b1' : undefined}
          x="244"
          y="324"
          width="68"
          height="68"
          rx="18"
          fill="url(#gridAccent)"
        />
        <rect
          className={animated ? 'm-b2' : undefined}
          x="328"
          y="324"
          width="36"
          height="30"
          rx="10"
          fill="#38BDF8"
          fillOpacity="0.9"
        />
        <rect
          className={animated ? 'm-b3' : undefined}
          x="328"
          y="362"
          width="36"
          height="30"
          rx="10"
          fill="#818CF8"
          fillOpacity="0.9"
        />
      </g>

      {/* Corner Precision Crosshairs */}
      <g
        className={animated ? 'm-cross' : undefined}
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.8"
      >
        <path d="M 140 120 H 156 M 148 112 V 128" />
        <path d="M 364 208 H 380 M 372 200 V 216" />
        <path d="M 236 324 H 252 M 244 316 V 332" />
      </g>
    </svg>
  )
}

const LOADING_STEPS = [
  { threshold: 0, label: 'Inicializando Studio Slate Engine...' },
  { threshold: 32, label: 'Carregando componentes e fontes de template...' },
  { threshold: 68, label: 'Preparando workspace e histórico...' },
  { threshold: 92, label: 'Pronto para começar' },
]

export function LoadingPage() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const durationMs = 2000
    const startTime = performance.now()
    let rafId = 0

    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))

      if (t < 1) {
        rafId = window.requestAnimationFrame(tick)
      }
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [])

  const currentStepLabel =
    [...LOADING_STEPS].reverse().find((s) => progress >= s.threshold)?.label ?? LOADING_STEPS[0].label

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center select-none">
      {/* Ambient Studio Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[420px] w-[420px] rounded-full bg-indigo-600/12 blur-[110px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-8 text-center">
        <div className="relative mx-auto inline-flex items-center justify-center">
          <div className="absolute -inset-4 rounded-[38px] bg-indigo-500/20 blur-2xl animate-pulse" />
          <StudioLogo
            animated
            className="relative h-36 w-36 rounded-[30px] shadow-[0_18px_50px_rgba(79,70,229,0.4)]"
          />
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-slate-50">
          Open PDF Template Studio
        </h1>
        <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.2em] text-indigo-400/90">
          Studio Slate Edition
        </p>

        {/* Progress Bar + Status */}
        <div className="mx-auto mt-8 w-72">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-slate-400 transition-all duration-200 truncate pr-2">
              {currentStepLabel}
            </span>
            <span className="font-mono font-semibold text-indigo-300 tabular-nums">
              {progress}%
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90 p-[1px] ring-1 ring-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_16px_rgba(99,102,241,0.85)] transition-[width] duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
