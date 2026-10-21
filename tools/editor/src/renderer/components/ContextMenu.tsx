import { useEffect, useRef } from 'react'
import { useUIStore } from '../store/uiStore'
import { useTemplateStore, flattenElements } from '../store/templateStore'
import { Icon } from './atoms'

export default function ContextMenu() {
  const { contextMenu, closeContextMenu } = useUIStore()
  const {
    template,
    selectedElementIds,
    selectedElementLocation,
    selectedGroupId,
    currentSection,
    copiedElements,
    copyElement,
    pasteElement,
    deleteElement,
    deleteSelectedElements,
    deleteLoopChildElement,
    createGroup,
    ungroupElements,
    selectGroup,
    toggleElementVisibility,
    addElement,
  } = useTemplateStore()

  const menuRef = useRef<HTMLDivElement>(null)

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!contextMenu) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu()
      }
    }

    // Use capture phase (true) so stopPropagation in elements doesn't prevent closing
    window.addEventListener('mousedown', handleOutsideClick, true)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick, true)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu, closeContextMenu])

  // Close context menu if selection changes away from the targeted element
  useEffect(() => {
    if (!contextMenu) return
    if (contextMenu.elementId && !selectedElementIds.includes(contextMenu.elementId)) {
      closeContextMenu()
    }
  }, [selectedElementIds, contextMenu, closeContextMenu])

  if (!contextMenu) return null

  const { x, y, targetType, elementId, location } = contextMenu
  const targetLocation = location || selectedElementLocation || currentSection

  // Find target element details
  const sectionElements = (() => {
    if (targetLocation === 'header') return template.pageSettings.header?.elements || []
    if (targetLocation === 'footer') return template.pageSettings.footer?.elements || []
    if (targetLocation === 'bodyBackground') return template.pageSettings.bodyBackground?.elements || []
    if (targetLocation === 'summary') return template.summaryPage?.elements || []
    return template.page || []
  })()

  const flatElements = flattenElements(sectionElements)
  const targetElement = elementId ? flatElements.find((el) => el.id === elementId) : null

  // Groups
  const allGroups = [
    ...(template.groups || []),
    ...(template.pageSettings.header?.groups || []),
    ...(template.pageSettings.footer?.groups || []),
    ...(template.pageSettings.bodyBackground?.groups || []),
    ...(template.summaryPage?.groups || []),
  ]

  const activeGroup = allGroups.find(
    (g) => g.elementIds.includes(elementId || '') || selectedElementIds.some((id) => g.elementIds.includes(id)) || (selectedGroupId && g.id === selectedGroupId)
  )

  const canGroup = selectedElementIds.length >= 2 && !activeGroup
  const canUngroup = !!activeGroup
  const hasCopiedElements = !!copiedElements && copiedElements.elements?.length > 0

  // Viewport clamping
  const menuWidth = 210
  const menuHeight = 310
  const clampedX = Math.max(10, Math.min(x, window.innerWidth - menuWidth - 10))
  const clampedY = Math.max(10, Math.min(y, window.innerHeight - menuHeight - 10))

  const handleCopy = () => {
    copyElement()
    closeContextMenu()
  }

  const handlePaste = () => {
    pasteElement()
    closeContextMenu()
  }

  const handleDuplicate = () => {
    copyElement()
    pasteElement()
    closeContextMenu()
  }

  const handleDelete = () => {
    if (selectedElementIds.length > 1) {
      deleteSelectedElements()
    } else if (contextMenu.containerId && elementId) {
      deleteLoopChildElement(contextMenu.containerId, elementId, targetLocation)
    } else if (elementId) {
      deleteElement(elementId, targetLocation)
    }
    closeContextMenu()
  }

  const handleToggleVisibility = () => {
    if (elementId) {
      toggleElementVisibility(elementId, targetLocation)
    }
    closeContextMenu()
  }

  const handleGroup = () => {
    const defaultName = `Grupo ${allGroups.length + 1}`
    createGroup(defaultName, selectedElementIds, targetLocation)
    closeContextMenu()
  }

  const handleUngroup = () => {
    if (activeGroup) {
      ungroupElements(activeGroup.id, (activeGroup.location || targetLocation) as any)
    }
    closeContextMenu()
  }

  const handleEditGroup = () => {
    if (activeGroup) {
      selectGroup(activeGroup.id, (activeGroup.location || targetLocation) as any)
    }
    closeContextMenu()
  }

  const handleAddQuickElement = (type: string) => {
    const newId = `${type}-${Date.now()}`
    const baseElement = {
      type,
      id: newId,
      x: 30,
      y: 30,
      width: type === 'line' ? 200 : type === 'container' ? '100%' : 150,
      height: type === 'line' ? 0 : 30,
      value: type === 'text' ? 'Novo Texto' : type === 'static_text' ? 'Texto Fixo' : '',
    }
    addElement(baseElement as any, targetLocation)
    closeContextMenu()
  }

  return (
    <>
      <div
        ref={menuRef}
        style={{ left: clampedX, top: clampedY }}
        className="fixed z-[9999] w-52 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl py-1 text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800/80"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Header se for elemento */}
        {targetElement && (
          <div className="px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/40">
            <span className="font-mono truncate max-w-[120px]">#{targetElement.id}</span>
            <span className="uppercase font-semibold text-indigo-400 px-1 py-0.2 rounded bg-indigo-500/10">
              {targetElement.type}
            </span>
          </div>
        )}

        {/* Section 1: Clipboard Actions */}
        <div className="p-1 space-y-0.5">
          {targetType !== 'canvas' && (
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon name="copy" size="xs" className="text-slate-400" />
                <span>Copiar</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Ctrl+C</span>
            </button>
          )}

          <button
            onClick={handlePaste}
            disabled={!hasCopiedElements}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
              hasCopiedElements
                ? 'hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name="copy" size="xs" className={hasCopiedElements ? 'text-slate-400' : 'text-slate-600'} />
              <span>Colar</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Ctrl+V</span>
          </button>

          {targetType !== 'canvas' && (
            <button
              onClick={handleDuplicate}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon name="copy" size="xs" className="text-slate-400" />
                <span>Duplicar</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Ctrl+D</span>
            </button>
          )}
        </div>

        {/* Section 2: Group / Ungroup */}
        {(canGroup || canUngroup) && (
          <div className="p-1 space-y-0.5">
            {canGroup && (
              <button
                onClick={handleGroup}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 transition cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2">
                  <Icon name="group" size="xs" className="text-indigo-400" />
                  <span>Agrupar Seleção ({selectedElementIds.length})</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Ctrl+G</span>
              </button>
            )}

            {canUngroup && (
              <>
                <button
                  onClick={handleEditGroup}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-purple-300 hover:text-purple-200 transition cursor-pointer font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="group" size="xs" className="text-purple-400" />
                    <span>Propriedades do Grupo</span>
                  </div>
                </button>
                <button
                  onClick={handleUngroup}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-amber-300 hover:text-amber-200 transition cursor-pointer font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="ungroup" size="xs" className="text-amber-400" />
                    <span>Desagrupar</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+⇧+G</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Section 3: Visibility & Order */}
        {targetType !== 'canvas' && targetElement && (
          <div className="p-1 space-y-0.5">
            <button
              onClick={handleToggleVisibility}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <Icon name={targetElement.hidden ? 'eye' : 'eye-off'} size="xs" className="text-slate-400" />
              <span>{targetElement.hidden ? 'Mostrar Elemento' : 'Ocultar Elemento'}</span>
            </button>
          </div>
        )}

        {/* Section 4: Quick Add Element (se clicou em canvas vazio) */}
        {targetType === 'canvas' && (
          <div className="p-1 space-y-0.5">
            <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Adicionar Elemento
            </div>
            <button
              onClick={() => handleAddQuickElement('text')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span className="text-slate-400 font-serif font-bold text-xs w-4 text-center">T</span>
              <span>Texto Dinâmico</span>
            </button>
            <button
              onClick={() => handleAddQuickElement('static_text')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span className="text-slate-400 font-serif font-bold text-xs w-4 text-center">S</span>
              <span>Texto Estático</span>
            </button>
            <button
              onClick={() => handleAddQuickElement('container')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span className="text-indigo-400 text-xs w-4 text-center">⊞</span>
              <span>Container</span>
            </button>
            <button
              onClick={() => handleAddQuickElement('rectangle')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span className="text-slate-400 text-xs w-4 text-center">▭</span>
              <span>Retângulo</span>
            </button>
            <button
              onClick={() => handleAddQuickElement('line')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span className="text-slate-400 text-xs w-4 text-center">―</span>
              <span>Linha</span>
            </button>
          </div>
        )}

        {/* Section 5: Delete */}
        {(targetType !== 'canvas' || selectedElementIds.length > 0) && (
          <div className="p-1">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer font-medium"
            >
              <div className="flex items-center gap-2">
                <Icon name="trash" size="xs" />
                <span>
                  {selectedElementIds.length > 1 ? `Excluir (${selectedElementIds.length})` : 'Excluir'}
                </span>
              </div>
              <span className="text-[10px] text-red-400/70 font-mono">Del</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
