import type { Element, ElementLocation } from '../../types'
import type { SetTemplateStore, GetTemplateStore } from '../types'
import { saveToHistory } from '../../helpers'
import { getSectionHeight, getSectionElements, updateSectionElements } from './shared'

export interface ElementAddSlice {
  addElement: (element: Element, location?: ElementLocation) => void
}

function normalizeElement(element: Element, location: ElementLocation, template: any): Element {
  if (element.type !== 'container' && element.type !== 'spacer') {
    return { ...element }
  }

  const sectionHeight = getSectionHeight(template, location)
  const topElements = getSectionElements(template, location).filter(
    (el) => el.type === 'container' || el.type === 'spacer'
  )
  let nextY = 0

  if (topElements.length > 0) {
    const last = topElements[topElements.length - 1]
    const lastH =
      typeof last.height === 'number'
        ? last.height
        : last.type === 'spacer'
        ? 50
        : 120
    const lastY = typeof last.y === 'number' ? last.y : 0

    if (element.type === 'container' && element.pageBreakBefore && location === 'body') {
      const pageIndex = Math.floor((lastY + lastH - 0.1) / (sectionHeight || 1))
      nextY = (pageIndex + 1) * sectionHeight
    } else {
      nextY = lastY + lastH
    }
  } else if (typeof element.y === 'number' && element.y > 0) {
    nextY = element.y
  }

  const yOnPage = location === 'body' && sectionHeight > 0 ? nextY % sectionHeight : nextY
  const remainingHeight = Math.max(30, sectionHeight - yOnPage)
  const defaultHeight = element.type === 'spacer' ? 50 : 120
  const height = Math.min(typeof element.height === 'number' ? element.height : defaultHeight, remainingHeight)

  return { ...element, x: 0, y: nextY, width: '100%', height }
}

function findTargetLoop(elements: Element[], loopParentId: string | null, selectedId?: string): Element | null {
  if (loopParentId) {
    const direct = elements.find((el) => el.id === loopParentId && el.type === 'loop')
    if (direct) return direct
    for (const el of elements) {
      const nested = el.elements?.find((c) => c.id === loopParentId && c.type === 'loop')
      if (nested) return nested
    }
  }

  if (selectedId) {
    const direct = elements.find((el) => el.id === selectedId && el.type === 'loop')
    if (direct) return direct
    for (const el of elements) {
      const nested = el.elements?.find((c) => c.id === selectedId && c.type === 'loop')
      if (nested) return nested
      const parent = el.elements?.find((c) => c.type === 'loop' && c.elements?.some((gc) => gc.id === selectedId))
      if (parent) return parent
    }
    return elements.find((el) => el.type === 'loop' && el.elements?.some((c) => c.id === selectedId)) || null
  }

  return null
}

function insertIntoLoop(elements: Element[], targetLoop: Element, el: Element) {
  const children = targetLoop.elements || []
  const last = children[children.length - 1]
  const lastH = typeof last?.height === 'number' ? last.height : 20
  const childY = last ? (typeof last.y === 'number' ? last.y : 0) + lastH + 8 : (el.y ?? 10)
  const childX = last ? (last.x ?? (el.x ?? 10)) : (el.x ?? 10)
  const childWidth = el.width ?? (typeof last?.width === 'number' ? last.width : undefined)

  if (String(last?.positionMode || last?.position || '').toUpperCase() === 'RELATIVE') {
    el.positionMode = 'RELATIVE'
    el.position = 'relative'
    el.relativeOffsetY = 0
  }

  const adapted: Element = { ...el, x: childX, y: childY, ...(childWidth !== undefined ? { width: childWidth } : {}) }
  const addRec = (list: Element[]): Element[] =>
    list.map((item) => {
      if (item.id === targetLoop.id && item.type === 'loop') {
        return { ...item, elements: [...children, adapted] }
      }
      return item.elements?.length ? { ...item, elements: addRec(item.elements) } : item
    })

  return { newElements: addRec(elements), newSelectedId: targetLoop.id, newSelectedChildId: adapted.id, isTargetLoop: true }
}

function findTargetContainer(elements: Element[], selectedId?: string, parentId?: string | null): Element | null {
  if (selectedId) {
    const selectedIdx = elements.findIndex((el) => el.id === selectedId)
    if (selectedIdx !== -1) {
      const selectedEl = elements[selectedIdx]
      if (selectedEl.type === 'container') {
        return selectedEl
      }
    }
  }
  if (parentId) {
    const parent = elements.find((el) => el.id === parentId && el.type === 'container')
    if (parent) return parent
  }
  if (selectedId) {
    const withChild = elements.find((el) => el.type === 'container' && el.elements?.some((c) => c.id === selectedId))
    if (withChild) return withChild
  }
  const containers = elements.filter((el) => el.type === 'container')
  return containers.length > 0 ? containers[containers.length - 1] : null
}

function createAutoContainer(location: ElementLocation, sectionHeight: number, child: Element): Element {
  return {
    type: 'container',
    id: `container-${location}-${Date.now()}`,
    name: `${location.toUpperCase()} Container`,
    x: 0,
    y: 0,
    width: '100%',
    height: Math.min(200, Math.max(30, sectionHeight)),
    heightMode: 'auto',
    autoHeight: true,
    elements: [{ ...child, x: child.x ?? 20, y: child.y ?? 20 }],
  }
}

