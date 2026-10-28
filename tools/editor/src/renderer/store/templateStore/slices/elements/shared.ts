import type { Element, ElementGroup, ElementLocation, Template } from '../../types'
import { restackBodyContainers } from '../../helpers'

/**
 * Calculates page dimensions and usable section height according to pageSettings.
 */
export function getSectionHeight(template: Template, location: ElementLocation): number {
  const size = template.pageSettings?.size
  const pageSize = size === 'Letter' ? { width: 612, height: 792 } : { width: 595, height: 842 }
  const margins = template.pageSettings?.margins || { top: 0, right: 0, bottom: 0, left: 0 }
  const headerHeight = template.pageSettings?.header?.height || 0
  const footerHeight = template.pageSettings?.footer?.height || 0

  let sectionHeight = pageSize.height - (margins.top || 0) - (margins.bottom || 0)
  if (location === 'header') return headerHeight
  if (location === 'footer') return footerHeight
  if (location === 'body') return sectionHeight - (headerHeight + footerHeight)
  return sectionHeight
}

/**
 * Retrieves the elements for a specific section location in the template.
 */
export function getSectionElements(template: Template, location: ElementLocation): Element[] {
  if (location === 'header') return template.pageSettings.header?.elements || []
  if (location === 'footer') return template.pageSettings.footer?.elements || []
  if (location === 'bodyBackground') return template.pageSettings.bodyBackground?.elements || []
  if (location === 'summary') return template.summaryPage?.elements || []
  return template.page || []
}

/**
 * Updates elements within a section and returns the new Template object.
 */
export function updateSectionElements(
  template: Template,
  location: ElementLocation,
  updater: (elements: Element[]) => Element[],
  shouldRestackBody: boolean = true
): Template {
  if (location === 'header' && template.pageSettings.header) {
    return {
      ...template,
      pageSettings: {
        ...template.pageSettings,
        header: {
          ...template.pageSettings.header,
          elements: updater(template.pageSettings.header.elements),
        },
      },
    }
  }

  if (location === 'footer' && template.pageSettings.footer) {
    return {
      ...template,
      pageSettings: {
        ...template.pageSettings,
        footer: {
          ...template.pageSettings.footer,
          elements: updater(template.pageSettings.footer.elements),
        },
      },
    }
  }

  if (location === 'bodyBackground' && template.pageSettings.bodyBackground) {
    return {
      ...template,
      pageSettings: {
        ...template.pageSettings,
        bodyBackground: {
          ...template.pageSettings.bodyBackground,
          elements: updater(template.pageSettings.bodyBackground.elements),
        },
      },
    }
  }

  if (location === 'summary' && template.summaryPage) {
    return {
      ...template,
      summaryPage: {
        ...template.summaryPage,
        elements: updater(template.summaryPage.elements),
      },
    }
  }

  // Default: body section
  const updatedPage = updater(template.page)
  return {
    ...template,
    page: shouldRestackBody ? restackBodyContainers(updatedPage, template) : updatedPage,
  }
}

/**
 * Updates element references inside groups when an element ID changes.
 */
export function updateGroupsForRenamedElement(
  groups: ElementGroup[] | undefined,
  oldId: string,
  newId: string
): ElementGroup[] | undefined {
  if (!groups || oldId === newId) return groups
  return groups.map((g) => ({
    ...g,
    elementIds: g.elementIds.map((eid) => (eid === oldId ? newId : eid)),
  }))
}

/**
 * Removes deleted element IDs from groups and filters out any now-empty groups.
 */
export function updateGroupsAfterElementDelete(
  groups: ElementGroup[] | undefined,
  deletedIds: string | string[]
): ElementGroup[] | undefined {
  if (!groups) return undefined
  const idSet = new Set(Array.isArray(deletedIds) ? deletedIds : [deletedIds])
  return groups
    .map((group) => ({
      ...group,
      elementIds: group.elementIds.filter((id) => !idSet.has(id)),
    }))
    .filter((group) => group.elementIds.length > 0)
}
