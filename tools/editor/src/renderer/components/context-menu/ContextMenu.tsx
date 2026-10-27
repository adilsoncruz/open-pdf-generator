import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useTemplateStore } from '../../store/templateStore'
import { ContextMenuPortal } from './ContextMenuPortal'
import { ContextMenuItem, ContextMenuHeader, ContextMenuSection, DEFAULT_QUICK_ADD_OPTIONS } from './ContextMenuItem'
import { useContextMenuActions } from './ContextMenuActions'

export function ContextMenu() {
  const { contextMenu, closeContextMenu } = useUIStore()
  const { selectedElementIds } = useTemplateStore()
  const actions = useContextMenuActions()

  useEffect(() => {
    if (contextMenu?.elementId && !selectedElementIds.includes(contextMenu.elementId)) {
      closeContextMenu()
    }
  }, [selectedElementIds, contextMenu, closeContextMenu])

  if (!contextMenu) return null

  const { targetType, targetElement, canGroup, canUngroup, hasCopiedElements, selectedCount } = actions

  return (
    <ContextMenuPortal x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}>
      {targetElement && <ContextMenuHeader id={targetElement.id} type={targetElement.type} />}

      {/* Clipboard */}
      <ContextMenuSection>
        {targetType !== 'canvas' && (
          <ContextMenuItem label="Copiar" icon="copy" shortcut="Ctrl+C" onClick={actions.handleCopy} />
        )}
        <ContextMenuItem
          label="Colar"
          icon="copy"
          shortcut="Ctrl+V"
          disabled={!hasCopiedElements}
          onClick={actions.handlePaste}
        />
        {targetType !== 'canvas' && (
          <ContextMenuItem label="Duplicar" icon="copy" shortcut="Ctrl+D" onClick={actions.handleDuplicate} />
        )}
      </ContextMenuSection>

      {/* Group / Ungroup */}
      {(canGroup || canUngroup) && (
        <ContextMenuSection>
          {canGroup && (
            <ContextMenuItem
              variant="indigo"
              icon="group"
              label={`Agrupar Seleção (${selectedCount})`}
              shortcut="Ctrl+G"
              onClick={actions.handleGroup}
            />
          )}
          {canUngroup && (
            <>
              <ContextMenuItem variant="purple" icon="group" label="Propriedades do Grupo" onClick={actions.handleEditGroup} />
              <ContextMenuItem variant="amber" icon="ungroup" label="Desagrupar" shortcut="Ctrl+⇧+G" onClick={actions.handleUngroup} />
            </>
          )}
        </ContextMenuSection>
      )}

      {/* Visibility & Order */}
      {targetType !== 'canvas' && targetElement && (
        <ContextMenuSection>
          <ContextMenuItem
            label={targetElement.hidden ? 'Mostrar Elemento' : 'Ocultar Elemento'}
            icon={targetElement.hidden ? 'eye' : 'eye-off'}
            onClick={actions.handleToggleVisibility}
          />
          <ContextMenuItem label="Trazer para frente" icon="arrow-up" onClick={actions.handleBringToFront} />
          <ContextMenuItem label="Enviar para trás" icon="arrow-down" onClick={actions.handleSendToBack} />
        </ContextMenuSection>
      )}

      {/* Quick Add */}
      {targetType === 'canvas' && (
        <ContextMenuSection title="Adicionar Elemento">
          {DEFAULT_QUICK_ADD_OPTIONS.map((item) => (
            <ContextMenuItem key={item.type} label={item.label} icon={item.icon} onClick={() => actions.handleAddQuickElement(item.type)} />
          ))}
        </ContextMenuSection>
      )}

      {/* Delete */}
      {(targetType !== 'canvas' || selectedCount > 0) && (
        <ContextMenuSection>
          <ContextMenuItem
            variant="danger"
            icon="trash"
            label={selectedCount > 1 ? `Excluir (${selectedCount})` : 'Excluir'}
            shortcut="Del"
            onClick={actions.handleDelete}
          />
        </ContextMenuSection>
      )}
    </ContextMenuPortal>
  )
}

export default ContextMenu
