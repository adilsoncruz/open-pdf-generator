import { useState, useEffect, type DragEvent } from 'react'
import { useTemplateStore, type Element, type ElementGroup } from '../store/templateStore'
import { useUIStore } from '../store/uiStore'
import { useTranslation } from '../i18n'
import { Icon, Input, Select, Button, Divider, type IconName } from './atoms'
import { NumberField, IconButton, SidebarButton } from './molecules'

export default function Sidebar() {
  const { t } = useTranslation()
  const { 
    template,
    currentSection, 
    setCurrentSection,
    addHeader, 
    addFooter,
    removeHeader,
    removeFooter,
    addBodyBackground,
    removeBodyBackground,
    addSummaryPage,
    removeSummaryPage,
    isSidebarPinned,
    isSidebarMinimized,
    toggleSidebarPinned,
    toggleSidebarMinimized,
  } = useTemplateStore()

  const { sidebarTab, setSidebarTab } = useUIStore()

  const [pageSettingsExpanded, setPageSettingsExpanded] = useState(false)
  const [sectionsExpanded, setSectionsExpanded] = useState(true)
  const [isElementsCollapsed, setIsElementsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'elements' | 'layers'>('layers')
  const { 
    selectedElementIds, 
    selectedElementLocation,
    selectedGroupId,
    selectGroup,
    createGroup,
    ungroupElements,
    deleteSelectedElements,
    selectElement, 
    toggleElementSelection, 
    selectedContainerParentId, 
    addElement,
    deleteElement,
    reorderElement,
    toggleElementVisibility,
    selectContainerChild,
    deleteLoopChildElement,
    selectedContainerChildId
  } = useTemplateStore()

  // Somente uma layer aberta por vez (Accordion)
  const [openLayer, setOpenLayer] = useState<string>(currentSection)
  const [expandedContainers, setExpandedContainers] = useState<Record<string, boolean>>({})
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null)

  useEffect(() => {
    if (currentSection) {
      setOpenLayer(currentSection)
    }
  }, [currentSection])

  const toggleLayer = (layerName: string) => {
    setOpenLayer(prev => prev === layerName ? '' : layerName)
    setCurrentSection(layerName as ElementLocation)
  }

  const [showAddBandDropdown, setShowAddBandDropdown] = useState(false)

  const currentGroups = (() => {
    if (currentSection === 'header') return template.pageSettings.header?.groups || []
    if (currentSection === 'footer') return template.pageSettings.footer?.groups || []
    if (currentSection === 'bodyBackground') return template.pageSettings.bodyBackground?.groups || []
    if (currentSection === 'summary') return template.summaryPage?.groups || []
    return template.groups || []
  })()

  const activeGroup = currentGroups.find(
    g => g.id === selectedGroupId || selectedElementIds.some(id => g.elementIds.includes(id))
  )
  const canGroup = selectedElementIds.length >= 2 && !activeGroup
  const canUngroup = !!activeGroup

  const renderElementRow = (
    el: Element, 
    sectionKey: ElementLocation, 
    index: number, 
    totalCount: number, 
    parentContainerId?: string
  ) => {
    const isSelected = selectedElementIds.includes(el.id) || (parentContainerId && selectedContainerChildId === el.id)
    const isDraggingThis = draggedElementId === el.id
    const isDragOverThis = dragOverElementId === el.id
    const elGroup = currentGroups.find(g => g.elementIds.includes(el.id) || g.id === el.groupId)

    const handleMoveUp = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (index > 0) {
        reorderElement(el.id, index - 1, sectionKey)
      }
    }

    const handleMoveDown = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (index < totalCount - 1) {
        reorderElement(el.id, index + 1, sectionKey)
      }
    }

    const getIcon = () => {
      switch (el.type) {
        case 'text': return 'T'
        case 'static_text': return 'S'
        case 'rich_text': return '¶'
        case 'link': return <Icon name="link" size="xs" className="w-3 h-3 text-slate-400" />
        case 'image': return <Icon name="image" size="xs" className="w-3 h-3 text-slate-400" />
        case 'table': return '▦'
        case 'barcode': return '▥'
        case 'rectangle': return '▭'
        case 'line': return '―'
        case 'loop': return '⟳'
        case 'container': return '⊞'
        case 'spacer': return '↕'
        case 'page_break': return '✂'
        default: return '•'
      }
    }

    const getLabel = () => {
      if (el.type === 'text' || el.type === 'static_text' || el.type === 'rich_text' || el.type === 'link') {
        return (el.value as string) || el.id
      }
      if (el.type === 'line') {
        return `Linha (${el.width || 200}px)`
      }
      if (el.type === 'loop') {
        return `Loop (${(el as any).elements?.length || 0} itens)`
      }
      if (el.type === 'table') {
        return `Tabela (${(el as any).columns?.length || 0} col)`
      }
      if (el.type === 'barcode') {
        return `Barcode (${el.barcodeType || 'code128'})`
      }
      return el.name || el.id
    }

    return (
      <div
        key={el.id}
        draggable
        onDragStart={(e) => {
          e.stopPropagation()
          setDraggedElementId(el.id)
          e.dataTransfer.setData('text/plain', el.id)
          e.dataTransfer.effectAllowed = 'move'
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          e.dataTransfer.dropEffect = 'move'
          if (dragOverElementId !== el.id) {
            setDragOverElementId(el.id)
          }
        }}
        onDragLeave={(e) => {
          e.stopPropagation()
          if (dragOverElementId === el.id) {
            setDragOverElementId(null)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (draggedElementId && draggedElementId !== el.id) {
            reorderElement(draggedElementId, index, sectionKey)
          }
          setDraggedElementId(null)
          setDragOverElementId(null)
        }}
        onDragEnd={() => {
          setDraggedElementId(null)
          setDragOverElementId(null)
        }}
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
            targetType: el.type === 'container' ? 'container' : 'element',
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
        className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[11px] cursor-grab active:cursor-grabbing transition group ${
          isDraggingThis ? 'opacity-40 bg-slate-800' : ''
        } ${
          isDragOverThis ? 'border-t-2 border-indigo-400 bg-indigo-950/40' : ''
        } ${
          isSelected
            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
            : 'hover:bg-slate-800/60 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
          <span className="text-[10px] text-slate-500 hover:text-slate-300 cursor-grab select-none">⠿</span>
          <span className="text-[10px] font-mono text-slate-400 w-3.5 h-3.5 flex items-center justify-center shrink-0">{getIcon()}</span>
          <span className="truncate">{getLabel()}</span>
          {elGroup && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                selectGroup(elGroup.id, sectionKey)
              }}
              className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 hover:text-white font-mono shrink-0 select-none cursor-pointer transition"
              title={`Grupo: ${elGroup.name}\nClique para editar grupo`}
            >
              {elGroup.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
            className="text-slate-400 hover:text-slate-200 p-0.5"
            title={el.hidden ? 'Mostrar' : 'Ocultar'}
          >
            <Icon name={el.hidden ? 'eye-off' : 'eye'} size="xs" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (parentContainerId) {
                deleteLoopChildElement(parentContainerId, el.id, sectionKey)
              } else {
                deleteElement(el.id, sectionKey)
              }
            }}
            className="text-slate-400 hover:text-red-400 p-0.5"
            title="Excluir"
          >
            <Icon name="trash" size="xs" />
          </button>
        </div>
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
                onDragStart={(e) => {
                  e.stopPropagation()
                  setDraggedElementId(el.id)
                  e.dataTransfer.setData('text/plain', el.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'move'
                  if (dragOverElementId !== el.id) setDragOverElementId(el.id)
                }}
                onDragLeave={(e) => {
                  e.stopPropagation()
                  if (dragOverElementId === el.id) setDragOverElementId(null)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (draggedElementId && draggedElementId !== el.id) {
                    reorderElement(draggedElementId, index, sectionKey)
                  }
                  setDraggedElementId(null)
                  setDragOverElementId(null)
                }}
                onDragEnd={() => {
                  setDraggedElementId(null)
                  setDragOverElementId(null)
                }}
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
                      className={`p-0.5 rounded ${index === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      title="Mover para cima"
                    >
                      <span className="text-[9px]">▲</span>
                    </button>
                    <button
                      onClick={handleMoveDown}
                      disabled={index === elements.length - 1}
                      className={`p-0.5 rounded ${index === elements.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
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
                      childElements.map((child, cIdx) => 
                        renderElementRow(child, sectionKey, cIdx, childElements.length, el.id)
                      )
                    )}
                  </div>
                )}
              </div>
            )
          }

          return renderElementRow(el, sectionKey, index, elements.length)
        })}
      </div>
    )
  }
  const getSectionElements = () => {
    if (currentSection === 'header') return template.pageSettings.header?.elements || []
    if (currentSection === 'footer') return template.pageSettings.footer?.elements || []
    if (currentSection === 'bodyBackground') return template.pageSettings.bodyBackground?.elements || []
    if (currentSection === 'summary') return template.summaryPage?.elements || []
    return template.page || []
  }

  const selectedContainerId = ['body', 'header', 'footer', 'summary', 'bodyBackground'].includes(currentSection)
    ? selectedContainerParentId || (getSectionElements().find(el => el.id === selectedElementIds[0] && el.type === 'container')?.id || null)
    : null

  if (isSidebarMinimized) {
    return null
  }

