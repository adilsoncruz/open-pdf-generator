import type { PanelProps } from './Panel.types'

export const Panel = ({
  title,
  icon,
  isExpanded = true,
  onToggle,
  collapsible = false,
  children,
  className = ''
}: PanelProps) => {
  return (
    <div className={`p-3 theme-bg-tertiary border theme-border rounded-xl ${className}`}>
      <div 
        className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? onToggle : undefined}
      >
        <h2 className="section-header flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {collapsible && (
          <button
            className="theme-text-muted hover:theme-surface rounded p-0.5"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className={collapsible ? 'mt-3' : ''}>
          {children}
        </div>
      )}
    </div>
  )
}
