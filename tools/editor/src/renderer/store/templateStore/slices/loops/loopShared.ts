import type { Element, ElementLocation, Template } from '../../types'

/**
 * Updates elements within a specific template section.
 */
export function updateSectionLoopElements(
  template: Template,
  location: ElementLocation,
  updater: (elements: Element[]) => Element[]
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

  return {
    ...template,
    page: updater(template.page),
  }
}

/**
 * Retrieves the elements list for a specific section in the template.
 */
export function getSectionLoopElements(
  template: Template,
  location: ElementLocation
): Element[] {
  if (location === 'header') return template.pageSettings.header?.elements || []
  if (location === 'footer') return template.pageSettings.footer?.elements || []
  if (location === 'bodyBackground') return template.pageSettings.bodyBackground?.elements || []
  if (location === 'summary') return template.summaryPage?.elements || []
  return template.page || []
}

/**
 * Check whether an element is a loop or container that can contain child elements.
 */
export function isLoopContainer(element: Element): boolean {
  return element.type === 'loop' || element.type === 'container'
}
