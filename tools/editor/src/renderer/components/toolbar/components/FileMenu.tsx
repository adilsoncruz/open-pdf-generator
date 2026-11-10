import { useTranslation } from '../../../i18n'
import { Badge, Icon } from '../../atoms'
import { MenuItem, DropdownMenu } from '../../molecules'

interface FileMenuProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onNew: () => void
  onOpen: () => void
  onImportJasper?: () => void
  onSave: () => void
  onSaveAs: () => void
  onExport: () => void
  onOpenSettings: () => void
}

export function FileMenu({
  isOpen,
  onOpenChange,
  onNew,
  onOpen,
  onImportJasper,
  onSave,
  onSaveAs,
  onExport,
  onOpenSettings,
}: FileMenuProps) {
  const { t } = useTranslation()

  return (
    <DropdownMenu
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={
        <button
          className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded transition flex items-center gap-1.5"
          title={t.toolbar.file}
        >
          <Icon name="file-text" size="sm" />
          <span>{t.toolbar.file}</span>
          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      }
    >
      <MenuItem shortcut="Ctrl+N" onClick={() => { onNew(); onOpenChange(false) }}>
        {t.toolbar.new}
      </MenuItem>
      <MenuItem shortcut="Ctrl+O" onClick={() => { onOpen(); onOpenChange(false) }}>
        {t.toolbar.open}
      </MenuItem>
      {onImportJasper && (
        <MenuItem onClick={() => { onImportJasper(); onOpenChange(false) }}>
          <span>{t.toolbar.importJasper}</span>
          <Badge variant="warning" className="uppercase tracking-wider text-[10px] py-0 px-1.5 font-semibold">Beta</Badge>
        </MenuItem>
      )}
      <div className="border-t border-slate-800 my-1" />
      <MenuItem shortcut="Ctrl+S" onClick={() => { onSave(); onOpenChange(false) }}>
        {t.toolbar.save}
      </MenuItem>
      <MenuItem shortcut="Ctrl+Shift+S" onClick={() => { onSaveAs(); onOpenChange(false) }}>
        {t.toolbar.saveAs}
      </MenuItem>
      <div className="border-t border-slate-800 my-1" />
      <MenuItem onClick={() => { onExport(); onOpenChange(false) }}>
        {t.toolbar.export}
      </MenuItem>
      <div className="border-t border-slate-800 my-1" />
      <MenuItem onClick={() => { onOpenSettings(); onOpenChange(false) }}>
        {t.toolbar.settings}
      </MenuItem>
    </DropdownMenu>
  )
}
