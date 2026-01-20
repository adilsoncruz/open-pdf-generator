import { clsx } from 'clsx'

export type DividerProps = {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return (
    <div
      className={clsx(
        'theme-border',
        orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full',
        className
      )}
    />
  )
}
