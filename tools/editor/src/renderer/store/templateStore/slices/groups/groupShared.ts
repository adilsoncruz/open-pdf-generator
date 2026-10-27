import type { Element, ElementGroup, ElementLocation, Template } from '../../types'

interface SectionContext {
  elements: Element[]
  groups: ElementGroup[]
  apply: (elements: Element[], groups: ElementGroup[]) => Template
}

function getSectionContext(template: Template, location?: ElementLocation): SectionContext {
  const loc = location || 'body'
  if (loc === 'header' && template.pageSettings.header) {
    return {
      elements: template.pageSettings.header.elements || [],
      groups: template.pageSettings.header.groups || [],
      apply: (elements, groups) => ({
        ...template,
        pageSettings: {
          ...template.pageSettings,
          header: { ...template.pageSettings.header!, elements, groups },
        },
      }),
    }
  }
  if (loc === 'footer' && template.pageSettings.footer) {
    return {
      elements: template.pageSettings.footer.elements || [],
      groups: template.pageSettings.footer.groups || [],
      apply: (elements, groups) => ({
        ...template,
        pageSettings: {
          ...template.pageSettings,
          footer: { ...template.pageSettings.footer!, elements, groups },
        },
      }),
    }
  }
  if (loc === 'bodyBackground' && template.pageSettings.bodyBackground) {
    return {
      elements: template.pageSettings.bodyBackground.elements || [],
      groups: template.pageSettings.bodyBackground.groups || [],
      apply: (elements, groups) => ({
        ...template,
        pageSettings: {
          ...template.pageSettings,
          bodyBackground: { ...template.pageSettings.bodyBackground!, elements, groups },
        },
      }),
    }
  }
  if (loc === 'summary' && template.summaryPage) {
    return {
      elements: template.summaryPage.elements || [],
      groups: template.summaryPage.groups || [],
      apply: (elements, groups) => ({
        ...template,
        summaryPage: { ...template.summaryPage!, elements, groups },
      }),
    }
  }
  return {
    elements: template.page || [],
    groups: template.groups || [],
    apply: (elements, groups) => ({
      ...template,
      page: elements,
      groups,
    }),
  }
}

export function getSectionElements(template: Template, location?: ElementLocation): Element[] {
  return getSectionContext(template, location).elements
}

export function getSectionGroups(template: Template, location?: ElementLocation): ElementGroup[] {
  return getSectionContext(template, location).groups
}

export function updateSectionGroups(
  template: Template,
  location: ElementLocation | undefined,
  updater: (groups: ElementGroup[]) => ElementGroup[]
): Template {
  const ctx = getSectionContext(template, location)
  return ctx.apply(ctx.elements, updater(ctx.groups))
}

export function updateSectionElements(
  template: Template,
  location: ElementLocation | undefined,
  elementsUpdater: (elements: Element[]) => Element[]
): Template {
  const ctx = getSectionContext(template, location)
  return ctx.apply(elementsUpdater(ctx.elements), ctx.groups)
}

export function updateSectionElementsAndGroups(
  template: Template,
  location: ElementLocation | undefined,
  elementsUpdater: (elements: Element[]) => Element[],
  groupsUpdater: (groups: ElementGroup[]) => ElementGroup[]
): Template {
  const ctx = getSectionContext(template, location)
  return ctx.apply(elementsUpdater(ctx.elements), groupsUpdater(ctx.groups))
}

export function applyGroupIdToElements(
  elements: Element[],
  targetElementIds: string[],
  groupId: string
): Element[] {
  return elements.map((el) => {
    let updated = el
    if (targetElementIds.includes(el.id)) {
      updated = { ...updated, groupId }
    }
    if (updated.elements && updated.elements.length > 0) {
      updated = {
        ...updated,
        elements: applyGroupIdToElements(updated.elements, targetElementIds, groupId),
      }
    }
    return updated
  })
}

export function removeGroupIdFromElements(
  elements: Element[],
  groupId: string,
  targetElementIds?: string[]
): Element[] {
  return elements.map((el) => {
    let updated = el
    if (
      el.groupId === groupId &&
      (!targetElementIds || targetElementIds.includes(el.id))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { groupId: _removed, ...rest } = el
      updated = rest as Element
    }
    if (updated.elements && updated.elements.length > 0) {
      updated = {
        ...updated,
        elements: removeGroupIdFromElements(
          updated.elements,
          groupId,
          targetElementIds
        ),
      }
    }
    return updated
  })
}
