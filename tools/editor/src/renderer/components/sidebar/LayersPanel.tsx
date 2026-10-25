import React, { useState } from 'react'
import {
  useTemplateStore,
  type Element,
  type ElementLocation,
} from '../../store/templateStore'
import { useUIStore } from '../../store/uiStore'
import { Icon } from '../atoms'
import { LayerElementRow } from './LayerElementRow'
import { AddSectionDropdown } from './AddSectionDropdown'
import { useTranslation } from '../../i18n'

interface LayersPanelProps {
  currentSection: ElementLocation
  openLayer: string
  onToggleLayer: (layerName: string) => void
}

export function LayersPanel({ currentSection, openLayer, onToggleLayer }: LayersPanelProps) {
  const { t } = useTranslation()
  const {
    template,
    selectedElementIds,
    selectElement,
    selectContainerChild,
    toggleElementSelection,
    toggleElementVisibility,
    deleteElement,
    deleteContainerChildElement,
    reorderElement,
    reorderContainerChildren,
    setCurrentSection,
  } = useTemplateStore()

  const [expandedContainers, setExpandedContainers] = useState<Record<string, boolean>>({})
  const [expandedLoops, setExpandedLoops] = useState<Record<string, boolean>>({})
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null)
  const [showAddBandDropdown, setShowAddBandDropdown] = useState(false)

  const currentGroups = (() => {
    if (currentSection === 'header') return template.pageSettings.header?.groups || []
    if (currentSection === 'footer') return template.pageSettings.footer?.groups || []
    if (currentSection === 'bodyBackground') return template.pageSettings.bodyBackground?.groups || []
    if (currentSection === 'summary') return template.summaryPage?.groups || []
    return template.groups || []
  })()

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation()
    setDraggedElementId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverElementId !== id) setDragOverElementId(id)
  }

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    e.stopPropagation()
    if (dragOverElementId === id) setDragOverElementId(null)
  }

  const handleDrop = (e: React.DragEvent, index: number, sectionKey: ElementLocation) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedElementId) {
      reorderElement(draggedElementId, index, sectionKey)
    }
    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  const handleDragEnd = () => {
    setDraggedElementId(null)
    setDragOverElementId(null)
  }

  const renderLoopItem = (
    el: Element,
    sectionKey: ElementLocation,
    index: number,
    totalCount: number,
    parentContainerId?: string
  ) => {
    const isLoopSelected = selectedElementIds.includes(el.id)
    const isLoopExpanded = expandedLoops[el.id] !== false
    const childElements = el.elements || []

    const handleMoveUp = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (index > 0) {
        if (parentContainerId) {
          reorderContainerChildren(parentContainerId, index, index - 1, sectionKey)
        } else {
          reorderElement(el.id, index - 1, sectionKey)
        }
      }
    }

    const handleMoveDown = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (index < totalCount - 1) {
        if (parentContainerId) {
          reorderContainerChildren(parentContainerId, index, index + 1, sectionKey)
        } else {
          reorderElement(el.id, index + 1, sectionKey)
        }
      }
    }

    return (
      <div
        key={el.id}
        className="space-y-0.5"
        draggable
        onDragStart={(e) => handleDragStart(e, el.id)}
        onDragOver={(e) => handleDragOver(e, el.id)}
        onDragLeave={(e) => handleDragLeave(e, el.id)}
        onDrop={(e) => handleDrop(e, index, sectionKey)}
        onDragEnd={handleDragEnd}
      >
        <div
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setCurrentSection(sectionKey)
            if (!selectedElementIds.includes(el.id)) {
              if (parentContainerId) {
                selectContainerChild(parentContainerId, el.id, sectionKey)
              } else {
                selectElement(el.id, sectionKey)
              }
            }
            useUIStore.getState().openContextMenu({
              x: e.clientX,
              y: e.clientY,
              targetType: 'element',
              elementId: el.id,
              containerId: parentContainerId,
              location: sectionKey,
            })
          }}
          onClick={(e) => {
            e.stopPropagation()
            setCurrentSection(sectionKey)
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
              toggleElementSelection(el.id, sectionKey)
            } else if (parentContainerId) {
              selectContainerChild(parentContainerId, el.id, sectionKey)
            } else {
              selectElement(el.id, sectionKey)
            }
          }}
          className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition group ${
            draggedElementId === el.id ? 'opacity-40 bg-slate-800' : ''
          } ${
            dragOverElementId === el.id ? 'border-t-2 border-purple-400 bg-purple-950/40' : ''
          } ${
            isLoopSelected
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
            <span className="text-[10px] text-slate-500 hover:text-slate-300 cursor-grab select-none">⠿</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpandedLoops((prev) => ({
                  ...prev,
                  [el.id]: !isLoopExpanded,
                }))
              }}
              className="text-[9px] text-slate-400 hover:text-white p-0.5"
            >
              {isLoopExpanded ? '▼' : '▶'}
            </button>
            <span className="text-[11px] text-purple-400">⟳</span>
            <span className="truncate font-medium">{el.name || (el.dataBinding ? `Loop (${el.dataBinding})` : 'Loop')}</span>
            <span className="text-[9px] text-slate-500">({childElements.length})</span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0">
            <button
              onClick={handleMoveUp}
              disabled={index === 0}
              className={`p-0.5 rounded ${index === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Mover para cima"
            >
              <span className="text-[9px]">▲</span>
            </button>
            <button
              onClick={handleMoveDown}
              disabled={index === totalCount - 1}
              className={`p-0.5 rounded ${index === totalCount - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
              title="Mover para baixo"
            >
              <span className="text-[9px]">▼</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleElementVisibility(el.id, sectionKey)
              }}
              className="hover:text-slate-200 p-0.5"
              title={el.hidden ? 'Mostrar' : 'Ocultar'}
            >
              <Icon name={el.hidden ? 'eye-off' : 'eye'} size="xs" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (parentContainerId) {
                  deleteContainerChildElement(parentContainerId, el.id, sectionKey)
                } else {
                  deleteElement(el.id, sectionKey)
                }
              }}
              className="hover:text-red-400 p-0.5"
              title="Excluir"
            >
              <Icon name="trash" size="xs" />
            </button>
          </div>
        </div>

        {isLoopExpanded && (
          <div className="pl-2 border-l border-purple-800/80 ml-1.5 space-y-0.5">
            {childElements.length === 0 ? (
              <div className="text-[10px] text-slate-500 py-0.5 italic">
                Loop vazio
              </div>
            ) : (
              childElements.map((child, cIdx) => (
                <LayerElementRow
                  key={child.id}
                  el={child}
                  sectionKey={sectionKey}
                  index={cIdx}
                  totalCount={childElements.length}
                  parentContainerId={parentContainerId}
                  parentLoopId={el.id}
                  currentGroups={currentGroups}
                  draggedElementId={draggedElementId}
                  dragOverElementId={dragOverElementId}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e, dropIdx) => {
                    e.preventDefault()
                    e.stopPropagation()
                    useTemplateStore.getState().reorderLoopChildren(el.id, cIdx, dropIdx, sectionKey)
                    setDraggedElementId(null)
                    setDragOverElementId(null)
                  }}
                  onDragEnd={handleDragEnd}
                />
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  const renderBandElements = (elements: Element[] | undefined, sectionKey: ElementLocation) => {
    if (!elements || elements.length === 0) {
      return (
        <div className="text-[10px] text-slate-500 py-0.5 pl-3 italic">
          Vazio
        </div>
      )
    }

    return (
      <div className="pl-2 pr-0.5 border-l border-slate-800 ml-1.5 space-y-0.5 py-0.5">
        {elements.map((el, index) => {
          if (el.type === 'container') {
            const isContainerSelected = selectedElementIds.includes(el.id)
            const isContainerExpanded = expandedContainers[el.id] !== false
            const childElements = el.elements || []

            const handleMoveUp = (e: React.MouseEvent) => {
              e.stopPropagation()
              if (index > 0) reorderElement(el.id, index - 1, sectionKey)
            }
            const handleMoveDown = (e: React.MouseEvent) => {
              e.stopPropagation()
              if (index < elements.length - 1) reorderElement(el.id, index + 1, sectionKey)
            }

            return (
              <div
                key={el.id}
                className="space-y-0.5"
                draggable
                onDragStart={(e) => handleDragStart(e, el.id)}
                onDragOver={(e) => handleDragOver(e, el.id)}
                onDragLeave={(e) => handleDragLeave(e, el.id)}
                onDrop={(e) => handleDrop(e, index, sectionKey)}
                onDragEnd={handleDragEnd}
              >
                <div
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentSection(sectionKey)
                    if (!selectedElementIds.includes(el.id)) {
                      selectElement(el.id, sectionKey)
                    }
                    useUIStore.getState().openContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      targetType: 'container',
                      elementId: el.id,
                      location: sectionKey,
                    })
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentSection(sectionKey)
                    if (e.ctrlKey || e.metaKey || e.shiftKey) {
                      toggleElementSelection(el.id, sectionKey)
                    } else {
                      selectElement(el.id, sectionKey)
                    }
                  }}
                  className={`flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer transition group ${
                    draggedElementId === el.id ? 'opacity-40 bg-slate-800' : ''
                  } ${
                    dragOverElementId === el.id ? 'border-t-2 border-indigo-400 bg-indigo-950/40' : ''
                  } ${
                    isContainerSelected
                      ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                    <span className="text-[10px] text-slate-500 hover:text-slate-300 cursor-grab select-none">⠿</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedContainers((prev) => ({
                          ...prev,
                          [el.id]: !isContainerExpanded,
                        }))
                      }}
                      className="text-[9px] text-slate-400 hover:text-white p-0.5"
                    >
                      {isContainerExpanded ? '▼' : '▶'}
                    </button>
                    <span className="text-[11px] text-indigo-400">⊞</span>
                    <span className="truncate font-medium">{el.name || el.id}</span>
                    <span className="text-[9px] text-slate-500">({childElements.length})</span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0">
                    <button
                      onClick={handleMoveUp}
                      disabled={index === 0}
                      className={`p-0.5 rounded ${
                        index === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Mover para cima"
                    >
                      <span className="text-[9px]">▲</span>
                    </button>
                    <button
                      onClick={handleMoveDown}
                      disabled={index === elements.length - 1}
                      className={`p-0.5 rounded ${
                        index === elements.length - 1
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Mover para baixo"
                    >
                      <span className="text-[9px]">▼</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleElementVisibility(el.id, sectionKey)
                      }}
                      className="hover:text-slate-200 p-0.5"
                      title={el.hidden ? 'Mostrar' : 'Ocultar'}
                    >
                      <Icon name={el.hidden ? 'eye-off' : 'eye'} size="xs" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteElement(el.id, sectionKey)
                      }}
                      className="hover:text-red-400 p-0.5"
                      title="Excluir"
                    >
                      <Icon name="trash" size="xs" />
                    </button>
                  </div>
                </div>

                {isContainerExpanded && (
                  <div className="pl-2 border-l border-slate-800/80 ml-1.5 space-y-0.5">
                    {childElements.length === 0 ? (
                      <div className="text-[10px] text-slate-500 py-0.5 italic">
                        Container vazio
                      </div>
                    ) : (
                      childElements.map((child, cIdx) => {
                        if (child.type === 'loop') {
                          return renderLoopItem(child, sectionKey, cIdx, childElements.length, el.id)
                        }
                        return (
                          <LayerElementRow
                            key={child.id}
                            el={child}
                            sectionKey={sectionKey}
                            index={cIdx}
                            totalCount={childElements.length}
                            parentContainerId={el.id}
                            currentGroups={currentGroups}
                            draggedElementId={draggedElementId}
                            dragOverElementId={dragOverElementId}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e, dropIdx) => {
                              e.preventDefault()
                              e.stopPropagation()
                              useTemplateStore.getState().reorderContainerChildren(el.id, cIdx, dropIdx, sectionKey)
                              setDraggedElementId(null)
                              setDragOverElementId(null)
                            }}
                            onDragEnd={handleDragEnd}
                          />
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          }

          if (el.type === 'loop') {
            return renderLoopItem(el, sectionKey, index, elements.length)
          }

          return (
            <LayerElementRow
              key={el.id}
              el={el}
              sectionKey={sectionKey}
              index={index}
              totalCount={elements.length}
              currentGroups={currentGroups}
              draggedElementId={draggedElementId}
              dragOverElementId={dragOverElementId}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e, dropIdx) => handleDrop(e, dropIdx, sectionKey)}
              onDragEnd={handleDragEnd}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-0.5 relative shrink-0 z-30">
        <span className="text-[11px] font-medium text-slate-300">{t.sidebar.layers}</span>

        <AddSectionDropdown
          show={showAddBandDropdown}
          onToggle={(e) => {
            e.stopPropagation()
            setShowAddBandDropdown(!showAddBandDropdown)
          }}
          onClose={() => setShowAddBandDropdown(false)}
          currentSection={currentSection}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 text-xs pr-0.5">
        {/* Background Layer (se adicionado) */}
        {template.pageSettings.bodyBackground && (
          <div>
            <div
              onClick={() => onToggleLayer('bodyBackground')}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                openLayer === 'bodyBackground'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
                  {openLayer === 'bodyBackground' ? '▼' : '▶'}
                </span>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="2 2" />
                </svg>
                <span className="truncate font-medium">Background Layer</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            {openLayer === 'bodyBackground' &&
              renderBandElements(template.pageSettings.bodyBackground.elements, 'bodyBackground')}
          </div>
        )}

        {/* 1. Header (apenas se existir) */}
        {template.pageSettings.header && (
          <div>
            <div
              onClick={() => onToggleLayer('header')}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                openLayer === 'header'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
                  {openLayer === 'header' ? '▼' : '▶'}
                </span>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="6" rx="1" />
                </svg>
                <span className="truncate font-medium">Header ({template.pageSettings.header.height}pt)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
                  <circle cx="12" cy="7" r="3" strokeWidth="2" />
                </svg>
                <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            {openLayer === 'header' &&
              renderBandElements(template.pageSettings.header.elements, 'header')}
          </div>
        )}

        {/* 2. Body Content (sempre presente) */}
        <div>
          <div
            onClick={() => onToggleLayer('body')}
            className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
              openLayer === 'body'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
                {openLayer === 'body' ? '▼' : '▶'}
              </span>
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              <span className="truncate font-medium">Body Content</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          {openLayer === 'body' && renderBandElements(template.page, 'body')}
        </div>

        {/* 3. Summary Band (apenas se existir) */}
        {template.summaryPage && (
          <div>
            <div
              onClick={() => onToggleLayer('summary')}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                openLayer === 'summary'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
                  {openLayer === 'summary' ? '▼' : '▶'}
                </span>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="truncate font-medium">Summary Band</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            {openLayer === 'summary' &&
              renderBandElements(template.summaryPage.elements, 'summary')}
          </div>
        )}

        {/* 4. Footer (apenas se existir) */}
        {template.pageSettings.footer && (
          <div>
            <div
              onClick={() => onToggleLayer('footer')}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${
                openLayer === 'footer'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
                  {openLayer === 'footer' ? '▼' : '▶'}
                </span>
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="15" width="18" height="6" rx="1" />
                </svg>
                <span className="truncate font-medium">Footer ({template.pageSettings.footer.height}pt)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
                  <circle cx="12" cy="7" r="3" strokeWidth="2" />
                </svg>
                <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            {openLayer === 'footer' &&
              renderBandElements(template.pageSettings.footer.elements, 'footer')}
          </div>
        )}
      </div>
    </div>
  )
}