function DocumentPropertiesContent() {
  const { template, updatePageSettings, updateMetadata } = useTemplateStore()
  const { margins, size, orientation } = template.pageSettings
  const { name, description, author } = template.metadata || { name: '', description: '', author: '' }

  const handleSizeChange = (newSize: string) => {
    updatePageSettings({ size: newSize })
  }

  const handleOrientationChange = (newOrientation: string) => {
    updatePageSettings({ orientation: newOrientation })
  }

  const handleMarginChange = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
    updatePageSettings({
      margins: {
        ...margins,
        [side]: Math.max(0, val)
      }
    })
  }

  return (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
      {/* 1. Metadados do Template */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="file-text" size="xs" className="text-indigo-400" />
          <span>Informações do Template</span>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Nome do Documento</label>
            <input
              type="text"
              value={name || ''}
              onChange={(e) => updateMetadata({ name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none transition"
              placeholder="Ex: Fatura Comercial"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Descrição</label>
            <textarea
              value={description || ''}
              onChange={(e) => updateMetadata({ description: e.target.value })}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none transition resize-none"
              placeholder="Descrição do template..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Autor</label>
              <input
                type="text"
                value={author || ''}
                onChange={(e) => updateMetadata({ author: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none transition"
                placeholder="Autor"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Versão</label>
              <input
                type="text"
                value={template.version || '1.0'}
                readOnly
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded px-2 py-1 text-xs text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 2. Formato e Orientação da Página */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="settings" size="xs" className="text-indigo-400" />
          <span>Configuração da Página</span>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Tamanho do Papel</label>
            <select
              value={size || 'A4'}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="A4">A4 (595 × 842 pt)</option>
              <option value="PORTRAIT">Letter (612 × 792 pt)</option>
              <option value="CUSTOM">Personalizado (Custom)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Orientação</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handleOrientationChange('portrait')}
                className={`py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  (orientation || 'portrait') === 'portrait'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Retrato</span>
              </button>
              <button
                type="button"
                onClick={() => handleOrientationChange('landscape')}
                className={`py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                  orientation === 'landscape'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Paisagem</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 3. Margens da Folha */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Icon name="layers" size="xs" className="text-indigo-400" />
          <span>Margens do Documento (pt)</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Top */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">Superior (Top)</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.top ?? 30}
                onChange={(e) => handleMarginChange('top', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>

          {/* Bottom */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">Inferior (Bottom)</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.bottom ?? 30}
                onChange={(e) => handleMarginChange('bottom', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>

          {/* Left */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">Esquerda (Left)</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.left ?? 30}
                onChange={(e) => handleMarginChange('left', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>

          {/* Right */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 focus-within:border-indigo-500 transition">
            <span className="text-[10px] text-slate-500 block mb-0.5">Direita (Right)</span>
            <div className="flex items-center">
              <input
                type="number"
                value={margins.right ?? 30}
                onChange={(e) => handleMarginChange('right', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">pt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 4. Resumo das Seções */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Seções do Documento
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">Header (Cabeçalho)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${template.pageSettings.header ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {template.pageSettings.header ? `${template.pageSettings.header.height}pt` : 'Desativado'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">Body Flow (Corpo)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {template.page?.length || 0} elemento(s)
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">Footer (Rodapé)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${template.pageSettings.footer ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {template.pageSettings.footer ? `${template.pageSettings.footer.height}pt` : 'Desativado'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">Background Layer</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${template.pageSettings.bodyBackground ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {template.pageSettings.bodyBackground ? 'Ativo' : 'Desativado'}
            </span>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg">
            <span className="text-slate-300 text-xs">Summary Page</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${template.summaryPage ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
              {template.summaryPage ? 'Ativo' : 'Desativado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryContent() {
  const { 
    history, 
    historyIndex, 
    jumpToHistoryIndex, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    template,
    loadTemplate
  } = useTemplateStore()

  const [snapshots, setSnapshots] = useState<Array<{ id: string; name: string; timestamp: string; template: any }>>(() => {
    try {
      const saved = localStorage.getItem('opg_template_snapshots')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [newSnapshotName, setNewSnapshotName] = useState('')

  const handleSaveSnapshot = () => {
    const name = newSnapshotName.trim() || `Versão ${snapshots.length + 1}`
    const newSnapshot = {
      id: `${Date.now()}`,
      name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      template: JSON.parse(JSON.stringify(template))
    }
    const updated = [newSnapshot, ...snapshots]
    setSnapshots(updated)
    try {
      localStorage.setItem('opg_template_snapshots', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
    setNewSnapshotName('')
  }

  const handleRestoreSnapshot = (snap: any) => {
    loadTemplate(snap.template)
  }

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id)
    setSnapshots(updated)
    try {
      localStorage.setItem('opg_template_snapshots', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
  }

  const getStepSummary = (tpl: any, index: number) => {
    if (index === 0) return 'Template inicial'
    const pageCount = tpl?.page?.length || 0
    const headerCount = tpl?.pageSettings?.header?.elements?.length || 0
    const footerCount = tpl?.pageSettings?.footer?.elements?.length || 0
    const total = pageCount + headerCount + footerCount
    return `Alteração (${total} elemento${total === 1 ? '' : 's'})`
  }

  return (
    <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
      {/* 1. Controles Undo / Redo */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="clock" size="xs" className="text-indigo-400" />
            <span>Desfazer / Refazer</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {history.length > 0 ? `${historyIndex + 1}/${history.length}` : '0/0'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo()}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition ${
              canUndo()
                ? 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Icon name="corner-up-left" size="xs" />
            <span>Desfazer</span>
          </button>

          <button
            type="button"
            onClick={redo}
            disabled={!canRedo()}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-medium transition ${
              canRedo()
                ? 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Refazer</span>
            <Icon name="corner-up-right" size="xs" />
          </button>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 2. Linha do Tempo de Edição */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Linha do Tempo</span>
          <span className="text-[10px] text-slate-500">{history.length} estados</span>
        </div>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic py-2 text-center">Nenhum histórico registrado</div>
          ) : (
            history.map((hTpl, idx) => {
              const isCurrent = idx === historyIndex
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => jumpToHistoryIndex(idx)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition group ${
                    isCurrent
                      ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 font-medium'
                      : 'bg-slate-950/50 border border-slate-800/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? 'bg-indigo-400 ring-2 ring-indigo-400/30' : 'bg-slate-600'}`} />
                    <span className="truncate">{getStepSummary(hTpl, idx)}</span>
                  </div>
                  <span className="text-[10px] font-mono shrink-0 text-slate-500 group-hover:text-slate-400">
                    #{idx + 1}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-2" />

      {/* 3. Snapshots / Versões Salvas */}
      <div>
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Versões Salvas</span>
          <span className="text-[10px] text-slate-500">{snapshots.length} salvas</span>
        </div>
        
        {/* Criar Snapshot */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <input
            type="text"
            value={newSnapshotName}
            onChange={(e) => setNewSnapshotName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSnapshot() }}
            placeholder="Nome da versão (ex: v1 final)"
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveSnapshot}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition shrink-0"
          >
            Salvar
          </button>
        </div>

        {/* Lista de Snapshots */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {snapshots.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic py-2 text-center">Nenhuma versão salva no navegador</div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="flex items-center justify-between px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg group"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <div className="text-xs text-slate-200 font-medium truncate">{snap.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{snap.timestamp}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRestoreSnapshot(snap)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded text-[11px] transition"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                    title="Excluir versão"
                  >
                    <Icon name="trash" size="xs" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 select-none shrink-0">
      {/* 1. Header do Painel */}
      <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-3 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-2">
          <Icon 
            name={sidebarTab === 'document' ? 'file-text' : sidebarTab === 'history' ? 'clock' : 'layers'} 
            size="sm" 
            className="text-indigo-400" 
          />
          <h2 className="text-xs font-semibold text-slate-200">
            {sidebarTab === 'document' 
              ? 'Propriedades do Documento' 
              : sidebarTab === 'history' 
              ? 'Histórico & Versões' 
              : isElementsCollapsed ? 'Camadas (Layers)' : 'Elements Library'}
          </h2>
        </div>

        {sidebarTab === 'elements' ? (
          <IconButton
            icon={isElementsCollapsed ? "chevron-down" : "chevron-up"}
            onClick={() => setIsElementsCollapsed(!isElementsCollapsed)}
            tooltip={isElementsCollapsed ? "Expandir Elementos" : "Recolher Elementos (mais espaço para Camadas)"}
            size="sm"
            className="text-slate-400 hover:text-white"
          />
        ) : (
          <IconButton
            icon="chevron-left"
            onClick={toggleSidebarMinimized}
            tooltip="Minimizar barra"
            size="sm"
            className="text-slate-400 hover:text-white"
          />
        )}
      </div>

      {sidebarTab === 'document' ? (
        <DocumentPropertiesContent />
      ) : sidebarTab === 'history' ? (
        <HistoryContent />
      ) : (
        /* Elements Library Content */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Elements Library Grid (Recolhível - sem barra de rolagem) */}
          {!isElementsCollapsed && (
            <div className="p-2.5 space-y-2.5 border-b border-slate-800/80 shrink-0">
          {/* Categoria 1: Standard */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
              Standard
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Text */}
              <button
                onClick={() => addElement({ type: 'text', id: `text-${Date.now()}`, value: 'Novo Texto', x: 40, y: 40, width: 200, height: 25, style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Texto Dinâmico / Expressão"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Text</span>
              </button>

              {/* Static Text */}
              <button
                onClick={() => addElement({ type: 'static_text', id: `static_text-${Date.now()}`, value: 'Texto Fixo', x: 40, y: 40, width: 200, height: 25, style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Texto Estático / Rótulo"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 6h16M4 10h16M4 14h12M4 18h8" strokeLinecap="round" />
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Static Text</span>
              </button>

              {/* Rich Text */}
              <button
                onClick={() => addElement({ type: 'rich_text', id: `rich_text-${Date.now()}`, value: '**Texto** em *Markdown*', x: 40, y: 40, width: 200, height: 30, style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Rich Text"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 6h16M4 12h10M4 18h14"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Rich Text</span>
              </button>

              {/* Hyperlink */}
              <button
                onClick={() => addElement({ type: 'link', id: `link-${Date.now()}`, value: 'Clique aqui', url: 'https://exemplo.com', x: 40, y: 40, width: 140, height: 25, style: { fontSize: 12, fontFamily: 'Helvetica', color: '#3b82f6' } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Hyperlink"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Hyperlink</span>
              </button>
            </div>
          </div>

          {/* Categoria 2: Layout */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
              Layout
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Container */}
              <button
                onClick={() => addElement({ type: 'container', id: `container-${Date.now()}`, name: 'Container', x: 0, width: '100%', height: 120, elements: [] }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Container"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" strokeDasharray="3 3"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Container</span>
              </button>

              {/* Loop */}
              <button
                onClick={() => addElement({ type: 'loop', id: `loop-${Date.now()}`, width: 400, height: 120, dataBinding: '', itemSpacing: 10, elements: [], style: { borderColor: '#8b5cf6', borderWidth: 1, borderStyle: 'dashed' } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Loop Repetidor de Dados"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Loop</span>
              </button>

              {/* Spacer */}
              <button
                onClick={() => addElement({ type: 'spacer', id: `spacer-${Date.now()}`, x: 0, width: '100%', height: 40 }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Spacer"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M7 3h10M7 21h10M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Spacer</span>
              </button>

              {/* Page Break */}
              <button
                onClick={() => addElement({ type: 'page_break', id: `page_break-${Date.now()}`, x: 0, width: '100%', height: 20 }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Page Break"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 12h16M14 3l4 4H14V3z"/>
                  <path d="M5 21h14a2 2 0 0 0 2-2V7l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Page Break</span>
              </button>
            </div>
          </div>

          {/* Categoria 3: Media & Shapes */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
              Media & Shapes
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* Image */}
              <button
                onClick={() => addElement({ type: 'image', id: `image-${Date.now()}`, width: 120, height: 80, source: '', fit: 'contain' }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Image"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Image</span>
              </button>

              {/* Table */}
              <button
                onClick={() => addElement({ type: 'table', id: `table-${Date.now()}`, width: 400, dataBinding: '', columns: [{ header: 'Coluna 1', field: 'item', width: 200 }], style: { headerBackground: '#f3f4f6', headerColor: '#000000', borderWidth: 1 } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Table"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Table</span>
              </button>

              {/* Shape / Rectangle */}
              <button
                onClick={() => addElement({ type: 'rectangle', id: `rect-${Date.now()}`, x: 40, y: 40, width: 100, height: 60, style: { fillColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 1 } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Shape (Retângulo)"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Shape</span>
              </button>

              {/* Line */}
              <button
                onClick={() => addElement({ type: 'line', id: `line-${Date.now()}`, x: 40, y: 40, width: 200, height: 0, style: { strokeColor: '#000000', strokeWidth: 1 } }, currentSection)}
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Linha Divisória"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Line</span>
              </button>

              {/* Barcodes / QR */}
              <button
                onClick={() =>
                  addElement(
                    {
                      type: 'barcode',
                      id: `barcode-${Date.now()}`,
                      x: 40,
                      y: 40,
                      width: 100,
                      height: 100,
                      barcodeType: 'qrcode',
                      value: 'https://openpdf.dev',
                      dataBinding: 'https://openpdf.dev',
                      style: { errorCorrection: 'M' },
                    },
                    currentSection
                  )
                }
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Barcodes / QR"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="4" height="4"/>
                  <path d="M18 18h3v3h-3z"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">QR Code</span>
              </button>

              {/* Barcode 1D */}
              <button
                onClick={() =>
                  addElement(
                    {
                      type: 'barcode',
                      id: `barcode-${Date.now()}`,
                      x: 40,
                      y: 40,
                      width: 140,
                      height: 50,
                      barcodeType: 'code128',
                      value: '123456789012',
                      dataBinding: '123456789012',
                      style: { errorCorrection: 'M' },
                    },
                    currentSection
                  )
                }
                className="h-14 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/60 transition flex flex-col items-center justify-center p-1 group"
                title="Código de Barras 1D"
              >
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 5v14M7 5v14M10 5v14M13 5v14M16 5v14M19 5v14"/>
                </svg>
                <span className="text-[9.5px] leading-tight text-slate-400 group-hover:text-slate-200">Barcode</span>
              </button>
            </div>
          </div>

            </div>
          )}

          {/* Seção Inferior: Layer Tree (ocupa todo o espaço quando elementos recolhidos) */}
          <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-2 px-0.5 relative shrink-0 z-30">
              <span className="text-[11px] font-medium text-slate-300">Layer</span>
              
              {/* Botão '+' com Dropdown Popover anexo a ele */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAddBandDropdown(!showAddBandDropdown)
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Adicionar Seção ou Container"
                >
                  <Icon name="plus" size="xs" />
                </button>

                {/* Popover anexo ao botão '+' */}
                {showAddBandDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAddBandDropdown(false)
                      }} 
                    />
                    <div className="absolute top-full right-0 mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 backdrop-blur-md">
                      <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 mb-1">
                        Adicionar Seção
                      </div>
                    
                    {!template.pageSettings.header && (
                      <button
                        onClick={() => {
                          addHeader()
                          setCurrentSection('header')
                          setShowAddBandDropdown(false)
                        }}
                        className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
                      >
                        <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:border-indigo-500/40">
                          <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-200 group-hover:text-white">Header Band</div>
                          <div className="text-[10px] text-slate-400">Faixa fixa superior</div>
                        </div>
                      </button>
                    )}

                    {!template.summaryPage && (
                      <button
                        onClick={() => {
                          addSummaryPage()
                          setCurrentSection('summary')
                          setShowAddBandDropdown(false)
                        }}
                        className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
                      >
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:border-emerald-500/40">
                          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-200 group-hover:text-white">Summary Band</div>
                          <div className="text-[10px] text-slate-400">Totais e assinaturas</div>
                        </div>
                      </button>
                    )}

                    {!template.pageSettings.footer && (
                      <button
                        onClick={() => {
                          addFooter()
                          setCurrentSection('footer')
                          setShowAddBandDropdown(false)
                        }}
                        className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
                      >
                        <div className="w-6 h-6 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:border-blue-500/40">
                          <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="15" width="18" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-200 group-hover:text-white">Footer Band</div>
                          <div className="text-[10px] text-slate-400">Faixa fixa no rodapé</div>
                        </div>
                      </button>
                    )}

                    {!template.pageSettings.bodyBackground && (
                      <button
                        onClick={() => {
                          addBodyBackground()
                          setCurrentSection('bodyBackground')
                          setShowAddBandDropdown(false)
                        }}
                        className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
                      >
                        <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:border-purple-500/40">
                          <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="2 2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-slate-200 group-hover:text-white">Background Layer</div>
                          <div className="text-[10px] text-slate-400">Marca d'água / Timbrado</div>
                        </div>
                      </button>
                    )}

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        const id = `container-${Date.now()}`
                        addElement({ type: 'container', id, name: 'Container', x: 0, width: '100%', height: 120, elements: [] }, currentSection)
                        setShowAddBandDropdown(false)
                      }}
                      className="w-full px-2.5 py-1.5 text-xs text-left flex items-center gap-2.5 hover:bg-slate-800 rounded-lg transition text-slate-300 group"
                    >
                      <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:border-cyan-500/40">
                        <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3"/>
                          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeWidth="1.2" strokeOpacity="0.5"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-white">Container (em {currentSection.toUpperCase()})</div>
                        <div className="text-[10px] text-slate-400">Agrupador dentro da camada</div>
                      </div>
                    </button>
                  </div>
                </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-xs pr-0.5">
              {/* Background Layer (se adicionado) */}
              {template.pageSettings.bodyBackground && (
                <div>
                  <div 
                    onClick={() => toggleLayer('bodyBackground')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${openLayer === 'bodyBackground' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/60 text-slate-300'}`}
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
                  {openLayer === 'bodyBackground' && renderBandElements(template.pageSettings.bodyBackground.elements, 'bodyBackground')}
                </div>
              )}

              {/* 1. Header (apenas se existir) */}
              {template.pageSettings.header && (
                <div>
                  <div 
                    onClick={() => toggleLayer('header')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${openLayer === 'header' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/60 text-slate-300'}`}
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
                        <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="3" strokeWidth="2"/>
                      </svg>
                      <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  {openLayer === 'header' && renderBandElements(template.pageSettings.header.elements, 'header')}
                </div>
              )}

              {/* 2. Body Content (sempre presente) */}
              <div>
                <div 
                  onClick={() => toggleLayer('body')}
                  className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${openLayer === 'body' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/60 text-slate-300'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
                      {openLayer === 'body' ? '▼' : '▶'}
                    </span>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="6" x2="20" y2="6"/>
                      <line x1="4" y1="12" x2="20" y2="12"/>
                      <line x1="4" y1="18" x2="20" y2="18"/>
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
                    onClick={() => toggleLayer('summary')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${openLayer === 'summary' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/60 text-slate-300'}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400 hover:text-white text-[10px] p-0.5 select-none">
                        {openLayer === 'summary' ? '▼' : '▶'}
                      </span>
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
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
                  {openLayer === 'summary' && renderBandElements(template.summaryPage.elements, 'summary')}
                </div>
              )}

              {/* 4. Footer (apenas se existir) */}
              {template.pageSettings.footer && (
                <div>
                  <div 
                    onClick={() => toggleLayer('footer')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition ${openLayer === 'footer' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/60 text-slate-300'}`}
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
                        <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2"/>
                        <circle cx="12" cy="7" r="3" strokeWidth="2"/>
                      </svg>
                      <svg className="w-3.5 h-3.5 hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  {openLayer === 'footer' && renderBandElements(template.pageSettings.footer.elements, 'footer')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ContainersPanel({
  selectedContainerId,
  onSelectContainer,
}: {
  selectedContainerId: string | null
  onSelectContainer: (id: string | null) => void
}) {
  const [containersExpanded, setContainersExpanded] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newContainerName, setNewContainerName] = useState('')
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const { template, addElement, currentSection, selectElement, moveElementUp, moveElementDown, deleteElement, updateElement } = useTemplateStore()

  if (!['body', 'header', 'footer', 'summary', 'bodyBackground'].includes(currentSection)) return null

  const getSectionElements = () => {
    if (currentSection === 'header') return template.pageSettings.header?.elements || []
    if (currentSection === 'footer') return template.pageSettings.footer?.elements || []
    if (currentSection === 'bodyBackground') return template.pageSettings.bodyBackground?.elements || []
    if (currentSection === 'summary') return template.summaryPage?.elements || []
    return template.page || []
  }

  const containers = getSectionElements().filter((el) => el.type === 'container')
  
  const handleAddContainerSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const name = newContainerName.trim() || `Container ${containers.length + 1}`

    const id = `container-${Date.now()}`
    const lastContainer = containers[containers.length - 1]
    const lastY = typeof lastContainer?.y === 'number' ? lastContainer.y : 0
    const lastHeight = typeof lastContainer?.height === 'number' ? lastContainer.height : 150
    const nextY = containers.length > 0 ? lastY + lastHeight : 0
    addElement({ type: 'container', id, name, x: 0, y: nextY, width: '100%', height: 150, elements: [] }, currentSection)
    selectElement(id, currentSection)
    
    setIsAdding(false)
    setNewContainerName('')
  }

  const handleRenameContainerSubmit = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const newName = editingName.trim()
    if (newName) {
      updateElement(id, { name: newName }, currentSection)
    }
    setEditingContainerId(null)
  }

  const renderContainerItem = (container: Element) => (
    <div
      key={container.id}
      className={`h-12 px-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
        selectedContainerId === container.id
          ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-300 dark:border-primary-500/50'
          : 'theme-surface border theme-border hover:theme-surface-hover'
      }`}
    >
      {editingContainerId === container.id ? (
        <form onSubmit={(e) => handleRenameContainerSubmit(container.id, e)} className="flex-1 mr-2">
          <input
            type="text"
            autoFocus
            className="w-full px-2 py-1 text-sm theme-surface border theme-border rounded"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={() => handleRenameContainerSubmit(container.id)}
          />
        </form>
      ) : (
        <button 
          onClick={() => onSelectContainer(container.id)} 
          onDoubleClick={() => {
            setEditingContainerId(container.id)
            setEditingName((container.name as string) || container.id)
          }} 
          className="flex-1 text-left flex items-center gap-2 min-w-0" 
          title="Duplo clique para renomear"
        >
          <span className="text-sm theme-text-muted">☰</span>
          <span className="text-sm font-medium truncate">{(container.name as string) || container.id}</span>
        </button>
      )}
      <div className="flex gap-1 ml-2">
        <button className="w-7 h-7 rounded border theme-border theme-surface text-sm" onClick={() => moveElementUp(container.id, currentSection)}>↑</button>
        <button className="w-7 h-7 rounded border theme-border theme-surface text-sm" onClick={() => moveElementDown(container.id, currentSection)}>↓</button>
        <button
          className="w-7 h-7 rounded border theme-border theme-surface text-red-500 text-sm"
          onClick={() => {
            deleteElement(container.id, currentSection)
            onSelectContainer(null)
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )

  return (
    <div className="mb-3">
      <div 
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setContainersExpanded(!containersExpanded)}
      >
        <h3 className="text-xs font-semibold theme-text-muted uppercase mb-0">Containers</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsAdding(true)
            }}
            className="group flex items-center bg-primary-600 hover:bg-primary-700 text-white rounded px-2 py-0.5 text-xs font-bold transition-all"
            title="Add Container"
          >
            <span>+</span>
            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[100px] group-hover:ml-1 font-normal">
              Add Container
            </span>
          </button>
          <button
            className="theme-text-muted hover:theme-surface rounded p-0.5 ml-1"
            title={containersExpanded ? "Colapsar Containers" : "Expandir Containers"}
          >
            {containersExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>
      
      {isAdding && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="theme-surface border theme-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold theme-text mb-4">Novo Container</h3>
            <form onSubmit={handleAddContainerSubmit}>
              <input
                type="text"
                autoFocus
                className="w-full px-3 py-2 text-sm theme-surface border theme-border rounded-lg mb-4"
                placeholder={`Container ${containers.length + 1}`}
                value={newContainerName}
                onChange={(e) => setNewContainerName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setNewContainerName('')
                  }}
                  className="px-4 py-2 rounded-lg theme-surface border theme-border hover:theme-surface-hover transition theme-text"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                >
                  Criar Container
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {containersExpanded
          ? containers.map(container => renderContainerItem(container))
          : (selectedContainerId && containers.find(c => c.id === selectedContainerId)
              ? renderContainerItem(containers.find(c => c.id === selectedContainerId)!)
              : null)
        }
      </div>
    </div>
  )
}


function GroupButton({ selectedContainerId }: { selectedContainerId: string | null }) {
  const { t } = useTranslation()
  const { 
    selectedElementIds, 
    selectedElementLocation,
    currentSection,
    createGroup,
    clearSelection
  } = useTemplateStore()

  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [groupNameInput, setGroupNameInput] = useState('')

  const getGroups = (): ElementGroup[] => {
    const { template } = useTemplateStore.getState()
    if (currentSection === 'header') {
      return template.pageSettings.header?.groups || []
    } else if (currentSection === 'footer') {
      return template.pageSettings.footer?.groups || []
    } else if (currentSection === 'bodyBackground') {
      return template.pageSettings.bodyBackground?.groups || []
    } else if (currentSection === 'summary') {
      const backgroundGroups = template.pageSettings.bodyBackground?.groups || []
      const summaryGroups = template.summaryPage?.groups || []
      return [...backgroundGroups, ...summaryGroups]
    } else {
      return template.groups || []
    }
  }

  const groups = getGroups()

  
  const hasElementInGroup = selectedElementIds.some(elementId => 
    groups.some(group => group.elementIds.includes(elementId))
  )

  const canCreateGroup = selectedElementIds.length >= 2 && !hasElementInGroup && (currentSection !== 'body' || !!selectedContainerId)

  const getGroupButtonTitle = (): string => {
    if (selectedElementIds.length < 2) {
      return t.sidebar.selectAtLeast2Elements
    }
    if (hasElementInGroup) {
      return t.sidebar.elementsAlreadyInGroup
    }
    return t.sidebar.createGroup
  }

  const handleCreateGroup = (): void => {
    if (!groupNameInput.trim()) {
      alert(t.sidebar.groupName)
      return
    }
    
    createGroup(groupNameInput.trim(), selectedElementIds, selectedElementLocation)
    setShowGroupDialog(false)
    setGroupNameInput('')
    
    
    clearSelection()
  }

  const handleCancelGroup = (): void => {
    setShowGroupDialog(false)
    setGroupNameInput('')
  }

  return (
    <>
      {/* Group Button */}
      <button
        onClick={() => setShowGroupDialog(true)}
        disabled={!canCreateGroup}
        className="w-full px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        title={getGroupButtonTitle()}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        {t.sidebar.group} {selectedElementIds.length > 1 && `(${selectedElementIds.length})`}
      </button>

      {/* Dialog to create group */}
      {showGroupDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="theme-surface border theme-border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold theme-text mb-4">{t.sidebar.createGroup}</h3>
            <Input
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateGroup()
                } else if (e.key === 'Escape') {
                  handleCancelGroup()
                }
              }}
              placeholder={t.sidebar.groupName}
              className="mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={handleCancelGroup}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateGroup}
              >
                {t.common.create}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ElementsList({ selectedContainerId }: { selectedContainerId: string | null }) {
  const { t } = useTranslation()
  const { 
    template, 
    selectedElementIds, 
    selectedElementLocation,
    selectedGroupId,
    currentSection,
    selectElement,
    toggleElementSelection, 
    deleteElement,
    deleteLoopChildElement,
    reorderElement,
    toggleElementVisibility,
    toggleGroupCollapse,
    toggleGroupVisibility,
    selectGroup,
    reorderGroup,
    selectedContainerChildId,
    selectContainerChild
  } = useTemplateStore()
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null)
  const [dragOverGroupIndex, setDragOverGroupIndex] = useState<number | null>(null)

  const getElements = (): Element[] => {
    if (currentSection === 'header') {
      return template.pageSettings.header?.elements || []
    } else if (currentSection === 'footer') {
      return template.pageSettings.footer?.elements || []
    } else if (currentSection === 'bodyBackground') {
      return template.pageSettings.bodyBackground?.elements || []
    } else if (currentSection === 'summary') {
      const backgroundElements = template.pageSettings.bodyBackground?.elements || []
      const summaryElements = template.summaryPage?.elements || []
      return [...backgroundElements, ...summaryElements]
    } else {
      if (selectedContainerId) {
        const containers = template.page || []
        const selected = containers.find((el) => el.id === selectedContainerId && el.type === 'container')
        return (selected?.elements as Element[]) || []
      }
      return template.page || []
    }
  }

  const getGroups = (): ElementGroup[] => {
    if (currentSection === 'header') {
      return template.pageSettings.header?.groups || []
    } else if (currentSection === 'footer') {
      return template.pageSettings.footer?.groups || []
    } else if (currentSection === 'bodyBackground') {
      return template.pageSettings.bodyBackground?.groups || []
    } else if (currentSection === 'summary') {
      const backgroundGroups = template.pageSettings.bodyBackground?.groups || []
      const summaryGroups = template.summaryPage?.groups || []
      return [...backgroundGroups, ...summaryGroups]
    } else {
      return template.groups || []
    }
  }

  const elements = getElements()
  const groups = getGroups()
  const elementsNotInGroups = elements.filter(el => !el.groupId)
  
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number): void => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }
  
  const handleDragLeave = (): void => {
    setDragOverIndex(null)
  }
  
  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number): void => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const element = elements[draggedIndex]
      reorderElement(element.id, dropIndex, currentSection)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }
  
  const handleDragEnd = (): void => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }
  
  // Group drag handlers
  const handleGroupDragStart = (e: DragEvent<HTMLDivElement>, index: number): void => {
    setDraggedGroupIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }
  
  const handleGroupDragOver = (e: DragEvent<HTMLDivElement>, index: number): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedGroupIndex !== null && draggedGroupIndex !== index) {
      setDragOverGroupIndex(index)
    }
  }
  
  const handleGroupDragLeave = (): void => {
    setDragOverGroupIndex(null)
  }
  
  const handleGroupDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number): void => {
    e.preventDefault()
    
    if (draggedGroupIndex !== null && draggedGroupIndex !== dropIndex) {
      const group = groups[draggedGroupIndex]
      reorderGroup(group.id, dropIndex, currentSection)
    }
    
    setDraggedGroupIndex(null)
    setDragOverGroupIndex(null)
  }
  
  const handleGroupDragEnd = (): void => {
    setDraggedGroupIndex(null)
    setDragOverGroupIndex(null)
  }

  return (
    <div className="space-y-1">
      {/* Grupos */}
      {groups.map((group, groupIndex) => (
        <div key={group.id} className="mb-2">
          
          <div 
            draggable
            onDragStart={(e) => handleGroupDragStart(e, groupIndex)}
            onDragOver={(e) => handleGroupDragOver(e, groupIndex)}
            onDragLeave={handleGroupDragLeave}
            onDrop={(e) => handleGroupDrop(e, groupIndex)}
            onDragEnd={handleGroupDragEnd}
            className={`px-3 py-2 rounded-lg cursor-move border-2 transition-all ${
              draggedGroupIndex === groupIndex
                ? 'opacity-50 bg-primary-100 dark:bg-primary-500/20 border-primary-400'
                : dragOverGroupIndex === groupIndex
                ? 'border-primary-500 border-dashed bg-primary-50 dark:bg-primary-500/10'
                : selectedGroupId === group.id && selectedElementLocation === currentSection
                ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200 font-medium shadow-sm'
                : 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500/30 hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:border-primary-400 dark:hover:border-primary-500/50 theme-text'
            }`}
            onClick={() => selectGroup(group.id, currentSection)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleGroupCollapse(group.id, currentSection)
                  }}
                  className="mr-2 text-primary-400 hover:bg-primary-500/30 rounded p-0.5"
                  title={group.collapsed ? t.sidebar.expandGroup : t.sidebar.collapseGroup}
                >
                  {group.collapsed ? '▶' : '▼'}
                </button>
                <svg 
                  className="w-3.5 h-3.5 mr-2 text-primary-400 flex-shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span className="text-xs font-bold text-primary-300 truncate">
                  {group.name}
                </span>
                <span className="text-xs text-primary-400 ml-2">({group.elementIds.length})</span>
              </div>
              <div className="flex items-center gap-1">
                {group.printCondition && (
                  <span className="text-xs text-primary-400" title={`Condition: ${group.printCondition}`}>
                    🔍
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleGroupVisibility(group.id, currentSection)
                  }}
                  className="text-primary-400 hover:text-primary-300"
                  title={(() => {
                    const groupElements = elements.filter(el => group.elementIds.includes(el.id))
                    const allHidden = groupElements.every(el => el.hidden)
                    return allHidden ? t.sidebar.showGroup : t.sidebar.hideGroup
                  })()}
                >
                  {(() => {
                    const groupElements = elements.filter(el => group.elementIds.includes(el.id))
                    const allHidden = groupElements.every(el => el.hidden)
                    return allHidden ? <Icon name="eye-off" size="sm" /> : <Icon name="eye" size="sm" />
                  })()}
                </button>
              </div>
            </div>
          </div>
          
          {/* Elementos do Grupo */}
          {!group.collapsed && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary-500/30 pl-2">
              {group.elementIds.map((elementId) => {
                const element = elements.find(el => el.id === elementId)
                if (!element) return null
                
                return (
                  <div
                    key={element.id}
                    className={`px-2 py-1.5 rounded-lg cursor-pointer border transition-all text-xs ${
                      (selectedContainerId && selectedContainerChildId === element.id) ||
                      (selectedElementIds.includes(element.id) && selectedElementLocation === currentSection && !selectedContainerId)
                        ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200 font-medium'
                        : 'theme-surface border-primary-500/20 hover:bg-primary-500/10 theme-text-secondary'
                    }`}
                    onClick={(e) => {
                      if (selectedContainerId) {
                        selectContainerChild(selectedContainerId, element.id, currentSection)
                      } else if (e.ctrlKey || e.metaKey) {
                        toggleElementSelection(element.id, currentSection)
                      } else {
                        selectElement(element.id, currentSection)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{element.id}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleElementVisibility(element.id, currentSection)
                        }}
                        className="text-primary-400 hover:text-primary-300"
                        title={element.hidden ? t.sidebar.showElement : t.sidebar.hideElement}
                      >
                        {element.hidden ? <Icon name="eye-off" size="sm" /> : <Icon name="eye" size="sm" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
      
      
      {elementsNotInGroups.map((element, index) => (
        (element.type === 'loop' || element.type === 'container') ? (
          <LoopElementItem 
            key={element.id} 
            element={element} 
            index={index}
            currentSection={currentSection}
          />
        ) : (
          <div
            key={element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`px-3 py-2 rounded-lg cursor-move border transition-all ${
              draggedIndex === index 
                ? 'opacity-50 bg-primary-500/20 border-primary-400' 
                : dragOverIndex === index
                ? 'border-primary-500 border-dashed bg-primary-500/10'
                : selectedContainerId && selectedContainerChildId === element.id
                ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200 font-medium shadow-sm'
                : selectedElementIds.includes(element.id) && selectedElementLocation === currentSection && !selectedContainerId
                ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200 font-medium shadow-sm'
                : 'theme-surface border theme-border hover:bg-primary-500/10 hover:border-primary-500/30 theme-text-secondary'
            }`}
            onClick={(e) => {
              if (selectedContainerId) {
                selectContainerChild(selectedContainerId, element.id, currentSection)
              } else if (e.ctrlKey || e.metaKey) {
                toggleElementSelection(element.id, currentSection)
              } else {
                selectElement(element.id, currentSection)
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 mr-2 min-w-0">
                <svg 
                  className="w-3 h-3 mr-2 theme-text-muted flex-shrink-0" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                <span className="text-xs font-medium truncate">
                  {element.id}
                </span>
              </div>
              <div className="flex items-center space-x-0.5">
                {/* Show/Hide */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleElementVisibility(element.id, currentSection)
                  }}
                  className={`w-6 h-6 flex items-center justify-center hover:bg-primary-500/20 rounded transition ${
                    element.hidden ? 'theme-text-muted' : 'theme-text-secondary'
                  }`}
                  title={element.hidden ? t.sidebar.showElement : t.sidebar.hideElement}
                >
                  {element.hidden ? <Icon name="eye-off" size="sm" /> : <Icon name="eye" size="sm" />}
                </button>
                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(t.sidebar.deleteElementConfirm)) {
                      if (selectedContainerId) {
                        deleteLoopChildElement(selectedContainerId, element.id, currentSection)
                      } else {
                        deleteElement(element.id, currentSection)
                      }
                    }
                  }}
                  className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-400 hover:bg-red-500/20 rounded transition"
                  title={t.sidebar.deleteElement}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )
      ))}

      {elements.length === 0 && groups.length === 0 && (
        <div className="text-center py-8 px-4">
          <p className="text-xs theme-text-muted">{t.sidebar.noElements}</p>
          <p className="text-xs theme-text-muted mt-1">{t.sidebar.useSidebar}</p>
        </div>
      )}
    </div>
  )
}

// Componente para renderizar um elemento Loop com seus filhos
interface LoopElementItemProps {
  element: Element
  index: number
  currentSection: 'body' | 'header' | 'footer' | 'bodyBackground' | 'summary'
}

function LoopElementItem({ element, index: _index, currentSection }: LoopElementItemProps) {
  const { t } = useTranslation()
  const {
    selectedElementIds,
    selectedElementLocation,
    selectedLoopChildId,
    selectedLoopParentId,
    expandedLoopIds,
    selectElement,
    selectLoopChild,
    toggleLoopExpanded,
    toggleElementVisibility,
    deleteElement,
    deleteLoopChildElement,
    addElementToLoop,
    reorderLoopChildren,
  } = useTemplateStore()
  
  const [draggedChildIndex, setDraggedChildIndex] = useState<number | null>(null)
  const [dragOverChildIndex, setDragOverChildIndex] = useState<number | null>(null)
  
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingNameValue, setEditingNameValue] = useState('')

  const handleRenameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (editingNameValue.trim()) {
      useTemplateStore.getState().updateElement(element.id, { name: editingNameValue.trim() }, currentSection)
    }
    setIsEditingName(false)
  }
  
  const isExpanded = expandedLoopIds.includes(element.id)
  const isSelected = selectedElementIds.includes(element.id) && selectedElementLocation === currentSection
  const loopChildren = element.elements || []
  
  const getChildIcon = (type: string) => {
    const iconMap: Record<string, IconName> = {
      text: 'text',
      static_text: 'static-text',
      image: 'image',
      rectangle: 'rectangle',
      line: 'minus',
    }
    return <Icon name={iconMap[type] || 'rectangle'} size="xs" />
  }
  
  const handleAddChildElement = (type: string) => {
    const id = `${type}-${Date.now()}`
    let newElement: Partial<Element> = { type, id, x: 0, y: 0 }
    
    if (type === 'text' || type === 'static_text') {
      newElement = {
        ...newElement,
        value: type === 'text' ? 'campo' : 'Texto',
        width: 150,
        height: 20,
        style: { fontSize: 10, fontFamily: 'Helvetica', color: '#000000' },
      }
    } else if (type === 'image') {
      newElement = { ...newElement, width: 50, height: 50, source: '' }
    } else if (type === 'rectangle') {
      newElement = { ...newElement, width: 100, height: 20, style: { fillColor: '#e0e0e0' } }
    } else if (type === 'line') {
      newElement = { ...newElement, width: 100, height: 0, style: { strokeColor: '#000000', strokeWidth: 1 } }
    }
    
    addElementToLoop(element.id, newElement, currentSection)
  }
  
  return (
    <div className="mb-2">
      {/* Header do Loop */}
      <div 
        className={`px-3 py-2 rounded-lg cursor-pointer border-2 transition-all ${
          isSelected
            ? 'bg-purple-100 dark:bg-purple-500/30 border-purple-500 shadow-sm'
            : 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/50'
        }`}
        onClick={() => selectElement(element.id, currentSection)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLoopExpanded(element.id)
              }}
              className="mr-2 text-purple-400 hover:bg-purple-500/30 rounded p-0.5"
              title={isExpanded ? t.sidebar.collapse : t.sidebar.expand}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
            <Icon
              name={element.type === 'container' ? 'container' : 'loop'}
              size="xs"
              className="mr-2 text-purple-400 flex-shrink-0"
            />
            {isEditingName ? (
              <form onSubmit={handleRenameSubmit} className="flex-1 mr-2 min-w-0" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  className="w-full px-1 py-0.5 text-xs text-black border rounded"
                  value={editingNameValue}
                  onChange={(e) => setEditingNameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit()}
                />
              </form>
            ) : (
              <span 
                className="text-xs font-bold text-purple-300 truncate"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (element.type === 'container') {
                    setEditingNameValue((element.name as string) || element.id)
                    setIsEditingName(true)
                  }
                }}
                title={element.type === 'container' ? "Duplo clique para renomear" : undefined}
              >
                {(element.name as string) || element.id}
              </span>
            )}
            <span className="text-xs text-purple-400 ml-2">({loopChildren.length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleElementVisibility(element.id, currentSection)
              }}
              className="text-purple-400 hover:text-purple-300"
                title={element.hidden ? t.sidebar.showElement : t.sidebar.hideElement}
            >
              {element.hidden ? <Icon name="eye-off" size="sm" /> : <Icon name="eye" size="sm" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(t.sidebar.deleteLoopConfirm)) {
                  deleteElement(element.id, currentSection)
                }
              }}
              className="text-red-400 hover:text-red-300"
              title={t.sidebar.deleteElement}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Elementos Filhos do Loop (expandidos) */}
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-purple-500/30 pl-2">
          {loopChildren.map((child: Element, childIndex: number) => {
            const isChildSelected = selectedLoopChildId === child.id && selectedLoopParentId === element.id
            
            return (
              <div
                key={child.id}
                draggable
                onDragStart={(e) => {
                  e.stopPropagation()
                  setDraggedChildIndex(childIndex)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (draggedChildIndex !== null && draggedChildIndex !== childIndex) {
                    setDragOverChildIndex(childIndex)
                  }
                }}
                onDragLeave={() => setDragOverChildIndex(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (draggedChildIndex !== null && draggedChildIndex !== childIndex) {
                    reorderLoopChildren(element.id, draggedChildIndex, childIndex, currentSection)
                  }
                  setDraggedChildIndex(null)
                  setDragOverChildIndex(null)
                }}
                onDragEnd={() => {
                  setDraggedChildIndex(null)
                  setDragOverChildIndex(null)
                }}
                className={`px-2 py-1.5 rounded-lg cursor-move border transition-all text-xs ${
                  draggedChildIndex === childIndex
                    ? 'opacity-50 bg-purple-100 dark:bg-purple-500/30 border-purple-400'
                    : dragOverChildIndex === childIndex
                    ? 'border-purple-500 border-dashed bg-purple-50 dark:bg-purple-500/20'
                    : isChildSelected
                    ? 'bg-purple-100 dark:bg-purple-500/30 border-purple-500 text-purple-700 dark:text-purple-200 font-medium'
                    : 'theme-surface border-purple-200 dark:border-purple-500/20 hover:bg-purple-50 dark:hover:bg-purple-500/10 theme-text-secondary'
                }`}
                onClick={() => selectLoopChild(element.id, child.id, currentSection)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-[10px] font-mono w-3">{childIndex + 1}</span>
                    <span className="text-purple-400">{getChildIcon(child.type)}</span>
                    <span className="truncate capitalize">{child.type.replace('_', ' ')}</span>
                    {child.value && (
                      <span className="text-xs text-gray-400 truncate max-w-[60px]">
                        {String(child.value).substring(0, 10)}...
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLoopChildElement(element.id, child.id, currentSection)
                    }}
                    className="text-red-400 hover:text-red-300 p-0.5"
                    title="Remove"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
          
          
          <div className="flex flex-wrap gap-1 pt-1">
            {[
              { type: 'text', label: 'T' },
              { type: 'static_text', label: 'S' },
              { type: 'image', label: 'I' },
              { type: 'rectangle', label: 'R' },
              { type: 'line', label: 'L' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddChildElement(item.type)}
                className="w-6 h-6 text-[10px] bg-purple-500/20 border border-purple-500/30 rounded hover:bg-purple-500/40 text-purple-300 font-medium"
                title={`Add ${item.type}`}
              >
                +{item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
