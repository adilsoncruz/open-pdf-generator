export function resolveChildWidth(value: string | number | undefined, containerWidth: number): number {
  if (value === '100%') return containerWidth
  if (typeof value === 'number') return value
  return 100
}

export function resolveChildHeight(value: string | number | undefined, containerHeight: number): number {
  if (value === '100%') return containerHeight
  if (typeof value === 'number') return value
  return 20
}
