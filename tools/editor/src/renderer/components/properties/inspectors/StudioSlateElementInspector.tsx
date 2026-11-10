import { useState, useEffect } from 'react'
import { useTemplateStore, type ElementGroup, flattenElements } from '../../../store/templateStore'
import { Icon } from '../../atoms'
import { useTranslation } from '../../../i18n'
import type { ElementInspectorProps } from '../types'
import { TransformSection } from './sections/TransformSection'
import { TypographySection } from './sections/TypographySection'
import { MediaPropertiesSection } from './sections/MediaPropertiesSection'
import { ContainerPropertiesSection } from './sections/ContainerPropertiesSection'
import { ListPropertiesSection } from './sections/ListPropertiesSection'
import { AppearanceSection } from './sections/AppearanceSection'
import { DataBindingSection } from './sections/DataBindingSection'

export function StudioSlateElementInspector(props: ElementInspectorProps) {
  const { t } = useTranslation()
  const { element, onUpdate, onStyleUpdate, parentName, isMultiSelection, selectedCount } = props
  const [localId, setLocalId] = useState(element.id || '')

  useEffect(() => {
    setLocalId(element.id || '')
  }, [element.id])

  const handleIdCommit = () => {
    const trimmed = localId.trim()
    if (trimmed && trimmed !== element.id) {
      onUpdate('id', trimmed)
    } else {
      setLocalId(element.id || '')
    }
  }

  useEffect(() => {
    if (['static_text', 'rectangle', 'line', 'spacer'].includes(element.type) && element.dataBinding) {
      onUpdate('dataBinding', undefined)
    }
  }, [element.type, element.dataBinding])

  useEffect(() => {
    if (element.type === 'text' && element.value !== undefined) {
      onUpdate('value', undefined)
    }
  }, [element.type, element.value])

  const store = useTemplateStore()
  const {
    selectedElementIds,
    selectedElementLocation,
    currentSection,
    template,
    createGroup,
    ungroupElements,
    deleteSelectedElements,
    selectGroup,
  } = store

  // Verificar se o elemento selecionado pertence a um grupo
  const findElementGroup = (): ElementGroup | null => {
    if (!element.groupId) return null
    const allGroups = [
      ...(template.groups || []),
      ...(template.pageSettings.header?.groups || []),
      ...(template.pageSettings.footer?.groups || []),
      ...(template.pageSettings.bodyBackground?.groups || []),
      ...(template.summaryPage?.groups || []),
    ]
    return allGroups.find((g) => g.id === element.groupId) || null
  }

  const elementGroup = findElementGroup()

  // Buscar todos os elementos do contexto atual para saber se pertencem ao mesmo grupo
  const currentContextElements = (() => {
    if (currentSection === 'header' && template.pageSettings.header) {
      return template.pageSettings.header.elements
    } else if (currentSection === 'footer' && template.pageSettings.footer) {
      return template.pageSettings.footer.elements
    } else if (currentSection === 'bodyBackground' && template.pageSettings.bodyBackground) {
      return template.pageSettings.bodyBackground.elements
    } else if (currentSection === 'summary' && template.summaryPage) {
      return template.summaryPage.elements
    }
    return template.page || []
  })()

  const flatContext = flattenElements(currentContextElements)
  const selectedElementsList = flatContext.filter((el) => selectedElementIds.includes(el.id))
  const firstGroupId = selectedElementsList[0]?.groupId
  const allInSameGroup =
    selectedElementsList.length > 0 &&
    firstGroupId &&
    selectedElementsList.every((el) => el.groupId === firstGroupId)

  const canCreateGroup = isMultiSelection && !allInSameGroup

  const handleCreateGroup = () => {
    const name = `Grupo ${Date.now().toString().slice(-4)}`
    createGroup(name, selectedElementIds, currentSection)
  }

  const handleUngroup = () => {
    if (firstGroupId) {
      ungroupElements(firstGroupId, currentSection)
    }
  }

  return (
    <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* 1. Header */}
      <div className="p-3.5 border-b border-slate-800 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {isMultiSelection ? (
            <div className="relative min-w-0 flex-1">
              <span className="text-xs font-semibold text-indigo-400 tracking-wide block">
                Multi-seleção
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                {selectedCount} elementos selecionados
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            </div>
          ) : (
            <div className="relative min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-200 tracking-wide block">
                {t.properties.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate block" title={element.id}>
                #{element.id}
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            </div>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50 uppercase shrink-0">
            {isMultiSelection
              ? `${selectedCount} selecionados`
              : parentName
              ? `${parentName} / ${element.type}`
              : element.type}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Identificação / ID */}
        {!isMultiSelection ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300">ID do Elemento</span>
              <span className="text-[10px] text-slate-500 font-mono">identificador</span>
            </div>
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
              <span className="text-slate-500 font-mono text-xs mr-2 select-none">#</span>
              <input
                type="text"
                value={localId}
                onChange={(e) => setLocalId(e.target.value)}
                onBlur={handleIdCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleIdCommit()
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
                placeholder="id_do_elemento"
              />
            </div>
            {elementGroup && (
              <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-purple-950/40 border border-purple-800/40">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span className="text-[11px] text-purple-300 font-medium truncate">
                    Grupo: {elementGroup.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    selectGroup(
                      elementGroup.id,
                      (elementGroup.location || selectedElementLocation || 'body') as any
                    )
                  }
                  className="px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[10px] font-medium border border-purple-500/40 transition cursor-pointer"
                >
                  Propriedades do Grupo
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Gerenciamento de Grupo em Multi-seleção */}
        {isMultiSelection && (
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300">Agrupamento</span>
              <span className="text-[10px] text-slate-500 font-mono">{selectedCount} selecionados</span>
            </div>
            {allInSameGroup ? (
              <button
                type="button"
                onClick={handleUngroup}
                className="w-full py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Icon name="trash" size="xs" />
                <span>Desagrupar Elementos</span>
              </button>
            ) : canCreateGroup ? (
              <button
                type="button"
                onClick={handleCreateGroup}
                className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Icon name="folder" size="xs" />
                <span>Criar Grupo com Seleção</span>
              </button>
            ) : null}
          </div>
        )}

        {/* 2. Transform Section */}
        <TransformSection element={element} onUpdate={onUpdate} />

        {/* 3. Typography Section */}
        {(element.type === 'text' ||
          element.type === 'static_text' ||
          element.type === 'rich_text' ||
          element.type === 'link' ||
          element.type === 'list' ||
          element.type === 'check_list') && (
          <TypographySection
            element={element}
            onUpdate={onUpdate}
            onStyleUpdate={onStyleUpdate}
          />
        )}

        {/* 4. Media Properties (Image / Barcode) */}
        {(element.type === 'image' || element.type === 'barcode') && (
          <MediaPropertiesSection element={element} onUpdate={onUpdate} onStyleUpdate={onStyleUpdate} />
        )}

        {/* 5. Container & List specific */}
        {element.type === 'container' && (
          <ContainerPropertiesSection element={element} onUpdate={onUpdate} />
        )}

        {(element.type === 'list' || element.type === 'check_list') && (
          <ListPropertiesSection
            element={element}
            onUpdate={onUpdate}
            onStyleUpdate={onStyleUpdate}
          />
        )}

        {/* 6. Appearance Section (Não exibido para Page Break) */}
        {element.type !== 'page_break' && (
          <AppearanceSection element={element} onStyleUpdate={onStyleUpdate} />
        )}

        {/* 7. Data Binding & Print Condition Section */}
        {element.type !== 'page_break' && (
          <DataBindingSection element={element} onUpdate={onUpdate} />
        )}

        {/* 8. Delete Action Button */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              if (isMultiSelection) {
                deleteSelectedElements()
              } else {
                useTemplateStore
                  .getState()
                  .deleteElement(element.id, useTemplateStore.getState().selectedElementLocation)
              }
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Icon name="trash" size="xs" />
            <span>
              {isMultiSelection ? `Excluir ${selectedCount} elementos` : 'Excluir elemento'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
