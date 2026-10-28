import {
  useTemplateStore,
  type Element,
  type ElementGroup,
  flattenElements,
  findParentLoop,
} from '../store/templateStore'
import { GroupPropertiesPanel } from './properties/sections/GroupPropertiesPanel'
import { SummaryPropertiesPanel } from './properties/sections/SummaryPropertiesPanel'
import { HeaderPropertiesPanel } from './properties/sections/HeaderPropertiesPanel'
import { FooterPropertiesPanel } from './properties/sections/FooterPropertiesPanel'
import { BackgroundPropertiesPanel } from './properties/sections/BackgroundPropertiesPanel'
import { PageSettingsPanel } from './properties/sections/PageSettingsPanel'
import { StudioSlateElementInspector } from './properties/inspectors/StudioSlateElementInspector'
import { StudioSlateTableInspector } from './properties/tables/StudioSlateTableInspector'

export default function PropertiesPanel() {
  const store = useTemplateStore()
  const template = store.template
  const selectedElementIds = store.selectedElementIds
  const selectedElementLocation = store.selectedElementLocation
  const selectedGroupId = store.selectedGroupId
  const selectedLoopChildId = store.selectedLoopChildId
  const selectedLoopParentId = store.selectedLoopParentId
  const selectedContainerChildId = store.selectedContainerChildId
  const selectedContainerParentId = store.selectedContainerParentId
  const updateElement = store.updateElement
  const updateSelectedElements = store.updateSelectedElements
  const updateContainerChildElement = store.updateContainerChildElement
  const updateLoopChildElement = store.updateLoopChildElement

  // Se um grupo estiver selecionado, exibe diretamente as propriedades do grupo
  if (selectedGroupId) {
    const allGroups: ElementGroup[] = [
      ...(template.groups || []),
      ...(template.pageSettings.header?.groups || []),
      ...(template.pageSettings.footer?.groups || []),
      ...(template.pageSettings.bodyBackground?.groups || []),
      ...(template.summaryPage?.groups || []),
    ]
    const selectedGroup = allGroups.find((g) => g.id === selectedGroupId)
    if (selectedGroup) {
      const loc = (selectedGroup.location || selectedElementLocation || 'body') as any
      return <GroupPropertiesPanel group={selectedGroup} location={loc} />
    }
  }

  // Buscar elementos selecionados na location correta (PRIORIDADE sobre grupos)
  const selectedElements = (() => {
    if (selectedElementIds.length === 0) return []

    let elements: Element[] = []

    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      elements = template.pageSettings.header.elements
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      elements = template.pageSettings.footer.elements
    } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
      elements = template.pageSettings.bodyBackground.elements
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      elements = template.summaryPage.elements
    } else {
      elements = template.page || []
    }

    const flat = flattenElements(elements)
    return flat.filter((el) => selectedElementIds.includes(el.id))
  })()

  // Filho de Loop selecionado
  if (selectedElements.length <= 1 && selectedLoopChildId) {
    let loopElement: Element | null = findParentLoop(template, selectedLoopChildId)

    if (!loopElement && selectedLoopParentId) {
      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        loopElement =
          template.pageSettings.header.elements.find((el) => el.id === selectedLoopParentId) || null
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        loopElement =
          template.pageSettings.footer.elements.find((el) => el.id === selectedLoopParentId) || null
      } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
        loopElement =
          template.pageSettings.bodyBackground.elements.find((el) => el.id === selectedLoopParentId) ||
          null
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        loopElement =
          template.summaryPage.elements.find((el) => el.id === selectedLoopParentId) || null
      } else {
        loopElement = template.page?.find((el) => el.id === selectedLoopParentId) || null
      }
    }

    if (loopElement && loopElement.elements) {
      const childElement = loopElement.elements.find((c: Element) => c.id === selectedLoopChildId)
      if (childElement) {
        const loopId = loopElement.id
        const handleUpdate = (field: string | Record<string, any>, value?: any) => {
          const updates = typeof field === 'string' ? { [field]: value } : field
          updateLoopChildElement(
            loopId,
            selectedLoopChildId,
            updates,
            selectedElementLocation
          )
        }
        const handleStyleUpdate = (field: string | Record<string, any>, value?: any) => {
          const styleUpdates = typeof field === 'string' ? { [field]: value } : field
          updateLoopChildElement(
            loopId,
            selectedLoopChildId,
            { style: styleUpdates },
            selectedElementLocation
          )
        }

        if (childElement.type === 'table') {
          return (
            <StudioSlateTableInspector
              key={childElement.id}
              element={childElement}
              parentName="Loop"
              onUpdate={handleUpdate}
              onStyleUpdate={handleStyleUpdate}
            />
          )
        }

        return (
          <StudioSlateElementInspector
            key={childElement.id}
            element={childElement}
            parentName="Loop"
            onUpdate={handleUpdate}
            onStyleUpdate={handleStyleUpdate}
          />
        )
      }
    }
  }

  // Filho de Container selecionado
  if (selectedElements.length <= 1 && selectedContainerChildId && selectedContainerParentId) {
    let containerElement: Element | null = null

    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      containerElement =
        template.pageSettings.header.elements.find((el) => el.id === selectedContainerParentId) || null
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      containerElement =
        template.pageSettings.footer.elements.find((el) => el.id === selectedContainerParentId) || null
    } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
      containerElement =
        template.pageSettings.bodyBackground.elements.find(
          (el) => el.id === selectedContainerParentId
        ) || null
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      containerElement =
        template.summaryPage.elements.find((el) => el.id === selectedContainerParentId) || null
    } else {
      containerElement = template.page?.find((el) => el.id === selectedContainerParentId) || null
    }

    if (containerElement && containerElement.elements) {
      const childElement = containerElement.elements.find(
        (c: Element) => c.id === selectedContainerChildId
      )
      if (childElement) {
        const parentName = (containerElement.name as string) || 'Container'
        const handleUpdate = (field: string | Record<string, any>, value?: any) => {
          const updates = typeof field === 'string' ? { [field]: value } : field
          updateContainerChildElement(
            selectedContainerParentId,
            selectedContainerChildId,
            updates,
            selectedElementLocation
          )
        }
        const handleStyleUpdate = (field: string | Record<string, any>, value?: any) => {
          const styleUpdates = typeof field === 'string' ? { [field]: value } : field
          updateContainerChildElement(
            selectedContainerParentId,
            selectedContainerChildId,
            { style: styleUpdates },
            selectedElementLocation
          )
        }

        if (childElement.type === 'table') {
          return (
            <StudioSlateTableInspector
              key={childElement.id}
              element={childElement}
              parentName={parentName}
              onUpdate={handleUpdate}
              onStyleUpdate={handleStyleUpdate}
            />
          )
        }

        return (
          <StudioSlateElementInspector
            key={childElement.id}
            element={childElement}
            parentName={parentName}
            onUpdate={handleUpdate}
            onStyleUpdate={handleStyleUpdate}
          />
        )
      }
    }
  }

  // Painéis de Seção / Documento quando nada está selecionado
  if (selectedElements.length === 0) {
    if (store.currentSection === 'summary' && template.summaryPage) {
      return <SummaryPropertiesPanel />
    }

    if (store.currentSection === 'header' && template.pageSettings.header) {
      return <HeaderPropertiesPanel />
    }

    if (store.currentSection === 'footer' && template.pageSettings.footer) {
      return <FooterPropertiesPanel />
    }

    if (store.currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
      return <BackgroundPropertiesPanel />
    }

    return <PageSettingsPanel />
  }

  // Elemento selecionado
  const isMultiSelection = selectedElements.length > 1
  const selectedElement = selectedElements[0]

  if (selectedElement) {
    if (!isMultiSelection && selectedElement.type === 'table') {
      return (
        <StudioSlateTableInspector
          key={selectedElement.id}
          element={selectedElement}
          parentName={selectedElementLocation}
          onUpdate={(field, value) => {
            const updates = typeof field === 'string' ? { [field]: value } : field
            updateElement(selectedElement.id, updates, selectedElementLocation)
          }}
          onStyleUpdate={(field, value) => {
            const styleUpdates = typeof field === 'string' ? { [field]: value } : field
            const currentStyle = selectedElement.style || {}
            updateElement(
              selectedElement.id,
              { style: { ...currentStyle, ...styleUpdates } },
              selectedElementLocation
            )
          }}
        />
      )
    }

    return (
      <StudioSlateElementInspector
        key={isMultiSelection ? `multi-${selectedElements.map((e) => e.id).join('-')}` : selectedElement.id}
        element={selectedElement}
        isMultiSelection={isMultiSelection}
        selectedCount={selectedElements.length}
        parentName={selectedElementLocation}
        onUpdate={(field, value) => {
          const updates = typeof field === 'string' ? { [field]: value } : field
          if (isMultiSelection) {
            updateSelectedElements(updates)
          } else {
            updateElement(selectedElement.id, updates, selectedElementLocation)
          }
        }}
        onStyleUpdate={(field, value) => {
          const styleUpdates = typeof field === 'string' ? { [field]: value } : field
          if (isMultiSelection) {
            updateSelectedElements({ style: { ...selectedElement.style, ...styleUpdates } })
          } else {
            const currentStyle = selectedElement.style || {}
            updateElement(
              selectedElement.id,
              { style: { ...currentStyle, ...styleUpdates } },
              selectedElementLocation
            )
          }
        }}
      />
    )
  }

  return null
}