function insertIntoContainer(
  elements: Element[],
  container: Element | null,
  el: Element,
  location: ElementLocation,
  sectionHeight: number
) {
  if (!container) {
    const auto = createAutoContainer(location, sectionHeight, el)
    return { newElements: [...elements, auto], newSelectedId: auto.id, newSelectedChildId: auto.elements![0].id, isTargetLoop: false }
  }

  const children = container.elements || []
  const last = children[children.length - 1]
  const lastH = typeof last?.height === 'number' ? last.height : 25
  const childY = last ? (typeof last.y === 'number' ? last.y : 0) + lastH + 10 : (el.y ?? 20)
  const childX = last ? (last.x ?? (el.x ?? 20)) : (el.x ?? 20)
  const childWidth = el.width ?? (typeof last?.width === 'number' ? last.width : undefined)

  if (String(last?.positionMode || last?.position || '').toUpperCase() === 'RELATIVE') {
    el.positionMode = 'RELATIVE'
    el.position = 'relative'
    el.relativeOffsetY = 0
  }

  const adapted: Element = { ...el, x: childX, y: childY, ...(childWidth !== undefined ? { width: childWidth } : {}) }
  const childBottom = childY + (typeof adapted.height === 'number' ? adapted.height : 25)
  const requiredH = childBottom + 15
  const currentH = typeof container.height === 'number' ? container.height : 150
  const isFixed = container.heightMode === 'fixed' || container.autoHeight === false
  const containerYOnPage =
    location === 'body' && sectionHeight > 0 ? (container.y || 0) % sectionHeight : (container.y || 0)
  const maxH = Math.max(30, sectionHeight - containerYOnPage)

  if (isFixed && childBottom > currentH) {
    alert(`O container "${container.name || container.id}" possui altura fixa (${currentH} pt) e não há espaço suficiente para adicionar este elemento (necessário: ${childBottom} pt). Altere para auto-height ou aumente a altura do container.`)
    return { newElements: elements, newSelectedId: container.id, newSelectedChildId: null, isTargetLoop: false }
  }
  if (!isFixed && childBottom > maxH) {
    alert(`Não é possível adicionar o elemento: o container ultrapassaria o limite da página (altura máxima disponível: ${Math.round(maxH)} pt, necessário: ${Math.round(childBottom)} pt).`)
    return { newElements: elements, newSelectedId: container.id, newSelectedChildId: null, isTargetLoop: false }
  }

  const newContainerH = (!isFixed && requiredH > currentH) ? Math.min(requiredH, maxH) : currentH
  const deltaH = newContainerH - currentH
  const targetIdx = elements.findIndex((item) => item.id === container.id)

  const currentPageIndex =
    location === 'body' && sectionHeight > 0 ? Math.floor((container.y || 0) / sectionHeight) : 0
  const pageLimit = (currentPageIndex + 1) * sectionHeight

  if (
    deltaH > 0 &&
    elements.some((item, idx) => {
      if (idx <= targetIdx) return false
      const hasPageBreakBetween = elements.slice(targetIdx + 1, idx + 1).some((e) => e.type === 'container' && e.pageBreakBefore)
      if (hasPageBreakBetween) return false
      const itemBottom =
        (typeof item.y === 'number' ? item.y : 0) + deltaH + (typeof item.height === 'number' ? item.height : 30)
      return itemBottom > pageLimit
    })
  ) {
    alert('Não é possível adicionar o elemento: os containers seguintes seriam empurrados para fora da página.')
    return { newElements: elements, newSelectedId: container.id, newSelectedChildId: null, isTargetLoop: false }
  }

  return {
    newElements: elements.map((item, idx) => {
      if (item.id === container.id) return { ...item, height: newContainerH, elements: [...children, adapted] }
      if (deltaH > 0 && idx > targetIdx && typeof item.y === 'number') return { ...item, y: item.y + deltaH }
      return item
    }),
    newSelectedId: container.id,
    newSelectedChildId: adapted.id,
    isTargetLoop: false,
  }
}

export const createElementAdd = (
  set: SetTemplateStore,
  _get: GetTemplateStore
): ElementAddSlice => ({
  addElement: (element: Element, location: ElementLocation = 'body') =>
    set((state) => {
      const normalizedElement = normalizeElement(element, location, state.template)
      const sectionHeight = getSectionHeight(state.template, location)
      const sectionElements = getSectionElements(state.template, location)

      let res: { newElements: Element[]; newSelectedId: string; newSelectedChildId: string | null; isTargetLoop: boolean }

      if (normalizedElement.type === 'container' || normalizedElement.type === 'spacer') {
        res = { newElements: [...sectionElements, normalizedElement], newSelectedId: normalizedElement.id, newSelectedChildId: null, isTargetLoop: false }
      } else {
        const loop = findTargetLoop(sectionElements, state.selectedLoopParentId, state.selectedElementIds[0])
        if (loop) {
          res = insertIntoLoop(sectionElements, loop, normalizedElement)
        } else {
          const container = findTargetContainer(sectionElements, state.selectedElementIds[0], state.selectedContainerParentId)
          res = insertIntoContainer(sectionElements, container, normalizedElement, location, sectionHeight)
        }
      }

      const { newElements, newSelectedId, newSelectedChildId, isTargetLoop } = res
      const newTemplate = updateSectionElements(state.template, location, () => newElements)

      return {
        template: newTemplate,
        selectedElementIds: [newSelectedId],
        selectedContainerChildId: isTargetLoop ? null : newSelectedChildId,
        selectedContainerParentId: isTargetLoop ? null : (newSelectedChildId ? newSelectedId : null),
        selectedLoopChildId: isTargetLoop ? newSelectedChildId : null,
        selectedLoopParentId: isTargetLoop ? newSelectedId : null,
        selectedElementLocation: location,
        isDirty: true,
        ...saveToHistory(state, newTemplate),
      }
    }),
})
