import { useState, type DragEvent } from 'react'
import { useTemplateStore, type Element, type ElementGroup } from '../store/templateStore'
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

  const [pageSettingsExpanded, setPageSettingsExpanded] = useState(false)
  const { selectedElementIds, selectElement } = useTemplateStore()
  const selectedContainerId = currentSection === 'body'
    ? (template.page || []).find(el => el.id === selectedElementIds[0] && el.type === 'container')?.id || null
    : null

  if (isSidebarMinimized && !isSidebarPinned) {
    return (
      <div className="w-14 theme-bg-secondary border-r theme-border flex flex-col items-center py-2 gap-1">
        {/* Expand Button */}
        <IconButton
          icon="chevron-right"
          onClick={toggleSidebarMinimized}
          tooltip={t.sidebar.expand}
          size="sm"
        />
        
        <Divider orientation="horizontal" className="w-8 my-1" />
        
        {/* Page Settings */}
        <SidebarButton
          icon="settings"
          label={t.sidebar.settings}
          tooltip={t.sidebar.pageSettings}
          onClick={() => {
            toggleSidebarMinimized()
            setPageSettingsExpanded(true)
          }}
          variant="primary"
        />

        {/* Section Buttons */}
        <div className="flex flex-col items-center gap-1">
          {/* Header */}
          {template.pageSettings.header ? (
            <SidebarButton
              icon="arrow-up"
              label={t.sidebar.header}
              tooltip={t.sidebar.header}
              onClick={() => setCurrentSection('header')}
              isActive={currentSection === 'header'}
              variant="blue"
            />
          ) : (
            <SidebarButton
              icon="plus"
              label={t.sidebar.header}
              tooltip={t.sidebar.addHeader}
              onClick={addHeader}
              variant="add"
            />
          )}

          {/* Page/Body */}
          <SidebarButton
            icon="page"
            label={t.sidebar.page}
            tooltip={t.sidebar.page}
            onClick={() => setCurrentSection('body')}
            isActive={currentSection === 'body'}
            variant="primary"
          />

          {/* Footer */}
          {template.pageSettings.footer ? (
            <SidebarButton
              icon="arrow-down"
              label={t.sidebar.footer}
              tooltip={t.sidebar.footer}
              onClick={() => setCurrentSection('footer')}
              isActive={currentSection === 'footer'}
              variant="blue"
            />
          ) : (
            <SidebarButton
              icon="plus"
              label={t.sidebar.footer}
              tooltip={t.sidebar.addFooter}
              onClick={addFooter}
              variant="add"
            />
          )}

          <Divider orientation="horizontal" className="w-8 my-1" />

          {/* Summary */}
          {template.summaryPage ? (
            <SidebarButton
              icon="layers"
              label={t.sidebar.summary}
              tooltip={t.sidebar.summary}
              onClick={() => setCurrentSection('summary')}
              isActive={currentSection === 'summary'}
              variant="green"
            />
          ) : (
            <SidebarButton
              icon="plus"
              label={t.sidebar.summary}
              tooltip={t.sidebar.addSummary}
              onClick={addSummaryPage}
              variant="add"
            />
          )}

          {/* Background */}
          {template.pageSettings.bodyBackground ? (
            <SidebarButton
              icon="rectangle"
              label={t.sidebar.background}
              tooltip={t.sidebar.background}
              onClick={() => setCurrentSection('bodyBackground')}
              isActive={currentSection === 'bodyBackground'}
              variant="purple"
            />
          ) : (
            <SidebarButton
              icon="plus"
              label={t.sidebar.background}
              tooltip={t.sidebar.addBackground}
              onClick={addBodyBackground}
              variant="add"
            />
          )}
        </div>

        <Divider orientation="horizontal" className="w-8 my-1" />

        {/* Elements */}
        <SidebarButton
          icon="layers"
          label={t.sidebar.elementsTitle}
          tooltip={t.sidebar.elementsTitle}
          onClick={toggleSidebarMinimized}
          variant="primary"
        />
      </div>
    )
  }

  return (
    <div className="w-64 theme-bg-secondary border-r theme-border flex flex-col h-full">
      <div className="p-3 border-b theme-border flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold theme-text">Navigator</h2>
        <div className="flex items-center gap-1">
          <IconButton
            icon={isSidebarPinned ? 'pin' : 'pin-off'}
            onClick={toggleSidebarPinned}
            tooltip={isSidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            variant={isSidebarPinned ? 'default' : 'ghost'}
            size="sm"
            className={isSidebarPinned ? 'text-blue-500' : ''}
          />
          <IconButton
            icon="chevron-left"
            onClick={toggleSidebarMinimized}
            tooltip="Minimize sidebar"
            size="sm"
          />
        </div>
      </div>
      <div className="p-4 flex-shrink-0">
        {/* Page Settings */}
        <div className="mb-4 p-3 theme-bg-tertiary border theme-border rounded-xl">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setPageSettingsExpanded(!pageSettingsExpanded)}
          >
            <h2 className="section-header flex items-center gap-2">
              <Icon name="page" size="sm" />
              {t.sidebar.pageSettings}
            </h2>
            <button
              className="theme-text-muted hover:theme-surface rounded p-0.5"
              title={pageSettingsExpanded ? t.sidebar.collapse : t.sidebar.expand}
            >
              {pageSettingsExpanded ? '▼' : '▶'}
            </button>
          </div>
          
          {pageSettingsExpanded && (
            <>
              {/* Page Size */}
              <div className="mb-3 mt-3 space-y-1">
                <label className="text-xs font-medium theme-text-secondary">
                  {t.sidebar.size}
                </label>
                <Select
                  value={template.pageSettings.size}
                  onChange={(e) => {
                    const { updateTemplate } = useTemplateStore.getState()
                    updateTemplate({
                      pageSettings: {
                        ...template.pageSettings,
                        size: e.target.value as 'A4' | 'Letter'
                      }
                    })
                  }}
                  options={[
                    { value: 'A4', label: 'A4 (595 × 842 pt)' },
                    { value: 'Letter', label: 'Letter (612 × 792 pt)' },
                  ]}
                />
              </div>

              {/* Margins */}
              <div className="mb-2">
                <label className="block text-xs font-medium theme-text-secondary mb-2">
                  {t.sidebar.margins}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label={
                      <span className="flex items-center gap-1">
                        <Icon name="arrow-up" size="xs" />
                        {t.sidebar.top}
                      </span>
                    }
                    value={template.pageSettings.margins.top}
                    onValueChange={(value) => {
                      const { updateTemplate } = useTemplateStore.getState()
                      updateTemplate({
                        pageSettings: {
                          ...template.pageSettings,
                          margins: {
                            ...template.pageSettings.margins,
                            top: value || 0
                          }
                        }
                      })
                    }}
                  />
                  <NumberField
                    label={
                      <span className="flex items-center gap-1">
                        <Icon name="arrow-down" size="xs" />
                        {t.sidebar.bottom}
                      </span>
                    }
                    value={template.pageSettings.margins.bottom}
                    onValueChange={(value) => {
                      const { updateTemplate } = useTemplateStore.getState()
                      updateTemplate({
                        pageSettings: {
                          ...template.pageSettings,
                          margins: {
                            ...template.pageSettings.margins,
                            bottom: value || 0
                          }
                        }
                      })
                    }}
                  />
                  <NumberField
                    label={
                      <span className="flex items-center gap-1">
                        <Icon name="arrow-left" size="xs" />
                        {t.sidebar.left}
                      </span>
                    }
                    value={template.pageSettings.margins.left}
                    onValueChange={(value) => {
                      const { updateTemplate } = useTemplateStore.getState()
                      updateTemplate({
                        pageSettings: {
                          ...template.pageSettings,
                          margins: {
                            ...template.pageSettings.margins,
                            left: value || 0
                          }
                        }
                      })
                    }}
                  />
                  <NumberField
                    label={
                      <span className="flex items-center gap-1">
                        <Icon name="arrow-right" size="xs" />
                        {t.sidebar.right}
                      </span>
                    }
                    value={template.pageSettings.margins.right}
                    onValueChange={(value) => {
                      const { updateTemplate } = useTemplateStore.getState()
                      updateTemplate({
                        pageSettings: {
                          ...template.pageSettings,
                          margins: {
                            ...template.pageSettings.margins,
                            right: value || 0
                          }
                        }
                      })
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section Selector */}
        <div className="mb-4 p-3 theme-bg-tertiary border theme-border rounded-xl">
          <h2 className="section-header mb-3 flex items-center gap-2">
            <Icon name="section" size="sm" />
            {t.sidebar.section}
          </h2>
          <div className="space-y-2">
            {/* Header */}
            {template.pageSettings.header ? (
              <div className="relative">
                <button
                  onClick={() => setCurrentSection('header')}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
                    currentSection === 'header'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'theme-surface border theme-border theme-text hover:border-primary-500/50'
                  }`}
                >
                  {t.sidebar.header}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(t.sidebar.removeHeaderConfirm)) {
                      removeHeader()
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center theme-surface hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded transition"
                  title={t.common.remove}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed theme-border rounded-lg p-2 flex items-center justify-between hover:border-primary-500/50 transition">
                <span className="text-xs theme-text-muted">{t.sidebar.header}</span>
                <button
                  onClick={addHeader}
                  className="w-6 h-6 flex items-center justify-center theme-surface hover:bg-primary-500/20 rounded transition"
                  title={t.sidebar.addHeader}
                >
                  <Icon name="plus" size="sm" />
                </button>
              </div>
            )}

            {/* Page */}
            <button
              onClick={() => setCurrentSection('body')}
              className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
                currentSection === 'body'
                  ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                  : 'theme-surface border theme-border theme-text hover:border-primary-500/50'
              }`}
            >
              {t.sidebar.page}
            </button>

            {/* Footer */}
            {template.pageSettings.footer ? (
              <div className="relative">
                <button
                  onClick={() => setCurrentSection('footer')}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
                    currentSection === 'footer'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'theme-surface border theme-border theme-text hover:border-primary-500/50'
                  }`}
                >
                  {t.sidebar.footer}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(t.sidebar.removeFooterConfirm)) {
                      removeFooter()
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center theme-surface hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded transition"
                  title={t.common.remove}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed theme-border rounded-lg p-2 flex items-center justify-between hover:border-primary-500/50 transition">
                <span className="text-xs theme-text-muted">{t.sidebar.footer}</span>
                <button
                  onClick={addFooter}
                  className="w-6 h-6 flex items-center justify-center theme-surface hover:bg-primary-500/20 rounded transition"
                  title={t.sidebar.addFooter}
                >
                  <Icon name="plus" size="sm" />
                </button>
              </div>
            )}

            {/* Summary */}
            {template.summaryPage ? (
              <div className="relative">
                <button
                  onClick={() => setCurrentSection('summary')}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
                    currentSection === 'summary'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'theme-surface border theme-border theme-text hover:border-green-500/50'
                  }`}
                >
                  {t.sidebar.summary}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(t.sidebar.removeSummaryConfirm)) {
                      removeSummaryPage()
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center theme-surface hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded transition"
                  title={t.common.remove}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed theme-border rounded-lg p-2 flex items-center justify-between hover:border-green-500/50 transition">
                <span className="text-xs theme-text-muted">{t.sidebar.summary}</span>
                <button
                  onClick={addSummaryPage}
                  className="w-6 h-6 flex items-center justify-center theme-surface hover:bg-green-500/20 rounded transition"
                  title={t.sidebar.addSummary}
                >
                  <Icon name="plus" size="sm" />
                </button>
              </div>
            )}

            {/* Background */}
            {template.pageSettings.bodyBackground ? (
              <div className="relative">
                <button
                  onClick={() => setCurrentSection('bodyBackground')}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition text-left ${
                    currentSection === 'bodyBackground'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'theme-surface border theme-border theme-text hover:border-purple-500/50'
                  }`}
                >
                  {t.sidebar.background}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(t.sidebar.removeBackgroundConfirm)) {
                      removeBodyBackground()
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center theme-surface hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded transition"
                  title={t.common.remove}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed theme-border rounded-lg p-2 flex items-center justify-between hover:border-purple-500/50 transition">
                <span className="text-xs theme-text-muted">{t.sidebar.background}</span>
                <button
                  onClick={addBodyBackground}
                  className="w-6 h-6 flex items-center justify-center theme-surface hover:bg-purple-500/20 rounded transition"
                  title={t.sidebar.addBackground}
                >
                  <Icon name="plus" size="sm" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layers Header and Group Button */}
      <div className="px-4 py-3 border-t theme-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-header flex items-center gap-2">
            <Icon name="layers" size="sm" />
            {t.sidebar.elementsTitle}
          </h2>
        </div>
        {currentSection === 'body' && (
          <ContainersPanel
            selectedContainerId={selectedContainerId}
            onSelectContainer={(id) => selectElement(id, 'body')}
          />
        )}
        <GroupButton selectedContainerId={selectedContainerId} />
      </div>

      {/* Elements List - WITH SCROLL */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-4">
          <ElementsList selectedContainerId={selectedContainerId} />
        </div>
      </div>
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
  const { template, addElement, currentSection, selectElement } = useTemplateStore()

  if (currentSection !== 'body') return null
  const containers = (template.page || []).filter((el) => el.type === 'container')
  const handleAddContainer = () => {
    const id = `container-${Date.now()}`
    addElement({ type: 'container', id, x: 50, y: 50, width: 400, height: 150, elements: [] }, 'body')
    selectElement(id, 'body')
  }

  return (
    <div className="mb-3">
      <h3 className="text-xs font-semibold theme-text-muted uppercase mb-2">Containers</h3>
      <button onClick={handleAddContainer} className="w-full px-3 py-2 text-sm theme-surface border theme-border rounded-lg mb-2">
        + Add Container
      </button>
      <div className="space-y-1">
        {containers.map((container) => (
          <button
            key={container.id}
            onClick={() => onSelectContainer(container.id)}
            className={`w-full text-left px-2 py-1 rounded text-xs ${selectedContainerId === container.id ? 'bg-primary-100 dark:bg-primary-500/30' : 'theme-surface'}`}
          >
            {container.id}
          </button>
        ))}
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
    reorderElement,
    toggleElementVisibility,
    toggleGroupCollapse,
    toggleGroupVisibility,
    selectGroup,
    reorderGroup
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
      const containers = template.page || []
      const selected = containers.find((el) => el.id === selectedContainerId && el.type === 'container')
      return (selected?.elements as Element[]) || []
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
                      selectedElementIds.includes(element.id) && selectedElementLocation === currentSection
                        ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200 font-medium'
                        : 'theme-surface border-primary-500/20 hover:bg-primary-500/10 theme-text-secondary'
                    }`}
                    onClick={(e) => (e.ctrlKey || e.metaKey) ? toggleElementSelection(element.id, currentSection) : selectElement(element.id, currentSection)}
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
                : selectedElementIds.includes(element.id) && selectedElementLocation === currentSection
                ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200 font-medium shadow-sm'
                : 'theme-surface border theme-border hover:bg-primary-500/10 hover:border-primary-500/30 theme-text-secondary'
            }`}
            onClick={(e) => (e.ctrlKey || e.metaKey) ? toggleElementSelection(element.id, currentSection) : selectElement(element.id, currentSection)}
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
                      deleteElement(element.id, currentSection)
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
            <span className="text-xs font-bold text-purple-300 truncate">
              {element.id}
            </span>
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
