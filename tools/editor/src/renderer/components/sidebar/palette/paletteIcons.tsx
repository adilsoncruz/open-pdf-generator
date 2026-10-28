const iconBaseClass = 'w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5'

export function TextIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  )
}

export function StaticTextIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 10h16M4 14h12M4 18h8" strokeLinecap="round" />
    </svg>
  )
}

export function RichTextIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h10M4 18h14" />
    </svg>
  )
}

export function HyperlinkIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

export function ContainerIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="3 3" />
    </svg>
  )
}

export function LoopIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

export function SpacerIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3h10M7 21h10M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3" />
    </svg>
  )
}

export function PageBreakIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12h16M14 3l4 4H14V3z" />
      <path d="M5 21h14a2 2 0 0 0 2-2V7l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
    </svg>
  )
}

export function ImageIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export function TableIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  )
}

export function ShapeIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}

export function LineIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function QrCodeIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="4" height="4" />
      <path d="M18 18h3v3h-3z" />
    </svg>
  )
}

export function BarcodeIcon() {
  return (
    <svg className={iconBaseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M19 5v14" />
    </svg>
  )
}
