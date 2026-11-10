import type { Element } from '../../../store/templateStore'

export function resolveElementDimensions(
  element: Element,
  pageSize: { width: number; height: number },
  margins: { top: number; right: number; bottom: number; left: number },
  domDimensions?: { width: number; height: number }
): { width: number; height: number } {
  const domWidth = domDimensions?.width || 0
  const domHeight = domDimensions?.height || 0

  let width = 0
  if (typeof element.width === 'number') width = element.width
  else if (element.width === '100%') width = pageSize.width - margins.left - margins.right
  else if (domWidth > 0) width = domWidth
  else width = 100

  let height = 0
  if (typeof element.height === 'number') height = element.height
  else if (domHeight > 0) height = domHeight
  else height = 25

  return { width, height }
}
