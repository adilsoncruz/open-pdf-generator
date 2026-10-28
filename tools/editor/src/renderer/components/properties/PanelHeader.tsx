export interface PanelHeaderProps {
  title: string
  subtitle?: string
}

export function PanelHeader({ title, subtitle }: PanelHeaderProps) {
  return (
    <div className="p-3 border-b theme-border flex items-center justify-between shrink-0">
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold theme-text truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs theme-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
