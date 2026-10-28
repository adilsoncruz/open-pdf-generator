export function resolveChildWidth(
  value: string | number | undefined,
  loopWidth: number
): number {
  if (value === '100%') return loopWidth
  if (typeof value === 'number') return value
  return 100
}

export function resolveChildHeight(
  value: string | number | undefined,
  loopHeight: number
): number {
  if (value === '100%') return loopHeight
  if (typeof value === 'number') return value
  return 20
}
