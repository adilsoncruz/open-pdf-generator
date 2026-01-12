import { useState } from 'react'
import { useTemplateStore, type Element, type ElementGroup } from '../store/templateStore'

export default function PropertiesPanel() {
  // HOOKS DEVEM VIR PRIMEIRO (antes de qualquer return)
  const [activeTab, setActiveTab] = useState<string>('appearance')
  
  
  const store = useTemplateStore()
  
  const template = store.template
  const selectedElementIds = store.selectedElementIds
  const selectedElementLocation = store.selectedElementLocation
  const selectedGroupId = store.selectedGroupId
  const selectedLoopChildId = store.selectedLoopChildId
  const selectedLoopParentId = store.selectedLoopParentId
  const updateElement = store.updateElement
  const updateSelectedElements = store.updateSelectedElements
  const updateGroup = store.updateGroup
  const deleteGroup = store.deleteGroup
  const addElementToLoop = store.addElementToLoop
  const deleteLoopChildElement = store.deleteLoopChildElement
  const updateLoopChildElement = store.updateLoopChildElement
  const saveSnapshot = store.saveSnapshot
  
  
  const handleInputBlur = () => {
    saveSnapshot()
  }
  
  // Buscar elementos selecionados na location correta (PRIORIDADE sobre grupos)
  const selectedElements = (() => {
    if (selectedElementIds.length === 0) return []
    
    let elements: Element[] = []
    
    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      elements = template.pageSettings.header.elements.filter((el) => selectedElementIds.includes(el.id))
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      elements = template.pageSettings.footer.elements.filter((el) => selectedElementIds.includes(el.id))
    } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
      elements = template.pageSettings.bodyBackground.elements.filter((el) => selectedElementIds.includes(el.id))
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      elements = template.summaryPage.elements.filter((el) => selectedElementIds.includes(el.id))
    } else {
      elements = template.pageElements.filter((el) => selectedElementIds.includes(el.id))
    }
    
    return elements
  })()

  
  if (selectedLoopChildId && selectedLoopParentId) {
    // Encontrar o loop pai e o elemento filho
    let loopElement: Element | null = null
    
    if (selectedElementLocation === 'header' && template.pageSettings.header) {
      loopElement = template.pageSettings.header.elements.find(el => el.id === selectedLoopParentId) || null
    } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
      loopElement = template.pageSettings.footer.elements.find(el => el.id === selectedLoopParentId) || null
    } else if (selectedElementLocation === 'summary' && template.summaryPage) {
      loopElement = template.summaryPage.elements.find(el => el.id === selectedLoopParentId) || null
    } else {
      loopElement = template.pageElements.find(el => el.id === selectedLoopParentId) || null
    }
    
    if (loopElement && loopElement.elements) {
      const childElement = loopElement.elements.find((c: any) => c.id === selectedLoopChildId)
      if (childElement) {
        return (
          <LoopChildPropertiesPanel
            loopId={selectedLoopParentId}
            child={childElement}
            location={selectedElementLocation}
            loopElement={loopElement}
          />
        )
      }
    }
  }

  
  if (selectedElements.length === 0) {
    // Buscar grupo selecionado
    const selectedGroup = (() => {
      if (!selectedGroupId) return null
      
      if (selectedElementLocation === 'header' && template.pageSettings.header) {
        return template.pageSettings.header.groups?.find(g => g.id === selectedGroupId) || null
      } else if (selectedElementLocation === 'footer' && template.pageSettings.footer) {
        return template.pageSettings.footer.groups?.find(g => g.id === selectedGroupId) || null
      } else if (selectedElementLocation === 'bodyBackground' && template.pageSettings.bodyBackground) {
        return template.pageSettings.bodyBackground.groups?.find(g => g.id === selectedGroupId) || null
      } else if (selectedElementLocation === 'summary' && template.summaryPage) {
        return template.summaryPage.groups?.find(g => g.id === selectedGroupId) || null
      } else {
        return template.groups?.find(g => g.id === selectedGroupId) || null
      }
    })()
    
    
    if (selectedGroup) {
      return <GroupPropertiesPanel group={selectedGroup} location={selectedElementLocation} />
    }
    
    
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
    
    
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">Select an element or group to edit</p>
      </div>
    )
  }

  const isMultiSelection = selectedElements.length > 1
  const selectedElement = selectedElements[0] 

  const handleUpdate = (field: string, value: any) => {
    if (isMultiSelection) {
      updateSelectedElements({ [field]: value })
    } else {
      updateElement(selectedElement.id, { [field]: value }, selectedElementLocation)
    }
  }

  const handleStyleUpdate = (field: string, value: any) => {
    if (isMultiSelection) {
      updateSelectedElements({
        style: { ...selectedElement.style, [field]: value },
      })
    } else {
      updateElement(selectedElement.id, {
        style: { ...selectedElement.style, [field]: value },
      }, selectedElementLocation)
    }
  }

  // Icon component for tabs
  const TabIcon = ({ id }: { id: string }) => {
    const iconProps = "w-4 h-4"
    
    switch (id) {
      case 'appearance':
  return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="5" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          </svg>
        )
      case 'borders':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="10" height="10" />
          </svg>
        )
      case 'textfield':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 3h8M8 3v10M6 13h4" strokeLinecap="round" />
          </svg>
        )
      case 'line':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="13" x2="13" y2="3" strokeLinecap="round" />
          </svg>
        )
      case 'image':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <circle cx="6" cy="6" r="1.5" fill="currentColor" />
            <path d="M2 11l3-3 2 2 4-4 3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'barcode':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="3" width="1.5" height="10" />
            <rect x="4.5" y="3" width="0.8" height="10" />
            <rect x="6.3" y="3" width="1.5" height="10" />
            <rect x="8.8" y="3" width="0.8" height="10" />
            <rect x="10.6" y="3" width="1.2" height="10" />
            <rect x="12.8" y="3" width="1.2" height="10" />
          </svg>
        )
      case 'general':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="5" />
            <path d="M8 5v3l2 2" strokeLinecap="round" />
          </svg>
        )
      case 'columns':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="4" height="10" />
            <rect x="7" y="3" width="4" height="10" />
            <rect x="12" y="3" width="2" height="10" />
          </svg>
        )
      case 'styles':
        return (
          <svg className={iconProps} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h10M5 5h6M6 11h4" strokeLinecap="round" />
          </svg>
        )
      default:
        return null
    }
  }

  // Define tabs based on element type
  const getTabs = () => {
    if (selectedElement.type === 'text' || selectedElement.type === 'static_text') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
        { id: 'textfield', label: 'Text' },
      ]
    } else if (selectedElement.type === 'rectangle') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
      ]
    } else if (selectedElement.type === 'line') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'line', label: 'Line' },
      ]
    } else if (selectedElement.type === 'image') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'image', label: 'Image' },
      ]
    } else if (selectedElement.type === 'barcode') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'barcode', label: 'Code' },
      ]
    } else if (selectedElement.type === 'loop') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'loop', label: 'Loop' },
      ]
    } else if (selectedElement.type === 'table') {
      return [
        { id: 'general', label: 'General' },
        { id: 'columns', label: 'Columns' },
        { id: 'styles', label: 'Styles' },
      ]
    }
    return [{ id: 'appearance', label: 'Appearance' }]
  }

  const tabs = getTabs()

  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b theme-border">
        <h2 className="text-sm font-semibold theme-text">Properties</h2>
        {isMultiSelection ? (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-700 font-medium">
              {selectedElements.length} elements selected
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Changes will be applied to all
            </p>
          </div>
        ) : (
          <p className="text-xs theme-text-muted mt-1">{selectedElement.type}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b theme-border theme-bg-tertiary">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-2.5 text-xs font-medium border-b-2 transition flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800'
                : 'border-transparent theme-text-secondary hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={tab.label}
          >
            <TabIcon id={tab.id} />
            <span className="ml-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TEXT ELEMENT TABS (inclui static_text) */}
        {(selectedElement.type === 'text' || selectedElement.type === 'static_text') && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
        
        {!isMultiSelection && (
                  <>
          <div>
            <label className="block text-xs font-medium theme-text mb-1">ID</label>
            <input
              type="text"
              value={selectedElement.id}
              disabled
              className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900"
            />
          </div>
                    <div className="border-t theme-border my-3"></div>
                  </>
        )}

                {/* Location */}
            <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">X</label>
              <input
                type="number"
                value={selectedElement.x}
                onChange={(e) => handleUpdate('x', parseFloat(e.target.value))}
                onBlur={handleInputBlur}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
                      <label className="block text-xs theme-text-secondary mb-1">Y</label>
              <input
                type="number"
                value={selectedElement.y}
                onChange={(e) => handleUpdate('y', parseFloat(e.target.value))}
                onBlur={handleInputBlur}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          {/* Modo de Posicionamento */}
          <div className="mt-3">
            <label className="block text-xs theme-text-secondary mb-1">Position Mode</label>
            <select
              value={selectedElement.positionMode || 'ABSOLUTE'}
              onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
              className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
            >
              <option value="ABSOLUTE">Absolute (fixed on canvas)</option>
              <option value="RELATIVE">Relative (follows content above)</option>
            </select>
            {selectedElement.positionMode === 'RELATIVE' && (
              <>
                <p className="text-[10px] text-purple-500 mt-1 mb-2">
                  ↳ Positioned after the previous element in PDF
                </p>
                <div className="flex items-center gap-2">
                  <label className="block text-xs theme-text-secondary">Offset Y (PDF):</label>
                  <input
                    type="number"
                    value={selectedElement.relativeOffsetY ?? 10}
                    onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-[10px] theme-text-muted">px</span>
                </div>
                <p className="text-[10px] theme-text-muted mt-1">
                  Space between the previous element and this one
                </p>
              </>
            )}
          </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                {/* Size */}
              <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Size</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">W (Width)</label>
                <input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                      <label className="block text-xs theme-text-secondary mb-1">H (Height)</label>
                <input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
          </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                {/* Color */}
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Color</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs theme-text-secondary mb-1">Text</label>
                        <input
                          type="color"
                          value={selectedElement.style?.color || '#000000'}
                          onChange={(e) => handleStyleUpdate('color', e.target.value)}
                          className="w-full h-7 border theme-border rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs theme-text-secondary mb-1">Background</label>
                        <input
                          type="color"
                          value={selectedElement.style?.backgroundColor && selectedElement.style?.backgroundColor !== 'transparent' ? selectedElement.style?.backgroundColor : '#FFFFFF'}
                          onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                          className="w-full h-7 border theme-border rounded cursor-pointer"
                          disabled={!selectedElement.style?.backgroundColor || selectedElement.style?.backgroundColor === 'transparent'}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs theme-text-secondary">Transparent Background</label>
                      <input
                        type="checkbox"
                        id="transparent-bg"
                        checked={!selectedElement.style?.backgroundColor || selectedElement.style?.backgroundColor === 'transparent'}
                        onChange={(e) => handleStyleUpdate('backgroundColor', e.target.checked ? 'transparent' : '#FFFFFF')}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                
                {selectedElement.type === 'text' && (
                  <>
                    <div className="border-t theme-border my-3"></div>
                    <div>
                      <h3 className="text-xs font-semibold theme-text mb-2">Print Condition</h3>
                      <input
                        type="text"
                        value={selectedElement.printCondition || ''}
                        onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                        placeholder="Ex: invoice.total > 1000"
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs theme-text-muted mt-1">
                        Leave empty to always print
                      </p>
                      
                      {/* Exemplos de Condicionais */}
                      <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                        <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                        <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                          <div>• invoice.total &gt; 1000</div>
                          <div>• customer.type == 'VIP'</div>
                          <div>• items.length &gt; 0</div>
                          <div>• discount &gt; 0</div>
                          <div>• status in ['pending', 'approved']</div>
                          <div>• total &gt;= 100 && total &lt; 500</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* BORDERS TAB */}
            {activeTab === 'borders' && (
          <>
                {/* Paddings */}
            <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Paddings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="same-padding"
                        checked={selectedElement.style?.samePadding || false}
                        onChange={(e) => {
                          const checked = e.target.checked
                          if (checked) {
                            // Quando marca, usa o valor do Left em todos
                            const value = selectedElement.style?.paddingLeft || 0
                            const newStyle = {
                              ...selectedElement.style,
                              samePadding: true,
                              paddingLeft: value,
                              paddingRight: value,
                              paddingTop: value,
                              paddingBottom: value,
                            }
                            if (isMultiSelection) {
                              updateSelectedElements({ style: newStyle })
                            } else {
                              updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                            }
                          } else {
                            // Desmarca apenas o checkbox
                            const newStyle = {
                              ...selectedElement.style,
                              samePadding: false,
                            }
                            if (isMultiSelection) {
                              updateSelectedElements({ style: newStyle })
                            } else {
                              updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                            }
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="same-padding" className="ml-2 text-xs theme-text">
                        Use the same value for every padding
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs theme-text-secondary mb-1">Left</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingLeft || selectedElement.style?.paddingX || 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0
                            if (selectedElement.style?.samePadding) {
                              // Se checkbox marcado, atualiza todos de uma vez
                              const newStyle = {
                                ...selectedElement.style,
                                paddingLeft: value,
                                paddingRight: value,
                                paddingTop: value,
                                paddingBottom: value,
                              }
                              if (isMultiSelection) {
                                updateSelectedElements({ style: newStyle })
                              } else {
                                updateElement(selectedElement.id, { style: newStyle }, selectedElementLocation)
                              }
                            } else {
                              handleStyleUpdate('paddingLeft', value)
                            }
                          }}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs theme-text-secondary mb-1">Right</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingRight || selectedElement.style?.paddingX || 0}
                          onChange={(e) => handleStyleUpdate('paddingRight', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                          min="0"
                          step="1"
                          disabled={selectedElement.style?.samePadding || false}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs theme-text-secondary mb-1">Top</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingTop || selectedElement.style?.paddingY || 0}
                          onChange={(e) => handleStyleUpdate('paddingTop', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                          min="0"
                          step="1"
                          disabled={selectedElement.style?.samePadding || false}
                        />
                      </div>
                      <div>
                        <label className="block text-xs theme-text-secondary mb-1">Bottom</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingBottom || selectedElement.style?.paddingY || 0}
                          onChange={(e) => handleStyleUpdate('paddingBottom', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                          min="0"
                          step="1"
                          disabled={selectedElement.style?.samePadding || false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                {/* Borders */}
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Borders</h3>
                  
                  {/* Border Preview Box */}
                  <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${selectedElement.style?.borderTopWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderTopStyle: selectedElement.style?.borderStyle || 'solid',
                        borderTopColor: selectedElement.style?.borderColor || '#000000',
                        borderRightWidth: `${selectedElement.style?.borderRightWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderRightStyle: selectedElement.style?.borderStyle || 'solid',
                        borderRightColor: selectedElement.style?.borderColor || '#000000',
                        borderBottomWidth: `${selectedElement.style?.borderBottomWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderBottomStyle: selectedElement.style?.borderStyle || 'solid',
                        borderBottomColor: selectedElement.style?.borderColor || '#000000',
                        borderLeftWidth: `${selectedElement.style?.borderLeftWidth ?? selectedElement.style?.borderWidth ?? 0}px`,
                        borderLeftStyle: selectedElement.style?.borderStyle || 'solid',
                        borderLeftColor: selectedElement.style?.borderColor || '#000000',
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs theme-text-secondary w-20">Pen Color:</label>
                      <input
                        type="color"
                        value={selectedElement.style?.borderColor || '#000000'}
                        onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                        className="w-8 h-6 border theme-border rounded cursor-pointer"
                      />
                      <span className="text-xs theme-text-secondary font-mono">
                        {selectedElement.style?.borderColor || '#000000'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs theme-text-secondary w-20">Pen Style:</label>
                      <div className="flex gap-1 flex-1">
                        {[
                          { value: 'solid', label: 'Solid' },
                          { value: 'dashed', label: 'Dashed' },
                          { value: 'dotted', label: 'Dotted' }
                        ].map((style) => (
                          <button
                            key={style.value}
                            onClick={() => handleStyleUpdate('borderStyle', style.value)}
                            className={`flex-1 px-2 py-2 text-xs rounded border-2 transition-all ${
                              (selectedElement.style?.borderStyle || 'solid') === style.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            title={style.label}
                          >
                            <div 
                              className="h-0 mx-auto w-full"
                              style={{ 
                                borderTopWidth: '2px',
                                borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                                borderTopColor: (selectedElement.style?.borderStyle || 'solid') === style.value ? '#8b5cf6' : '#666'
                              }}
                            />
                            <span className={`mt-1 block text-[10px] ${
                              (selectedElement.style?.borderStyle || 'solid') === style.value
                                ? 'text-primary-600 font-medium'
                                : 'text-gray-500'
                            }`}>
                              {style.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs theme-text-secondary w-20">Pen Width:</label>
                      <input
                        type="number"
                        value={selectedElement.style?.borderWidth ?? 0}
                        onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        max="10"
                        step="0.5"
                      />
                    </div>
                    
                    {/* Default border styles */}
                    <div className="pt-2">
                      <label className="block text-xs theme-text-secondary mb-2">Default borders styles:</label>
                      {(() => {
                        const bw = selectedElement.style?.borderWidth ?? 0
                        const top = selectedElement.style?.borderTopWidth ?? bw
                        const right = selectedElement.style?.borderRightWidth ?? bw
                        const bottom = selectedElement.style?.borderBottomWidth ?? bw
                        const left = selectedElement.style?.borderLeftWidth ?? bw
                        const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                        const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                        const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                        const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                        return (
                      <div className="flex gap-2">
                        {/* All borders */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="All borders"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* No borders */}
                        <button
                          onClick={() => {
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="No borders"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-400' : 'border-gray-300'}`}></div>
                        </button>
                        
                        {/* Top and bottom */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Top and bottom borders"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* Left and right */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 0
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Left and right borders"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                      </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                {/* Corner Radius */}
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Corner Radius</h3>
                  <div className="flex items-center gap-3">
                    <label className="text-xs theme-text-secondary w-20">Radius:</label>
                    <input
                      type="number"
                      value={selectedElement.style?.cornerRadius || 0}
                      onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                      className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                      step="1"
                    />
                    <span className="text-xs theme-text-muted">px</span>
                  </div>
                </div>
              </>
            )}

            {/* TEXT FIELD TAB */}
            {activeTab === 'textfield' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Content</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Text</label>
              <textarea
                value={selectedElement.value || ''}
                onChange={(e) => handleUpdate('value', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>

                    
                    {selectedElement.type === 'text' && (
            <div>
                      <label className="block text-xs theme-text-secondary mb-1">Data Binding</label>
              <input
                type="text"
                value={selectedElement.dataBinding || ''}
                onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                placeholder="e.g., user.name"
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded font-mono bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
                    )}
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                {/* Font Section - Jasper Style */}
            <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Font</h3>
                  <div className="space-y-3">
                    {/* Font Family + Size in one line */}
                    <div className="flex items-center gap-1">
              <select
                value={selectedElement.style?.fontFamily || 'Helvetica'}
                onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Helvetica">Helvetica</option>
                        <option value="Helvetica-Bold">Helvetica Bold</option>
                        <option value="Times">Times New Roman</option>
                        <option value="Courier">Courier New</option>
              </select>
                      
              <input
                type="number"
                value={selectedElement.style?.fontSize || 12}
                onChange={(e) => handleStyleUpdate('fontSize', parseFloat(e.target.value))}
                        className="w-11 px-1.5 py-1.5 text-xs text-center border theme-border rounded bg-white text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="6"
                        max="72"
                      />
                      
                      <button
                        onClick={() => {
                          const currentSize = selectedElement.style?.fontSize || 12
                          handleStyleUpdate('fontSize', Math.max(6, currentSize - 1))
                        }}
                        className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                        title="Decrease size"
                      >
                        A-
                      </button>
                      <button
                        onClick={() => {
                          const currentSize = selectedElement.style?.fontSize || 12
                          handleStyleUpdate('fontSize', Math.min(72, currentSize + 1))
                        }}
                        className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                        title="Increase size"
                      >
                        A+
                      </button>
            </div>

                    {/* Style Buttons - B I U S */}
                    <div className="flex gap-1">
                <button
                  onClick={() => {
                    const currentWeight = selectedElement.style?.fontWeight || 'normal'
                    handleStyleUpdate('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold')
                  }}
                        className={`w-10 h-10 text-sm font-bold border rounded transition ${
                    selectedElement.style?.fontWeight === 'bold'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                        title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => {
                    const currentStyle = selectedElement.style?.fontStyle || 'normal'
                    handleStyleUpdate('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic')
                  }}
                        className={`w-10 h-10 text-sm italic border rounded transition ${
                    selectedElement.style?.fontStyle === 'italic'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                        title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => {
                    const currentDecoration = selectedElement.style?.textDecoration || 'none'
                    handleStyleUpdate('textDecoration', currentDecoration === 'underline' ? 'none' : 'underline')
                  }}
                        className={`w-10 h-10 text-sm underline border rounded transition ${
                    selectedElement.style?.textDecoration === 'underline'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                        title="Underline"
                >
                  U
                </button>
                      <button
                        onClick={() => {
                          const currentDecoration = selectedElement.style?.textDecoration || 'none'
                          handleStyleUpdate('textDecoration', currentDecoration === 'line-through' ? 'none' : 'line-through')
                        }}
                        className={`w-10 h-10 text-sm line-through border rounded transition ${
                          selectedElement.style?.textDecoration === 'line-through'
                            ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                            : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                        title="Strikethrough"
                      >
                        S
                </button>
              </div>
            </div>
                </div>

                <div className="border-t theme-border my-3"></div>

            <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Alignment</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Horizontal</label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStyleUpdate('alignment', 'left')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    (selectedElement.style?.alignment || 'left') === 'left'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Align left"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="2" y="7" width="8" height="2" />
                    <rect x="2" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'center')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'center'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Center"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="4" y="7" width="8" height="2" />
                    <rect x="3" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'right')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'right'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Align right"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="6" y="7" width="8" height="2" />
                    <rect x="4" y="11" width="10" height="2" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('alignment', 'justify')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.alignment === 'justify'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Justify"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="2" />
                    <rect x="2" y="7" width="12" height="2" />
                    <rect x="2" y="11" width="12" height="2" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
                      <label className="block text-xs theme-text-secondary mb-1">Vertical</label>
              <div className="flex gap-1">
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'top')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.verticalAlignment === 'top'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Top"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="2" width="12" height="2" />
                    <rect x="5" y="6" width="6" height="1.5" />
                    <rect x="5" y="9" width="6" height="1.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'center')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    (selectedElement.style?.verticalAlignment || 'center') === 'center'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Center vertical"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="5" y="3" width="6" height="1.5" />
                    <rect x="2" y="7" width="12" height="2" />
                    <rect x="5" y="11.5" width="6" height="1.5" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStyleUpdate('verticalAlignment', 'bottom')}
                  className={`w-10 h-10 flex items-center justify-center border rounded transition ${
                    selectedElement.style?.verticalAlignment === 'bottom'
                              ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                      : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Bottom"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="5" y="4.5" width="6" height="1.5" />
                    <rect x="5" y="7.5" width="6" height="1.5" />
                    <rect x="2" y="12" width="12" height="2" />
                  </svg>
                </button>
              </div>
            </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Multiline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs theme-text-secondary">Line wrap</label>
                <input
                  type="checkbox"
                  id="multiline"
                  checked={selectedElement.style?.multiline || false}
                  onChange={(e) => handleStyleUpdate('multiline', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              {selectedElement.style?.multiline && (
                <>
                <div>
                    <label className="block text-xs theme-text-secondary mb-1">
                    1st Line Indent (pt)
                  </label>
                  <input
                    type="number"
                    value={selectedElement.style?.firstLineIndent || 0}
                    onChange={(e) => handleStyleUpdate('firstLineIndent', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="5"
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                  
                  <div>
                    <label className="block text-xs theme-text-secondary mb-1">
                      Line Height
                    </label>
                    <input
                      type="number"
                      value={selectedElement.style?.lineHeight ?? ''}
                      onChange={(e) => handleStyleUpdate('lineHeight', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="1.0 = no extra space"
                      min="0.5"
                      max="3"
                      step="0.1"
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-[10px] theme-text-muted mt-1">Ex: 1.0 (no space), 1.2, 1.5</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs theme-text-secondary mb-1">
                      Overflow (text height)
                    </label>
                    <select
                      value={selectedElement.style?.overflow || 'visible'}
                      onChange={(e) => handleStyleUpdate('overflow', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="visible">visible - Content can exceed height</option>
                      <option value="hidden">hidden - Clips content at height</option>
                      <option value="auto">auto - Height adjusts to content</option>
                    </select>
                    <p className="text-[10px] theme-text-muted mt-1">
                      {selectedElement.style?.overflow === 'auto' 
                        ? '✓ Relative elements will be positioned after the actual content'
                        : selectedElement.style?.overflow === 'hidden'
                        ? '✓ Text will be clipped if it exceeds the defined height'
                        : 'Default: content can exceed the defined height'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold theme-text mb-2">
                      Internal Padding (pt)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] theme-text-muted mb-1">Top</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingTop || 0}
                          onChange={(e) => handleStyleUpdate('paddingTop', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1"
                          className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] theme-text-muted mb-1">Bottom</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingBottom || 0}
                          onChange={(e) => handleStyleUpdate('paddingBottom', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1"
                          className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] theme-text-muted mb-1">Left</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingLeft || 0}
                          onChange={(e) => handleStyleUpdate('paddingLeft', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1"
                          className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] theme-text-muted mb-1">Right</label>
                        <input
                          type="number"
                          value={selectedElement.style?.paddingRight || 0}
                          onChange={(e) => handleStyleUpdate('paddingRight', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="1"
                          className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
                  </div>
            </div>
              </>
            )}
          </>
        )}

        {/* LINE ELEMENT TABS */}
        {selectedElement.type === 'line' && 'x2' in selectedElement && 'y2' in selectedElement && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">ID</label>
                      <input
                        type="text"
                        value={selectedElement.id}
                        disabled
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900"
                      />
                    </div>
                    <div className="border-t theme-border my-3"></div>
                  </>
                )}

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Print Condition</h3>
                  <input
                    type="text"
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* LINE TAB */}
            {activeTab === 'line' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Coordinates</h3>
              <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                  <div>
                        <label className="block text-xs theme-text-secondary mb-1">X Start</label>
                    <input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => handleUpdate('x', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                        <label className="block text-xs theme-text-secondary mb-1">Y Start</label>
                    <input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => handleUpdate('y', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                    <div className="grid grid-cols-2 gap-3">
                  <div>
                        <label className="block text-xs theme-text-secondary mb-1">X End</label>
                    <input
                      type="number"
                      value={selectedElement.x2}
                      onChange={(e) => handleUpdate('x2', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                        <label className="block text-xs theme-text-secondary mb-1">Y End</label>
                    <input
                      type="number"
                      value={selectedElement.y2}
                      onChange={(e) => handleUpdate('y2', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Style</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs theme-text-secondary">Line Color</label>
                  <input
                    type="color"
                    value={selectedElement.style?.strokeColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('strokeColor', e.target.value)}
                        className="w-10 h-8 border theme-border rounded cursor-pointer"
                  />
                </div>

                <div>
                      <label className="block text-xs theme-text-secondary mb-1">Thickness (pt)</label>
                  <input
                    type="number"
                    value={selectedElement.style?.strokeWidth ?? 1}
                    onChange={(e) => handleStyleUpdate('strokeWidth', parseFloat(e.target.value) || 0.5)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0.5"
                    max="20"
                    step="0.5"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Min: 0.5pt, Max: 20pt
                  </p>
                </div>
              </div>
            </div>
              </>
            )}
          </>
        )}

        {/* RECTANGLE ELEMENT TABS */}
        {selectedElement.type === 'rectangle' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
          <>
            <div>
                      <label className="block text-xs font-medium theme-text mb-1">ID</label>
                      <input
                        type="text"
                        value={selectedElement.id}
                        disabled
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900"
                      />
                    </div>
                    <div className="border-t theme-border my-3"></div>
                  </>
                )}

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">X</label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => handleUpdate('x', parseFloat(e.target.value))}
                        disabled={selectedElement.width === '100%'}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      />
                      {selectedElement.width === '100%' && (
                        <p className="text-xs theme-text-muted mt-1">Fixed at 0 (width 100%)</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Y</label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => handleUpdate('y', parseFloat(e.target.value))}
                        disabled={selectedElement.height === '100%'}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      />
                      {selectedElement.height === '100%' && (
                        <p className="text-xs theme-text-muted mt-1">Fixed at 0 (100% height)</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Modo de Posicionamento */}
                  <div className="mt-3">
                    <label className="block text-xs theme-text-secondary mb-1">Position Mode</label>
                    <select
                      value={selectedElement.positionMode || 'ABSOLUTE'}
                      onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="ABSOLUTE">Absoluto (fixo no canvas)</option>
                      <option value="RELATIVE">Relative (follows content above)</option>
                    </select>
                    {selectedElement.positionMode === 'RELATIVE' && (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          ↳ Positioned after the previous element in PDF
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="block text-xs theme-text-secondary">Offset Y (PDF):</label>
                          <input
                            type="number"
                            value={selectedElement.relativeOffsetY ?? 10}
                            onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-[10px] theme-text-muted">px</span>
                        </div>
                        <p className="text-[10px] theme-text-muted mt-1">
                          Space between the previous element and this one
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Size</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">W (Width)</label>
                      <input
                        type="number"
                        value={typeof selectedElement.width === 'string' ? '' : selectedElement.width}
                        onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
                        disabled={selectedElement.width === '100%'}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedElement.width === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Marcar: definir width=100% e x=0
                              updateSelectedElements({ width: '100%', x: 0 })
                            } else {
                              
                              updateSelectedElements({ width: 100 })
                            }
                          }}
                          className="mr-2 w-3.5 h-3.5 text-blue-600 theme-border rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs theme-text-secondary">100% Width</span>
              </label>
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">H (Height)</label>
                      <input
                        type="number"
                        value={typeof selectedElement.height === 'string' ? '' : selectedElement.height}
                        onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
                        disabled={selectedElement.height === '100%'}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                      />
                      <label className="flex items-center mt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedElement.height === '100%'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Marcar: definir height=100% e y=0
                              updateSelectedElements({ height: '100%', y: 0 })
                            } else {
                              
                              updateSelectedElements({ height: 100 })
                            }
                          }}
                          className="mr-2 w-3.5 h-3.5 text-blue-600 theme-border rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs theme-text-secondary">100% Height</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Color</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs theme-text-secondary">Fill</label>
              <input
                type="color"
                value={selectedElement.style?.fillColor || '#4a90e2'}
                onChange={(e) => handleStyleUpdate('fillColor', e.target.value)}
                        disabled={!selectedElement.style?.fillColor}
                        className="w-10 h-8 border theme-border rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!selectedElement.style?.fillColor}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Marcar: remover preenchimento (transparente)
                            handleStyleUpdate('fillColor', null)
                          } else {
                            
                            handleStyleUpdate('fillColor', '#4a90e2')
                          }
                        }}
                        className="mr-2 w-3.5 h-3.5 text-blue-600 theme-border rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs theme-text-secondary">Transparent</span>
              </label>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Print Condition</h3>
                  <input
                    type="text"
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BORDERS TAB */}
            {activeTab === 'borders' && (
              <>
                {/* Borders */}
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Borders</h3>
                  
                  {/* Border Preview Box */}
                  <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                    <div 
                      className="w-32 h-32"
                      style={{
                        backgroundColor: selectedElement.style?.fillColor || '#4a90e2',
                        borderTopWidth: `${selectedElement.style?.borderTopWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderTopStyle: selectedElement.style?.borderStyle || 'solid',
                        borderTopColor: selectedElement.style?.borderColor || '#000000',
                        borderRightWidth: `${selectedElement.style?.borderRightWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderRightStyle: selectedElement.style?.borderStyle || 'solid',
                        borderRightColor: selectedElement.style?.borderColor || '#000000',
                        borderBottomWidth: `${selectedElement.style?.borderBottomWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderBottomStyle: selectedElement.style?.borderStyle || 'solid',
                        borderBottomColor: selectedElement.style?.borderColor || '#000000',
                        borderLeftWidth: `${selectedElement.style?.borderLeftWidth ?? selectedElement.style?.borderWidth ?? 1}px`,
                        borderLeftStyle: selectedElement.style?.borderStyle || 'solid',
                        borderLeftColor: selectedElement.style?.borderColor || '#000000',
                        borderRadius: `${selectedElement.style?.cornerRadius || 0}px`,
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs theme-text-secondary w-20">Pen Color:</label>
                  <input
                    type="color"
                    value={selectedElement.style?.borderColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                        className="w-8 h-6 border theme-border rounded cursor-pointer"
                  />
                      <span className="text-xs theme-text-secondary font-mono">
                        {selectedElement.style?.borderColor || '#000000'}
                      </span>
                </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs theme-text-secondary w-20">Pen Style:</label>
                      <div className="flex gap-1 flex-1">
                        {[
                          { value: 'solid', label: 'Solid' },
                          { value: 'dashed', label: 'Dashed' },
                          { value: 'dotted', label: 'Dotted' }
                        ].map((style) => (
                          <button
                            key={style.value}
                            onClick={() => handleStyleUpdate('borderStyle', style.value)}
                            className={`flex-1 px-2 py-2 text-xs rounded border-2 transition-all ${
                              (selectedElement.style?.borderStyle || 'solid') === style.value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            title={style.label}
                          >
                            <div 
                              className="h-0 mx-auto w-full"
                              style={{ 
                                borderTopWidth: '2px',
                                borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                                borderTopColor: (selectedElement.style?.borderStyle || 'solid') === style.value ? '#8b5cf6' : '#666'
                              }}
                            />
                            <span className={`mt-1 block text-[10px] ${
                              (selectedElement.style?.borderStyle || 'solid') === style.value
                                ? 'text-primary-600 font-medium'
                                : 'text-gray-500'
                            }`}>
                              {style.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs theme-text-secondary w-20">Pen Width:</label>
                  <input
                    type="number"
                    value={selectedElement.style?.borderWidth ?? 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                        max="10"
                    step="0.5"
                  />
                </div>
                    
                    {/* Default border styles */}
                    <div className="pt-2">
                      <label className="block text-xs theme-text-secondary mb-2">Default borders styles:</label>
                      {(() => {
                        const bw = selectedElement.style?.borderWidth ?? 1
                        const top = selectedElement.style?.borderTopWidth ?? bw
                        const right = selectedElement.style?.borderRightWidth ?? bw
                        const bottom = selectedElement.style?.borderBottomWidth ?? bw
                        const left = selectedElement.style?.borderLeftWidth ?? bw
                        const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                        const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                        const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                        const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                        return (
                      <div className="flex gap-2">
                        {/* All borders */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: width,
                                  borderBottomWidth: width,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="All borders"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* No borders */}
                        <button
                          onClick={() => {
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: 0,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="No borders"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-400' : 'border-gray-300'}`}></div>
                        </button>
                        
                        {/* Top and bottom */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: width,
                                  borderRightWidth: 0,
                                  borderBottomWidth: width,
                                  borderLeftWidth: 0,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Top and bottom borders"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        {/* Left and right */}
                        <button
                          onClick={() => {
                            const width = selectedElement.style?.borderWidth || 1
                            if (isMultiSelection) {
                              updateSelectedElements({
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              })
                            } else {
                              updateElement(selectedElement.id, {
                                style: {
                                  ...selectedElement.style,
                                  borderTopWidth: 0,
                                  borderRightWidth: width,
                                  borderBottomWidth: 0,
                                  borderLeftWidth: width,
                                }
                              }, selectedElementLocation)
                            }
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Left and right borders"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
              </div>
                        )
                      })()}
            </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                {/* Corner Radius */}
            <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Corner Radius</h3>
                  <div className="flex items-center gap-3">
                    <label className="text-xs theme-text-secondary w-20">Radius:</label>
              <input
                type="number"
                value={selectedElement.style?.cornerRadius || 0}
                onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                      className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="0"
                step="1"
              />
                    <span className="text-xs theme-text-muted">px</span>
                  </div>
            </div>
              </>
            )}
          </>
        )}

        {/* IMAGE ELEMENT TABS */}
        {selectedElement.type === 'image' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
          <>
            <div>
                      <label className="block text-xs font-medium theme-text mb-1">ID</label>
                      <input
                        type="text"
                        value={selectedElement.id}
                        disabled
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900"
                      />
                    </div>
                    <div className="border-t theme-border my-3"></div>
                  </>
                )}

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">X</label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => handleUpdate('x', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Y</label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => handleUpdate('y', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Size</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">W (Width)</label>
                      <input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">H (Height)</label>
                      <input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Image Fit</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Redimensionamento (fit)</label>
                      <select
                        value={selectedElement.fit || 'contain'}
                        onChange={(e) => handleUpdate('fit', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="contain">Contain (fits inside, keeps aspect ratio)</option>
                        <option value="cover">Cover (cobre tudo, pode cortar)</option>
                        <option value="fill">Fill (estica, pode distorcer)</option>
                        <option value="scale-down">Scale Down (only shrinks if larger)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Alignment</label>
                      <select
                        value={selectedElement.alignment || 'center'}
                        onChange={(e) => handleUpdate('alignment', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Print Condition</h3>
                  <input
                    type="text"
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* IMAGE TAB */}
            {activeTab === 'image' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Image Source</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">URL ou Caminho</label>
              <input
                type="text"
                value={selectedElement.source || ''}
                onChange={(e) => handleUpdate('source', e.target.value)}
                        placeholder="https://... ou /path/to/image.png"
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded font-mono bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
                      <label className="block text-xs theme-text-secondary mb-1">Data Binding</label>
              <input
                type="text"
                value={selectedElement.dataBinding || ''}
                onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                placeholder="e.g., company.logo"
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded font-mono bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
                      <p className="text-xs theme-text-muted mt-1">For dynamic images</p>
                    </div>
                  </div>
            </div>
              </>
            )}
          </>
        )}

        {selectedElement.type === 'table' && (
          <TableEditor 
            element={selectedElement}
            onUpdate={handleUpdate}
            onStyleUpdate={handleStyleUpdate}
            activeTab={activeTab as 'general' | 'columns' | 'styles'}
          />
        )}

        {/* BARCODE ELEMENT TABS */}
        {selectedElement.type === 'barcode' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">ID</label>
                      <input
                        type="text"
                        value={selectedElement.id}
                        disabled
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900"
                      />
                    </div>
                    <div className="border-t theme-border my-3"></div>
                  </>
                )}

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">X</label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => handleUpdate('x', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Y</label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => handleUpdate('y', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  {/* Modo de Posicionamento - Barcode */}
                  <div className="mt-3">
                    <label className="block text-xs theme-text-secondary mb-1">Position Mode</label>
                    <select
                      value={selectedElement.positionMode || 'ABSOLUTE'}
                      onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="ABSOLUTE">Absoluto (fixo no canvas)</option>
                      <option value="RELATIVE">Relative (follows content above)</option>
                    </select>
                    {selectedElement.positionMode === 'RELATIVE' && (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          ↳ Positioned after the previous element in PDF
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="block text-xs theme-text-secondary">Offset Y (PDF):</label>
                          <input
                            type="number"
                            value={selectedElement.relativeOffsetY ?? 10}
                            onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-[10px] theme-text-muted">px</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Size</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">W (Width)</label>
                      <input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">H (Height)</label>
                      <input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Print Condition</h3>
                  <input
                    type="text"
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: invoice.total > 1000"
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                  
                  {/* Exemplos de Condicionais */}
                  <div className="mt-2 p-2 theme-bg-tertiary rounded border theme-border">
                    <p className="text-xs font-medium theme-text mb-1">Examples:</p>
                    <div className="space-y-0.5 text-xs theme-text-secondary font-mono">
                      <div>• invoice.total &gt; 1000</div>
                      <div>• customer.type == 'VIP'</div>
                      <div>• status != 'cancelled'</div>
                      <div>• items.length &gt; 0</div>
                      <div>• status in ['pending', 'approved']</div>
                      <div>• total &gt;= 100 && total &lt; 500</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BARCODE TAB */}
            {activeTab === 'barcode' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Code Type</h3>
                  <select
                    value={selectedElement.barcodeType || 'qrcode'}
                    onChange={(e) => handleUpdate('barcodeType', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="qrcode">QR Code</option>
                    <option value="barcode">Barcode</option>
                  </select>
                </div>
                
                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Data</h3>
                  <div>
                    <label className="block text-xs theme-text-secondary mb-1">Data Binding</label>
                  <input
                    type="text"
                    value={selectedElement.dataBinding || ''}
                    onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                    placeholder="Ex: invoice.qrCode, customer.cpf"
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded font-mono bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                      Field to be encoded
                    </p>
                  </div>
                </div>
                
                {/* Error Correction (apenas QR Code) */}
                {selectedElement.barcodeType === 'qrcode' && (
                  <>
                    <div className="border-t theme-border my-3"></div>
                  <div>
                      <h3 className="text-xs font-semibold theme-text mb-2">QR Code Quality</h3>
                      <div>
                        <label className="block text-xs theme-text-secondary mb-1">
                          Error Correction
                    </label>
                    <select
                      value={selectedElement.style?.errorCorrection || 'M'}
                      onChange={(e) => handleStyleUpdate('errorCorrection', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="L">Low (~7%)</option>
                      <option value="M">Medium (~15%)</option>
                      <option value="Q">Quartile (~25%)</option>
                      <option value="H">High (~30%)</option>
                    </select>
                    <p className="text-xs theme-text-muted mt-1">
                          Higher = more damage resistant
                    </p>
                  </div>
              </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* LOOP ELEMENT TABS */}
        {selectedElement.type === 'loop' && (
          <>
            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <>
                {!isMultiSelection && (
                  <>
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">ID</label>
                      <input
                        type="text"
                        value={selectedElement.id}
                        disabled
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900"
                      />
                    </div>
                    <div className="border-t theme-border my-3"></div>
                  </>
                )}

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Location</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">X</label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => handleUpdate('x', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Y</label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => handleUpdate('y', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  {/* Modo de Posicionamento - Loop */}
                  <div className="mt-3">
                    <label className="block text-xs theme-text-secondary mb-1">Position Mode</label>
                    <select
                      value={selectedElement.positionMode || 'ABSOLUTE'}
                      onChange={(e) => handleUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="ABSOLUTE">Absoluto (fixo no canvas)</option>
                      <option value="RELATIVE">Relative (follows content above)</option>
                    </select>
                    {selectedElement.positionMode === 'RELATIVE' && (
                      <>
                        <p className="text-[10px] text-purple-500 mt-1 mb-2">
                          ↳ Positioned after the previous element in PDF
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="block text-xs theme-text-secondary">Offset Y (PDF):</label>
                          <input
                            type="number"
                            value={selectedElement.relativeOffsetY ?? 10}
                            onChange={(e) => handleUpdate('relativeOffsetY', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-[10px] theme-text-muted">px</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Size</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">W (Width)</label>
                      <input
                        type="number"
                        value={selectedElement.width}
                        onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">H (Height)</label>
                      <input
                        type="number"
                        value={selectedElement.height}
                        onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Print Condition</h3>
                  <input
                    type="text"
                    value={selectedElement.printCondition || ''}
                    onChange={(e) => handleUpdate('printCondition', e.target.value || null)}
                    placeholder="Ex: items.length > 0"
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Leave empty to always print
                  </p>
                </div>
              </>
            )}

            {/* LOOP TAB */}
            {activeTab === 'loop' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Loop Configuration</h3>
                  
                  <div className="mb-3">
                    <label className="block text-xs theme-text-secondary mb-1">Data Binding (Lista)</label>
                    <input
                      type="text"
                      value={selectedElement.dataBinding || ''}
                      onChange={(e) => handleUpdate('dataBinding', e.target.value)}
                      placeholder="Ex: invoice.items"
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded font-mono bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs theme-text-muted mt-1">
                      Path to the list in the data JSON
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs theme-text-secondary mb-1">Item Spacing (px)</label>
                    <input
                      type="number"
                      value={selectedElement.itemSpacing || 20}
                      onChange={(e) => handleUpdate('itemSpacing', parseFloat(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="text-xs theme-text-muted mt-1">
                      Vertical space between each repetition
                    </p>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Add Elements</h3>
                  
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { type: 'text', label: 'Text', icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 7h16M9 20v-13M15 20v-13" />
                        </svg>
                      )},
                      { type: 'static_text', label: 'Static', icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 7h16M9 20v-13M15 20v-13" />
                          <circle cx="18" cy="18" r="3" fill="currentColor" stroke="none" />
                        </svg>
                      )},
                      { type: 'image', label: 'Image', icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      )},
                      { type: 'rectangle', label: 'Rectangle', icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      )},
                      { type: 'line', label: 'Line', icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 19l14-14" />
                        </svg>
                      )},
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => {
                          const id = `${item.type}-${Date.now()}`
                          let newElement: any = { type: item.type, id, x: 0, y: 0 }
                          
                          if (item.type === 'text' || item.type === 'static_text') {
                            newElement = {
                              ...newElement,
                              value: item.type === 'text' ? 'field' : 'Text',
                              width: 150,
                              height: 20,
                              style: { fontSize: 10, fontFamily: 'Helvetica', color: '#000000' },
                            }
                          } else if (item.type === 'image') {
                            newElement = { ...newElement, width: 50, height: 50, source: '' }
                          } else if (item.type === 'rectangle') {
                            newElement = { ...newElement, width: 100, height: 20, style: { fillColor: '#e0e0e0' } }
                          } else if (item.type === 'line') {
                            newElement = { ...newElement, x2: 100, y2: 0, style: { strokeColor: '#000000', strokeWidth: 1 } }
                          }
                          
                          addElementToLoop(selectedElement.id, newElement, selectedElementLocation)
                        }}
                        className="flex items-center gap-2 px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-400 transition-all text-gray-700 hover:text-primary-600"
                      >
                        <span className="text-primary-500">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Lista de elementos filhos */}
                  {(selectedElement.elements || []).length > 0 && (
                    <>
                      <h3 className="text-xs font-semibold theme-text mb-2">
                        Elements ({(selectedElement.elements || []).length})
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {(selectedElement.elements || []).map((child: any, idx: number) => (
                          <LoopChildEditor
                            key={child.id}
                            child={child}
                            index={idx}
                            loopId={selectedElement.id}
                            location={selectedElementLocation}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Dica */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">💡 Usage tip:</p>
                    <p className="text-xs text-blue-600">
                      Use only the property name to access item data.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Ex: <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">name</code>, <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">value</code>, <code className="px-1 py-0.5 bg-blue-100 rounded font-mono">price</code>
                    </p>
                  </div>
                </div>

                <div className="border-t theme-border my-3"></div>

                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Usage Example</h3>
                  <div className="p-2 theme-bg-tertiary rounded border theme-border text-xs font-mono theme-text-secondary">
                    <div className="mb-1">Data Binding: <span className="text-primary-600">invoice.items</span></div>
                    <div className="mb-1">Elements use only the property name:</div>
                    <div className="pl-2 text-[10px]">
                      <div>• name → item name</div>
                      <div>• price → price</div>
                      <div>• qty → quantity</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}


interface TableEditorProps {
  element: any
  onUpdate: (field: string, value: any) => void
  onStyleUpdate: (field: string, value: any) => void
  activeTab: 'general' | 'columns' | 'styles'
}

function TableEditor({ element, onUpdate, onStyleUpdate, activeTab }: TableEditorProps) {
  // Helper para calcular valores de border dinamicamente baseado em borderType
  const getHeaderBorderValues = () => {
    const borderWidth = element.style?.headerBorderWidth ?? element.style?.borderWidth ?? 1
    const borderType = element.style?.headerBorderType
    
    if (!borderType || borderType === 'none') {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
    
    if (borderType === 'row' || borderType === 'all') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'columns') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'top-bottom') {
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    }
    
    if (borderType === 'left-right') {
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    }
    
    return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }
  
  const getCellBorderValues = () => {
    const borderWidth = element.style?.borderWidth ?? 1
    const borderType = element.style?.cellBorderType
    
    if (!borderType || borderType === 'none') {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
    
    if (borderType === 'row' || borderType === 'all') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'cells') {
      return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
    }
    
    if (borderType === 'top-bottom') {
      return { top: borderWidth, right: 0, bottom: borderWidth, left: 0 }
    }
    
    if (borderType === 'left-right') {
      return { top: 0, right: borderWidth, bottom: 0, left: borderWidth }
    }
    
    return { top: borderWidth, right: borderWidth, bottom: borderWidth, left: borderWidth }
  }

  
  const updateColumn = (index: number, field: string, value: any) => {
    if (!element.columns || !element.columns[index]) return
    
    
    const newColumns = JSON.parse(JSON.stringify(element.columns))
    
    
    newColumns[index][field] = value
    
    // Chamar onUpdate com o novo array
    onUpdate('columns', newColumns)
  }

  return (
    <>
      {/* Tab Content */}
      <div>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium theme-text mb-1">
                  Position X (pt)
                </label>
                <input
                  type="number"
                  value={element.x || 0}
                  onChange={(e) => onUpdate('x', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium theme-text mb-1">
                  Position Y (pt)
                </label>
                <input
                  type="number"
                  value={element.y || 0}
                  onChange={(e) => onUpdate('y', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Modo de Posicionamento */}
            <div>
              <label className="block text-xs font-medium theme-text mb-1">
                Position Mode
              </label>
              <select
                value={element.positionMode || 'ABSOLUTE'}
                onChange={(e) => onUpdate('positionMode', e.target.value === 'ABSOLUTE' ? null : e.target.value)}
                className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
              >
                <option value="ABSOLUTE">Absolute (fixed on canvas)</option>
                <option value="RELATIVE">Relative (follows content above)</option>
              </select>
              {element.positionMode === 'RELATIVE' && (
                <>
                  <p className="text-[10px] text-purple-500 mt-1 mb-2">
                    ↳ Positioned after the previous element in PDF
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="block text-xs theme-text-secondary">Offset Y (PDF):</label>
                    <input
                      type="number"
                      value={element.relativeOffsetY ?? 10}
                      onChange={(e) => onUpdate('relativeOffsetY', parseFloat(e.target.value))}
                      className="w-20 px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-[10px] theme-text-muted">px</span>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium theme-text mb-1">
                Data Binding
              </label>
              <input
                type="text"
                value={element.dataBinding || ''}
                onChange={(e) => onUpdate('dataBinding', e.target.value)}
                placeholder="e.g., invoice.items"
                className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs theme-text-muted mt-1">
                Data field containing the rows array
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium theme-text mb-1">
                Table Width (pt)
              </label>
              <input
                type="number"
                value={typeof element.width === 'number' ? element.width : 400}
                onChange={(e) => onUpdate('width', parseFloat(e.target.value))}
                disabled={element.width === '100%'}
                className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="table-width-100"
                  checked={element.width === '100%'}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate('width', '100%')
                      onUpdate('x', 0)
                    } else {
                      onUpdate('width', 400)
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor="table-width-100" className="text-xs theme-text">
                  100% Width (fit to container)
                </label>
              </div>
              {element.width === '100%' && (
                <p className="text-xs theme-text-muted mt-1">
                  X will be fixed at 0 when width is 100%
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium theme-text mb-1">
                Print Condition
              </label>
              <input
                type="text"
                value={element.printCondition || ''}
                onChange={(e) => onUpdate('printCondition', e.target.value || null)}
                placeholder="Ex: items.length > 0"
                className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs theme-text-muted mt-1">
                Leave empty to always print
              </p>
            </div>
          </div>
        )}

        {/* Columns Tab */}
        {activeTab === 'columns' && (
          <div className="flex flex-col h-full -mt-4 -mx-4">
            <div className="sticky top-[-16px] bg-white z-10 border-b theme-border px-4 pt-4 pb-4 shadow-sm">
              <div className="flex items-center justify-between">
              <label className="block text-xs font-medium theme-text">
                Columns ({(element.columns || []).length})
              </label>
              <button
                onClick={() => {
                  const columns = element.columns || []
                  const newColumn = {
                    header: `Column ${columns.length + 1}`,
                    field: `field${columns.length + 1}`,
                    width: 100,
                      alignment: 'left',
                      verticalAlignment: 'center',
                      headerAlignment: 'left',
                      headerVerticalAlignment: 'center'
                  }
                  onUpdate('columns', [...columns, newColumn])
                }}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-1"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add
              </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
              {(element.columns || []).map((column: any, index: number) => {
                
                const normalizedColumn = {
                  alignment: 'left',
                  verticalAlignment: 'center',
                  headerAlignment: 'left',
                  headerVerticalAlignment: 'center',
                  ...column
                }
                return (
                <div key={index} className="p-3 theme-bg-tertiary rounded-lg border theme-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold theme-text">
                      Column {index + 1}
                    </span>
                    <button
                      onClick={() => {
                        const columns = [...(element.columns || [])]
                        columns.splice(index, 1)
                        onUpdate('columns', columns)
                      }}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                      title="Remove column"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Header */}
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">
                        Header
                      </label>
                      <input
                        type="text"
                        value={normalizedColumn.header || ''}
                        onChange={(e) => updateColumn(index, 'header', e.target.value)}
                        placeholder="Column name"
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Field */}
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">
                        Field
                      </label>
                      <input
                        type="text"
                        value={normalizedColumn.field || ''}
                        onChange={(e) => updateColumn(index, 'field', e.target.value)}
                        placeholder="nome.campo"
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Width */}
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">
                        Width (pt)
                      </label>
                      <input
                        type="number"
                        value={normalizedColumn.width || 100}
                        onChange={(e) => updateColumn(index, 'width', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Alignments */}
                    <div>
                      <label className="block text-xs font-medium theme-text mb-2">
                        Alignment
                      </label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Header Alignment */}
                        <div>
                          <label className="block text-xs theme-text-secondary mb-1.5">Header</label>
                          <div className="flex gap-1">
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'left')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                (normalizedColumn.headerAlignment || 'left') === 'left'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Align left"
                        >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="2" y="7" width="8" height="2" />
                                <rect x="2" y="11" width="10" height="2" />
                              </svg>
                        </button>
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'center')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.headerAlignment === 'center'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Center"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="4" y="7" width="8" height="2" />
                                <rect x="3" y="11" width="10" height="2" />
                              </svg>
                        </button>
                        <button
                              onClick={() => updateColumn(index, 'headerAlignment', 'right')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.headerAlignment === 'right'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                          }`}
                              title="Align right"
                        >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="6" y="7" width="8" height="2" />
                                <rect x="4" y="11" width="10" height="2" />
                              </svg>
                        </button>
                      </div>
                    </div>

                        {/* Content Alignment */}
                        <div>
                          <label className="block text-xs theme-text-secondary mb-1.5">Content</label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'left')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                (normalizedColumn.alignment || 'left') === 'left'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Align left"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="2" y="7" width="8" height="2" />
                                <rect x="2" y="11" width="10" height="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'center')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.alignment === 'center'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Center"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="4" y="7" width="8" height="2" />
                                <rect x="3" y="11" width="10" height="2" />
                              </svg>
                            </button>
                            <button
                              onClick={() => updateColumn(index, 'alignment', 'right')}
                              className={`w-8 h-8 flex items-center justify-center border rounded transition ${
                                normalizedColumn.alignment === 'right'
                                  ? 'bg-primary-100 dark:bg-primary-500/30 border-primary-500 text-primary-700 dark:text-primary-200'
                                  : 'bg-white dark:bg-gray-700 theme-border hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                              }`}
                              title="Align right"
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="2" y="3" width="12" height="2" />
                                <rect x="6" y="7" width="8" height="2" />
                                <rect x="4" y="11" width="10" height="2" />
                              </svg>
                            </button>
                  </div>
                </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}

              {(!element.columns || element.columns.length === 0) && (
                <div className="text-center py-8 px-4 theme-bg-tertiary rounded-lg border-2 border-dashed theme-border">
                  <p className="text-xs theme-text-muted mb-2">No columns defined</p>
                  <p className="text-xs text-gray-400">Clique em "Add" para criar</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            
            <div className="p-4 theme-bg-tertiary border theme-border rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                </svg>
                Header
              </h3>
              
              {/* Cor */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Cor</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs theme-text-secondary mb-1">Background</label>
                    <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={element.style?.headerBackground && element.style?.headerBackground !== 'transparent' ? element.style?.headerBackground : '#f0f0f0'}
                    onChange={(e) => onStyleUpdate('headerBackground', e.target.value)}
                        className="w-10 h-10 border theme-border rounded cursor-pointer"
                        disabled={!element.style?.headerBackground || element.style?.headerBackground === 'transparent'}
                  />
                </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs theme-text-secondary mb-1">Text</label>
                    <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={element.style?.headerColor || '#000000'}
                    onChange={(e) => onStyleUpdate('headerColor', e.target.value)}
                        className="w-10 h-10 border theme-border rounded cursor-pointer"
                  />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="text-xs theme-text-secondary">Transparent Background</label>
                  <input
                    type="checkbox"
                    checked={!element.style?.headerBackground || element.style?.headerBackground === 'transparent'}
                    onChange={(e) => onStyleUpdate('headerBackground', e.target.checked ? 'transparent' : '#f0f0f0')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                </div>

              <div className="border-t theme-border my-3"></div>

              {/* Font */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Font</h4>
                <div className="flex items-center gap-1">
                  <select
                    value={element.style?.headerFontFamily || 'Helvetica'}
                    onChange={(e) => onStyleUpdate('headerFontFamily', e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Helvetica-Bold">Helvetica Bold</option>
                    <option value="Times">Times New Roman</option>
                    <option value="Courier">Courier New</option>
                  </select>
                  
                  <input
                    type="number"
                    min="6"
                    max="72"
                    value={element.style?.headerFontSize || 12}
                    onChange={(e) => onStyleUpdate('headerFontSize', parseFloat(e.target.value))}
                    className="w-11 px-1.5 py-1.5 text-xs text-center border theme-border rounded bg-white text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  
                  <button
                    onClick={() => {
                      const currentSize = element.style?.headerFontSize || 12
                      onStyleUpdate('headerFontSize', Math.max(6, currentSize - 1))
                    }}
                    className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                    title="Decrease size"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => {
                      const currentSize = element.style?.headerFontSize || 12
                      onStyleUpdate('headerFontSize', Math.min(72, currentSize + 1))
                    }}
                    className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                    title="Increase size"
                  >
                    A+
                  </button>
                </div>
                </div>

              <div className="border-t theme-border my-3"></div>

              {/* Paddings do Header */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Paddings</h4>
                <div className="space-y-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="header-same-padding"
                      checked={element.style?.headerSamePadding || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          const value = element.style?.headerPaddingLeft || element.style?.headerPadding || 5
                          onStyleUpdate('headerPaddingLeft', value)
                          onStyleUpdate('headerPaddingRight', value)
                          onStyleUpdate('headerPaddingTop', value)
                          onStyleUpdate('headerPaddingBottom', value)
                          onStyleUpdate('headerPadding', value)
                          onStyleUpdate('headerSamePadding', true)
                        } else {
                          onStyleUpdate('headerSamePadding', false)
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="header-same-padding" className="ml-2 text-xs theme-text">
                      Use the same value for every padding
                  </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Left</label>
                  <input
                    type="number"
                        value={element.style?.headerPaddingLeft || element.style?.headerPadding || 5}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          if (element.style?.headerSamePadding) {
                            onStyleUpdate('headerPaddingLeft', value)
                            onStyleUpdate('headerPaddingRight', value)
                            onStyleUpdate('headerPaddingTop', value)
                            onStyleUpdate('headerPaddingBottom', value)
                            onStyleUpdate('headerPadding', value)
                          } else {
                            onStyleUpdate('headerPaddingLeft', value)
                          }
                        }}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                        step="1"
                  />
                </div>
                <div>
                      <label className="block text-xs theme-text-secondary mb-1">Right</label>
                  <input
                    type="number"
                        value={element.style?.headerPaddingRight || element.style?.headerPadding || 5}
                        onChange={(e) => onStyleUpdate('headerPaddingRight', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    min="0"
                        step="1"
                        disabled={element.style?.headerSamePadding || false}
                      />
                </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                <div>
                      <label className="block text-xs theme-text-secondary mb-1">Top</label>
                      <input
                        type="number"
                        value={element.style?.headerPaddingTop || element.style?.headerPadding || 5}
                        onChange={(e) => onStyleUpdate('headerPaddingTop', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        min="0"
                        step="1"
                        disabled={element.style?.headerSamePadding || false}
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Bottom</label>
                      <input
                        type="number"
                        value={element.style?.headerPaddingBottom || element.style?.headerPadding || 5}
                        onChange={(e) => onStyleUpdate('headerPaddingBottom', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        min="0"
                        step="1"
                        disabled={element.style?.headerSamePadding || false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t theme-border my-3"></div>

              {/* Borders do Header */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Borders</h4>
                
                {/* Border Preview Box */}
                <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${getHeaderBorderValues().top}px`,
                        borderTopStyle: element.style?.borderStyle ?? 'solid',
                        borderTopColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderRightWidth: `${getHeaderBorderValues().right}px`,
                        borderRightStyle: element.style?.borderStyle ?? 'solid',
                        borderRightColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderBottomWidth: `${getHeaderBorderValues().bottom}px`,
                        borderBottomStyle: element.style?.borderStyle ?? 'solid',
                        borderBottomColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                        borderLeftWidth: `${getHeaderBorderValues().left}px`,
                        borderLeftStyle: element.style?.borderStyle ?? 'solid',
                        borderLeftColor: element.style?.headerBorderColor ?? element.style?.borderColor ?? '#cccccc',
                      }}
                    />
                  </div>
                  <div className="text-xs theme-text-muted text-center space-y-0.5">
                    <div>Top: {getHeaderBorderValues().top}px</div>
                    <div>Right: {getHeaderBorderValues().right}px</div>
                    <div>Bottom: {getHeaderBorderValues().bottom}px</div>
                    <div>Left: {getHeaderBorderValues().left}px</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs theme-text-secondary w-20">Pen Color:</label>
                  <input
                    type="color"
                    value={element.style?.headerBorderColor || element.style?.borderColor || '#cccccc'}
                    onChange={(e) => onStyleUpdate('headerBorderColor', e.target.value)}
                      className="w-8 h-6 border theme-border rounded cursor-pointer"
                  />
                    <span className="text-xs theme-text-secondary font-mono">
                      {element.style?.headerBorderColor || element.style?.borderColor || '#cccccc'}
                    </span>
                </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs theme-text-secondary w-20">Pen Width:</label>
                  <input
                    type="number"
                      value={element.style?.headerBorderWidth ?? element.style?.borderWidth ?? 1}
                      onChange={(e) => onStyleUpdate('headerBorderWidth', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                      max="10"
                    step="0.5"
                  />
                </div>
                  
                  {/* Default border styles */}
                  <div className="pt-2">
                    <label className="block text-xs theme-text-secondary mb-2">Quick border setup:</label>
                    <div className="flex gap-2">
                      {/* All borders */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'row')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'row'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All borders"
                      >
                        <div className="w-6 h-6 border-2 border-gray-600"></div>
                      </button>
                      
                      {/* All columns bordered */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'columns')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'columns'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All columns bordered"
                      >
                        <div className="w-6 h-6 grid grid-cols-2 gap-0">
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                        </div>
                      </button>
                      
                      {/* No borders */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'none')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          !element.style?.headerBorderType || element.style?.headerBorderType === 'none'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="No borders"
                      >
                        <div className="w-6 h-6 border-2 border-dashed theme-border"></div>
                      </button>
                      
                      {/* Top and bottom */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'top-bottom')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'top-bottom'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Top and bottom borders"
                      >
                        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-600"></div>
                      </button>
                      
                      {/* Left and right */}
                      <button
                        onClick={() => onStyleUpdate('headerBorderType', 'left-right')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.headerBorderType === 'left-right'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Left and right borders"
                      >
                        <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="p-4 theme-bg-tertiary border theme-border rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                Cells
              </h3>
              
              {/* Cor */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Cor</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs theme-text-secondary mb-1">Background</label>
                    <input
                      type="color"
                      value={element.style?.cellBackground && element.style?.cellBackground !== 'transparent' ? element.style?.cellBackground : '#ffffff'}
                      onChange={(e) => onStyleUpdate('cellBackground', e.target.value)}
                      className="w-10 h-10 border theme-border rounded cursor-pointer"
                      disabled={!element.style?.cellBackground || element.style?.cellBackground === 'transparent'}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs theme-text-secondary mb-1">Text</label>
                    <input
                      type="color"
                      value={element.style?.cellColor || '#000000'}
                      onChange={(e) => onStyleUpdate('cellColor', e.target.value)}
                      className="w-10 h-10 border theme-border rounded cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <label className="text-xs theme-text-secondary">Transparent Background</label>
                  <input
                    type="checkbox"
                    checked={!element.style?.cellBackground || element.style?.cellBackground === 'transparent'}
                    onChange={(e) => onStyleUpdate('cellBackground', e.target.checked ? 'transparent' : '#ffffff')}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t theme-border my-3"></div>

              {/* Font */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Font</h4>
                <div className="flex items-center gap-1">
                  <select
                    value={element.style?.fontFamily || 'Helvetica'}
                    onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Helvetica-Bold">Helvetica Bold</option>
                    <option value="Times">Times New Roman</option>
                    <option value="Courier">Courier New</option>
                  </select>
                  
                  <input
                    type="number"
                    min="6"
                    max="72"
                    value={element.style?.fontSize || 10}
                    onChange={(e) => onStyleUpdate('fontSize', parseFloat(e.target.value))}
                    className="w-11 px-1.5 py-1.5 text-xs text-center border theme-border rounded bg-white text-gray-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  
                  <button
                    onClick={() => {
                      const currentSize = element.style?.fontSize || 10
                      onStyleUpdate('fontSize', Math.max(6, currentSize - 1))
                    }}
                    className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                    title="Decrease size"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => {
                      const currentSize = element.style?.fontSize || 10
                      onStyleUpdate('fontSize', Math.min(72, currentSize + 1))
                    }}
                    className="w-7 h-7 text-xs border theme-border rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition flex items-center justify-center flex-shrink-0"
                    title="Increase size"
                  >
                    A+
                  </button>
                </div>
                </div>

              <div className="border-t theme-border my-3"></div>

              {/* Paddings das Cells */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Paddings</h4>
                <div className="space-y-2">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="cell-same-padding"
                      checked={element.style?.cellSamePadding || false}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          const value = element.style?.cellPaddingLeft || element.style?.cellPadding || 5
                          onStyleUpdate('cellPaddingLeft', value)
                          onStyleUpdate('cellPaddingRight', value)
                          onStyleUpdate('cellPaddingTop', value)
                          onStyleUpdate('cellPaddingBottom', value)
                          onStyleUpdate('cellPadding', value)
                          onStyleUpdate('cellSamePadding', true)
                        } else {
                          onStyleUpdate('cellSamePadding', false)
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="cell-same-padding" className="ml-2 text-xs theme-text">
                      Use the same value for every padding
                  </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Left</label>
                  <input
                        type="number"
                        value={element.style?.cellPaddingLeft || element.style?.cellPadding || 5}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          if (element.style?.cellSamePadding) {
                            onStyleUpdate('cellPaddingLeft', value)
                            onStyleUpdate('cellPaddingRight', value)
                            onStyleUpdate('cellPaddingTop', value)
                            onStyleUpdate('cellPaddingBottom', value)
                            onStyleUpdate('cellPadding', value)
                          } else {
                            onStyleUpdate('cellPaddingLeft', value)
                          }
                        }}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Right</label>
                      <input
                        type="number"
                        value={element.style?.cellPaddingRight || element.style?.cellPadding || 5}
                        onChange={(e) => onStyleUpdate('cellPaddingRight', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        min="0"
                        step="1"
                        disabled={element.style?.cellSamePadding || false}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Top</label>
                      <input
                        type="number"
                        value={element.style?.cellPaddingTop || element.style?.cellPadding || 5}
                        onChange={(e) => onStyleUpdate('cellPaddingTop', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        min="0"
                        step="1"
                        disabled={element.style?.cellSamePadding || false}
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Bottom</label>
                      <input
                        type="number"
                        value={element.style?.cellPaddingBottom || element.style?.cellPadding || 5}
                        onChange={(e) => onStyleUpdate('cellPaddingBottom', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        min="0"
                        step="1"
                        disabled={element.style?.cellSamePadding || false}
                      />
                    </div>
                </div>
              </div>
            </div>

              <div className="border-t theme-border my-3"></div>

              {/* Borders das Cells */}
              <div className="mb-3">
                <h4 className="text-xs font-medium theme-text-secondary mb-2">Borders</h4>
                
                {/* Border Preview Box */}
                <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className="w-32 h-32 bg-white"
                      style={{
                        borderTopWidth: `${getCellBorderValues().top}px`,
                        borderTopStyle: element.style?.borderStyle ?? 'solid',
                        borderTopColor: element.style?.borderColor ?? '#cccccc',
                        borderRightWidth: `${getCellBorderValues().right}px`,
                        borderRightStyle: element.style?.borderStyle ?? 'solid',
                        borderRightColor: element.style?.borderColor ?? '#cccccc',
                        borderBottomWidth: `${getCellBorderValues().bottom}px`,
                        borderBottomStyle: element.style?.borderStyle ?? 'solid',
                        borderBottomColor: element.style?.borderColor ?? '#cccccc',
                        borderLeftWidth: `${getCellBorderValues().left}px`,
                        borderLeftStyle: element.style?.borderStyle ?? 'solid',
                        borderLeftColor: element.style?.borderColor ?? '#cccccc',
                      }}
                    />
                  </div>
                  <div className="text-xs theme-text-muted text-center space-y-0.5">
                    <div>Top: {getCellBorderValues().top}px</div>
                    <div>Right: {getCellBorderValues().right}px</div>
                    <div>Bottom: {getCellBorderValues().bottom}px</div>
                    <div>Left: {getCellBorderValues().left}px</div>
                  </div>
                </div>
              
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs theme-text-secondary w-20">Pen Color:</label>
                  <input
                    type="color"
                      value={element.style?.borderColor ?? '#cccccc'}
                    onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                      className="w-8 h-6 border theme-border rounded cursor-pointer"
                  />
                    <span className="text-xs theme-text-secondary font-mono">
                      {element.style?.borderColor ?? '#cccccc'}
                    </span>
                </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs theme-text-secondary w-20">Pen Style:</label>
                    <div className="flex gap-1 flex-1">
                      {[
                        { value: 'solid', label: 'Solid' },
                        { value: 'dashed', label: 'Dashed' },
                        { value: 'dotted', label: 'Dotted' }
                      ].map((style) => (
                        <button
                          key={style.value}
                          onClick={() => onStyleUpdate('borderStyle', style.value)}
                          className={`flex-1 px-2 py-2 text-xs rounded border-2 transition-all ${
                            (element.style?.borderStyle || 'solid') === style.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          title={style.label}
                        >
                          <div 
                            className="h-0 mx-auto w-full"
                            style={{ 
                              borderTopWidth: '2px',
                              borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                              borderTopColor: (element.style?.borderStyle || 'solid') === style.value ? '#8b5cf6' : '#666'
                            }}
                          />
                          <span className={`mt-1 block text-[10px] ${
                            (element.style?.borderStyle || 'solid') === style.value
                              ? 'text-primary-600 font-medium'
                              : 'text-gray-500'
                          }`}>
                            {style.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs theme-text-secondary w-20">Pen Width:</label>
                  <input
                    type="number"
                      value={element.style?.borderWidth ?? 1}
                      onChange={(e) => {
                        const newWidth = parseFloat(e.target.value) || 0
                        onStyleUpdate('borderWidth', newWidth)
                      }}
                      className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>
                  
                  {/* Default border styles */}
                  <div className="pt-2">
                    <label className="block text-xs theme-text-secondary mb-2">Quick border setup:</label>
                    <div className="flex gap-2">
                      {/* All borders */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'row')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'row'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All borders"
                      >
                        <div className="w-6 h-6 border-2 border-gray-600"></div>
                      </button>
                      
                      {/* All cells bordered */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'cells')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'cells'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="All cells bordered"
                      >
                        <div className="w-6 h-6 grid grid-cols-2 gap-0">
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
                          <div className="border-2 border-gray-600"></div>
              </div>
                      </button>
                      
                      {/* No borders */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'none')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          !element.style?.cellBorderType || element.style?.cellBorderType === 'none'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="No borders"
                      >
                        <div className="w-6 h-6 border-2 border-dashed theme-border"></div>
                      </button>
                      
                      {/* Top and bottom */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'top-bottom')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'top-bottom'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Top and bottom borders"
                      >
                        <div className="w-6 h-6 border-t-2 border-b-2 border-gray-600"></div>
                      </button>
                      
                      {/* Left and right */}
                      <button
                        onClick={() => onStyleUpdate('cellBorderType', 'left-right')}
                        className={`w-10 h-10 border-2 rounded hover:bg-blue-50 transition flex items-center justify-center ${
                          element.style?.cellBorderType === 'left-right'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-400'
                        }`}
                        title="Left and right borders"
                      >
                        <div className="w-6 h-6 border-l-2 border-r-2 border-gray-600"></div>
                      </button>
            </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}

/**
 * Component to display and edit group properties
 */
function GroupPropertiesPanel({ 
  group, 
  location 
}: { 
  group: ElementGroup; 
  location: 'body' | 'header' | 'footer' | 'bodyBackground' | 'summary' 
}): JSX.Element {
  const { updateGroup, deleteGroup, template } = useTemplateStore()
  
  // Buscar elementos do grupo
  const groupElements = (() => {
    let allElements: Element[] = []
    
    if (location === 'header' && template.pageSettings.header) {
      allElements = template.pageSettings.header.elements
    } else if (location === 'footer' && template.pageSettings.footer) {
      allElements = template.pageSettings.footer.elements
    } else if (location === 'bodyBackground' && template.pageSettings.bodyBackground) {
      allElements = template.pageSettings.bodyBackground.elements
    } else {
      allElements = template.pageElements
    }
    
    return allElements.filter(el => group.elementIds.includes(el.id))
  })()
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Group Properties
      </h2>
      
      {/* Group Name */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center mb-2">
          <svg 
            className="w-4 h-4 mr-2 text-purple-600" 
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
          <label className="text-xs font-semibold text-purple-800">
            Group Name
          </label>
        </div>
        <input
          type="text"
          value={group.name}
          onChange={(e) => updateGroup(group.id, { name: e.target.value }, location)}
          className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Group name"
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <textarea
          value={group.printCondition || ''}
          onChange={(e) => updateGroup(group.id, { printCondition: e.target.value }, location)}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.total > 1000"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the group will always print. Use JavaScript expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.total &gt; 1000</code></li>
          <li><code>invoice.discount &gt; 0</code></li>
          <li><code>invoice.status === "Aprovado"</code></li>
        </ul>
      </div>
      
      {/* Elementos do Grupo */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Elements ({group.elementIds.length})
        </label>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {groupElements.map((element) => (
            <div
              key={element.id}
              className="px-3 py-2 theme-bg-tertiary border theme-border rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="font-medium theme-text">{element.id}</div>
              <div className="theme-text-muted text-xs">
                Type: {element.type} • Position: ({Math.round(element.x)}, {Math.round(element.y)})
              </div>
            </div>
          ))}
        </div>
      </div>
      
      
      <div className="border-t pt-4">
        <button
          onClick={() => {
            if (confirm(`Ungroup "${group.name}"?\n\nElements will remain, but will no longer be part of the group.`)) {
              deleteGroup(group.id, location)
            }
          }}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Ungroup Elements
        </button>
        <p className="text-xs theme-text-muted mt-2 text-center">
          Elements will not be deleted
        </p>
      </div>
    </div>
  )
}

/**
 * Component to display and edit summary page properties
 */
function SummaryPropertiesPanel(): JSX.Element {
  const { template, updateSummaryPage } = useTemplateStore()
  
  if (!template.summaryPage) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">Summary page does not exist</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Summary Properties
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-green-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-semibold text-green-800">
            Summary Page
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Additional page rendered after the main content
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <textarea
          value={template.summaryPage.printCondition || ''}
          onChange={(e) => updateSummaryPage({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showSummary === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the summary will always print. Use JavaScript expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showSummary === true</code></li>
          <li><code>items.length &gt; 10</code></li>
          <li><code>invoice.total &gt; 1000</code></li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Component to display and edit header properties
 */
function HeaderPropertiesPanel(): JSX.Element {
  const { template, updateHeader } = useTemplateStore()
  
  if (!template.pageSettings.header) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">Header does not exist</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Header Properties
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-blue-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <span className="text-xs font-semibold text-blue-800">
            Header
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Header rendered at the top of each page
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Height (pt)
        </label>
        <input
          type="number"
          value={template.pageSettings.header.height}
          onChange={(e) => updateHeader({ height: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          min="0"
          step="1"
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <textarea
          value={template.pageSettings.header.printCondition || ''}
          onChange={(e) => updateHeader({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: pageNumber > 1"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the header will always print. Use expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showHeader === true</code></li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Component to display and edit footer properties
 */
function FooterPropertiesPanel(): JSX.Element {
  const { template, updateFooter } = useTemplateStore()
  
  if (!template.pageSettings.footer) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">Footer does not exist</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Footer Properties
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-orange-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
          <span className="text-xs font-semibold text-orange-800">
            Footer
          </span>
        </div>
        <p className="text-xs text-orange-700 mt-1">
          Footer rendered at the bottom of each page
        </p>
      </div>
      
      {/* Altura */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Height (pt)
        </label>
        <input
          type="number"
          value={template.pageSettings.footer.height}
          onChange={(e) => updateFooter({ height: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          min="0"
          step="1"
        />
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <textarea
          value={template.pageSettings.footer.printCondition || ''}
          onChange={(e) => updateFooter({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: pageNumber > 1"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the footer will always print. Use expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>pageNumber &gt; 1</code></li>
          <li><code>invoice.showFooter === true</code></li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Component to display and edit body background properties
 */
function BackgroundPropertiesPanel(): JSX.Element {
  const { template, updateBodyBackground } = useTemplateStore()
  
  if (!template.pageSettings.bodyBackground) {
    return (
      <div className="w-[360px] theme-bg-secondary border-l theme-border p-4">
        <p className="text-sm theme-text-muted">Background does not exist</p>
      </div>
    )
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold theme-text border-b pb-3 mb-3">
        Background Properties
      </h2>
      
      {/* Info */}
      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center">
          <svg 
            className="w-4 h-4 mr-2 text-purple-600" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 3l18 18" />
          </svg>
          <span className="text-xs font-semibold text-purple-800">
            Background
          </span>
        </div>
        <p className="text-xs text-purple-700 mt-1">
          Elements rendered behind the main content
        </p>
      </div>
      
      {/* Print Condition */}
      <div className="mb-4">
        <label className="block text-xs font-semibold theme-text mb-2">
          Print Condition
        </label>
        <textarea
          value={template.pageSettings.bodyBackground.printCondition || ''}
          onChange={(e) => updateBodyBackground({ printCondition: e.target.value || undefined })}
          className="w-full px-3 py-2 text-xs border theme-border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
          placeholder="Ex: invoice.showBackground === true"
          rows={3}
        />
        <p className="text-xs theme-text-muted mt-1">
          If empty, the background will always print. Use expressions like:
        </p>
        <ul className="text-xs theme-text-muted mt-1 ml-4 list-disc">
          <li><code>invoice.showBackground === true</code></li>
          <li><code>pageNumber === 1</code></li>
        </ul>
      </div>
    </div>
  )
}

// Componente para editar elementos filhos do Loop
interface LoopChildEditorProps {
  child: any
  index: number
  loopId: string
  location: any
}

function LoopChildEditor({ child, index, loopId, location }: LoopChildEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { updateLoopChildElement, deleteLoopChildElement } = useTemplateStore()
  
  const getIcon = () => {
    switch (child.type) {
      case 'text':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
          </svg>
        )
      case 'static_text':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
            <circle cx="18" cy="18" r="3" fill="currentColor" stroke="none" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )
      case 'rectangle':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        )
      case 'line':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 19l14-14" />
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
          <span className="text-primary-500">{getIcon()}</span>
          <span className="text-xs font-medium text-gray-700 capitalize">{child.type.replace('_', ' ')}</span>
          {child.value && (
            <span className="text-xs text-gray-400 truncate max-w-[80px]">
              {child.value.substring(0, 15)}{child.value.length > 15 ? '...' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteLoopChildElement(loopId, child.id, location)
            }}
            className="p-1 text-red-500 hover:bg-red-100 rounded"
            title="Remove"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Content expandido */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-100 space-y-3">
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">X</label>
              <input
                type="number"
                value={child.x || 0}
                onChange={(e) => updateLoopChildElement(loopId, child.id, { x: parseFloat(e.target.value) }, location)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Y</label>
              <input
                type="number"
                value={child.y || 0}
                onChange={(e) => updateLoopChildElement(loopId, child.id, { y: parseFloat(e.target.value) }, location)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
              />
            </div>
          </div>
          
          {/* Tamanho (para elementos com width/height) */}
          {(child.type !== 'line') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Width</label>
                <input
                  type="number"
                  value={child.width || 100}
                  onChange={(e) => updateLoopChildElement(loopId, child.id, { width: parseFloat(e.target.value) }, location)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Height</label>
                <input
                  type="number"
                  value={child.height || 20}
                  onChange={(e) => updateLoopChildElement(loopId, child.id, { height: parseFloat(e.target.value) }, location)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
                />
              </div>
            </div>
          )}
          
          {/* Valor (para texto) */}
          {(child.type === 'text' || child.type === 'static_text') && (
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Valor/Binding</label>
              <input
                type="text"
                value={child.value || ''}
                onChange={(e) => updateLoopChildElement(loopId, child.id, { value: e.target.value }, location)}
                placeholder={child.type === 'text' ? 'field' : 'Text'}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded font-mono bg-white text-gray-900"
              />
            </div>
          )}
          
          {/* Linha (x2, y2) */}
          {child.type === 'line' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">X2</label>
                <input
                  type="number"
                  value={child.x2 || 100}
                  onChange={(e) => updateLoopChildElement(loopId, child.id, { x2: parseFloat(e.target.value) }, location)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Y2</label>
                <input
                  type="number"
                  value={child.y2 || 0}
                  onChange={(e) => updateLoopChildElement(loopId, child.id, { y2: parseFloat(e.target.value) }, location)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
                />
              </div>
            </div>
          )}
          
          {/* Font Size (para texto) */}
          {(child.type === 'text' || child.type === 'static_text') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Font Size</label>
                <input
                  type="number"
                  value={child.style?.fontSize || 10}
                  onChange={(e) => updateLoopChildElement(loopId, child.id, { 
                    style: { ...child.style, fontSize: parseFloat(e.target.value) } 
                  }, location)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Cor</label>
                <input
                  type="color"
                  value={child.style?.color || '#000000'}
                  onChange={(e) => updateLoopChildElement(loopId, child.id, { 
                    style: { ...child.style, color: e.target.value } 
                  }, location)}
                  className="w-full h-7 border border-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Painel de propriedades completo para elementos filhos do loop
interface LoopChildPropertiesPanelProps {
  loopId: string
  child: any
  location: any
  loopElement: any 
}

function LoopChildPropertiesPanel({ loopId, child, location, loopElement }: LoopChildPropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('appearance')
  const { updateLoopChildElement, deleteLoopChildElement, clearLoopChildSelection } = useTemplateStore()
  
  
  const loopWidth = loopElement?.width || 400
  const loopHeight = loopElement?.height || 50
  
  const handleUpdate = (field: string, value: any) => {
    updateLoopChildElement(loopId, child.id, { [field]: value }, location)
  }
  
  const handleStyleUpdate = (field: string, value: any) => {
    updateLoopChildElement(loopId, child.id, { 
      style: { ...child.style, [field]: value } 
    }, location)
  }

  const handleFullUpdate = (updates: any) => {
    updateLoopChildElement(loopId, child.id, updates, location)
  }
  
  // Tabs baseadas no tipo do elemento
  const getTabs = () => {
    if (child.type === 'text' || child.type === 'static_text') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'font', label: 'Font' },
      ]
    } else if (child.type === 'rectangle') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'borders', label: 'Borders' },
      ]
    } else if (child.type === 'line') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'style', label: 'Style' },
      ]
    } else if (child.type === 'image') {
      return [
        { id: 'appearance', label: 'Appearance' },
        { id: 'image', label: 'Image' },
      ]
    }
    return [{ id: 'appearance', label: 'Appearance' }]
  }

  const tabs = getTabs()
  
  const getIcon = () => {
    switch (child.type) {
      case 'text':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
          </svg>
        )
      case 'static_text':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M9 20v-13M15 20v-13" />
            <circle cx="18" cy="18" r="3" fill="currentColor" stroke="none" />
          </svg>
        )
      case 'image':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )
      case 'rectangle':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        )
      case 'line':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 19l14-14" />
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="w-[360px] theme-bg-secondary border-l theme-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b theme-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearLoopChildSelection()}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
              title="Back to Loop"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-purple-500">{getIcon()}</span>
            <span className="text-sm font-semibold theme-text capitalize">{child.type.replace('_', ' ')}</span>
          </div>
          <button
            onClick={() => {
              deleteLoopChildElement(loopId, child.id, location)
              clearLoopChildSelection()
            }}
            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Delete element"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <div className="text-xs text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
          Loop child element: <span className="font-mono">{loopId}</span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b theme-border flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'theme-text-secondary hover:theme-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* APPEARANCE TAB - Comum a todos */}
        {activeTab === 'appearance' && (
          <>
            {/* ID */}
            <div>
              <label className="block text-xs font-medium theme-text mb-1">ID</label>
              <input
                type="text"
                value={child.id}
                disabled
                className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-gray-50 text-gray-500"
              />
            </div>
            
            <div className="border-t theme-border my-3"></div>
            
            
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Position (relative to loop)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs theme-text-secondary mb-1">X</label>
                  <input
                    type="number"
                    value={child.x || 0}
                    onChange={(e) => handleUpdate('x', parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs theme-text-secondary mb-1">Y</label>
                  <input
                    type="number"
                    value={child.y || 0}
                    onChange={(e) => handleUpdate('y', parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t theme-border my-3"></div>
            
            
            {child.type !== 'line' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">Size</h3>
                  {/* Info do tamanho do loop */}
                  <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded text-xs">
                    <span className="text-purple-700 dark:text-purple-300">
                      📐 Loop Dimensions: <span className="font-mono font-medium">{loopWidth}×{loopHeight}</span>px
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Width</label>
                      <input
                        type="number"
                        value={typeof child.width === 'string' ? '' : (child.width || 100)}
                        onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
                        disabled={child.width === '100%'}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                      />
                      {child.type === 'rectangle' && (
                        <>
                          <label className="flex items-center mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={child.width === '100%'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFullUpdate({ width: '100%', x: 0 })
                                } else {
                                  handleUpdate('width', 100)
                                }
                              }}
                              className="mr-2 w-3.5 h-3.5"
                            />
                            <span className="text-xs theme-text-secondary">100%</span>
                          </label>
                          {child.width === '100%' && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              = {loopWidth}px (loop width)
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Height</label>
                      <input
                        type="number"
                        value={typeof child.height === 'string' ? '' : (child.height || 20)}
                        onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
                        disabled={child.height === '100%'}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                      />
                      {child.type === 'rectangle' && (
                        <>
                          <label className="flex items-center mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={child.height === '100%'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFullUpdate({ height: '100%', y: 0 })
                                } else {
                                  handleUpdate('height', 100)
                                }
                              }}
                              className="mr-2 w-3.5 h-3.5"
                            />
                            <span className="text-xs theme-text-secondary">100%</span>
                          </label>
                          {child.height === '100%' && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              = {loopHeight}px (loop height)
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t theme-border my-3"></div>
              </>
            )}
            
            {/* Linha: Ponto Final */}
            {child.type === 'line' && (
              <>
                <div>
                  <h3 className="text-xs font-semibold theme-text mb-2">End Point</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">X2</label>
                      <input
                        type="number"
                        value={child.x2 || 100}
                        onChange={(e) => handleUpdate('x2', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs theme-text-secondary mb-1">Y2</label>
                      <input
                        type="number"
                        value={child.y2 || 0}
                        onChange={(e) => handleUpdate('y2', parseFloat(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t theme-border my-3"></div>
              </>
            )}
            
            {/* Valor/Texto para texto e static_text */}
            {(child.type === 'text' || child.type === 'static_text') && (
              <div>
                <h3 className="text-xs font-semibold theme-text mb-2">
                  {child.type === 'text' ? 'Data Binding' : 'Texto'}
                </h3>
                <textarea
                  value={child.value || ''}
                  onChange={(e) => handleUpdate('value', e.target.value)}
                  placeholder={child.type === 'text' ? 'field_name' : 'Enter text...'}
                  className="w-full px-2 py-1.5 text-xs border theme-border rounded font-mono bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
                {child.type === 'text' && (
                  <p className="text-xs theme-text-muted mt-1">
                    Use only the property name (e.g., name, value, price)
                  </p>
                )}
              </div>
            )}
            
            
            {child.type === 'rectangle' && (
              <div>
                <h3 className="text-xs font-semibold theme-text mb-2">Color</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs theme-text-secondary">Fill</label>
                    <input
                      type="color"
                      value={child.style?.fillColor || '#4a90e2'}
                      onChange={(e) => handleStyleUpdate('fillColor', e.target.value)}
                      disabled={!child.style?.fillColor}
                      className="w-10 h-8 border theme-border rounded cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!child.style?.fillColor}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleStyleUpdate('fillColor', null)
                        } else {
                          handleStyleUpdate('fillColor', '#4a90e2')
                        }
                      }}
                      className="mr-2 w-3.5 h-3.5"
                    />
                    <span className="text-xs theme-text-secondary">Transparent</span>
                  </label>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* FONT TAB - Para texto */}
        {activeTab === 'font' && (child.type === 'text' || child.type === 'static_text') && (
          <>
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Font</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs theme-text-secondary mb-1">Family</label>
                  <select
                    value={child.style?.fontFamily || 'Helvetica'}
                    onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                  >
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times-Roman">Times Roman</option>
                    <option value="Courier">Courier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs theme-text-secondary mb-1">Size</label>
                  <input
                    type="number"
                    value={child.style?.fontSize || 12}
                    onChange={(e) => handleStyleUpdate('fontSize', parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Weight</label>
                <select
                  value={child.style?.fontWeight || 'normal'}
                  onChange={(e) => handleStyleUpdate('fontWeight', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Style</label>
                <select
                  value={child.style?.fontStyle || 'normal'}
                  onChange={(e) => handleStyleUpdate('fontStyle', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>
            </div>
            
            <div className="border-t theme-border my-3"></div>
            
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs theme-text-secondary">Text</label>
                  <input
                    type="color"
                    value={child.style?.color || '#000000'}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                    className="w-10 h-8 border theme-border rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs theme-text-secondary">Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={child.style?.backgroundColor || '#ffffff'}
                      onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                      disabled={!child.style?.backgroundColor}
                      className="w-10 h-8 border theme-border rounded cursor-pointer disabled:opacity-50"
                    />
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!child.style?.backgroundColor}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleStyleUpdate('backgroundColor', null)
                          } else {
                            handleStyleUpdate('backgroundColor', '#ffffff')
                          }
                        }}
                        className="mr-1 w-3 h-3"
                      />
                      <span className="text-[10px] theme-text-muted">None</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t theme-border my-3"></div>
            
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Alignment</h3>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => handleStyleUpdate('alignment', align)}
                    className={`flex-1 px-2 py-2 text-xs border rounded transition ${
                      (child.style?.alignment || 'left') === align
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'theme-border bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {align === 'left' ? '◀ Left' : align === 'center' ? '◆ Center' : '▶ Right'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t theme-border my-3"></div>
            
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={child.style?.multiline || false}
                  onChange={(e) => handleStyleUpdate('multiline', e.target.checked)}
                  className="mr-2 w-3.5 h-3.5"
                />
                <span className="text-xs theme-text">Multiline text</span>
              </label>
            </div>
            
            {child.style?.multiline && (
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Line Height</label>
                <input
                  type="number"
                  value={child.style?.lineHeight || 1.2}
                  onChange={(e) => handleStyleUpdate('lineHeight', parseFloat(e.target.value))}
                  step="0.1"
                  min="0.5"
                  max="3"
                  className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                />
              </div>
            )}
          </>
        )}
        
        
        {activeTab === 'borders' && child.type === 'rectangle' && (
          <>
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Borders</h3>
              
              {/* Preview */}
              <div className="mb-3 p-3 theme-bg-tertiary border theme-border rounded flex items-center justify-center">
                <div 
                  className="w-24 h-24"
                  style={{
                    backgroundColor: child.style?.fillColor || '#4a90e2',
                    borderWidth: `${child.style?.borderWidth || 1}px`,
                    borderStyle: child.style?.borderStyle || 'solid',
                    borderColor: child.style?.borderColor || '#000000',
                    borderRadius: `${child.style?.cornerRadius || 0}px`,
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs theme-text-secondary w-20">Color:</label>
                  <input
                    type="color"
                    value={child.style?.borderColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                    className="w-8 h-6 border theme-border rounded cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-xs theme-text-secondary w-20">Style:</label>
                  <div className="flex gap-1 flex-1">
                    {[
                      { value: 'solid', label: 'Solid' },
                      { value: 'dashed', label: 'Dashed' },
                      { value: 'dotted', label: 'Dotted' }
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => handleStyleUpdate('borderStyle', style.value)}
                        className={`flex-1 px-2 py-2 text-xs rounded border-2 transition ${
                          (child.style?.borderStyle || 'solid') === style.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div 
                          className="h-0 mx-auto w-full"
                          style={{ 
                            borderTopWidth: '2px',
                            borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                            borderTopColor: (child.style?.borderStyle || 'solid') === style.value ? '#8b5cf6' : '#666'
                          }}
                        />
                        <span className="mt-1 block text-[10px]">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-xs theme-text-secondary w-20">Width:</label>
                  <input
                    type="number"
                    value={child.style?.borderWidth ?? 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-xs theme-text-secondary w-20">Radius:</label>
                  <input
                    type="number"
                    value={child.style?.cornerRadius || 0}
                    onChange={(e) => handleStyleUpdate('cornerRadius', parseFloat(e.target.value))}
                    className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                    min="0"
                  />
                </div>
                
                {/* Default border styles */}
                <div className="pt-2">
                  <label className="block text-xs theme-text-secondary mb-2">Default borders:</label>
                  {(() => {
                    const bw = child.style?.borderWidth ?? 1
                    const top = child.style?.borderTopWidth ?? bw
                    const right = child.style?.borderRightWidth ?? bw
                    const bottom = child.style?.borderBottomWidth ?? bw
                    const left = child.style?.borderLeftWidth ?? bw
                    const isAll = top > 0 && right > 0 && bottom > 0 && left > 0
                    const isNone = top === 0 && right === 0 && bottom === 0 && left === 0
                    const isTopBottom = top > 0 && bottom > 0 && right === 0 && left === 0
                    const isLeftRight = left > 0 && right > 0 && top === 0 && bottom === 0
                    return (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: width,
                                borderRightWidth: width,
                                borderBottomWidth: width,
                                borderLeftWidth: width,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isAll ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Todas as bordas"
                        >
                          <div className={`w-6 h-6 border-2 ${isAll ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: 0,
                                borderRightWidth: 0,
                                borderBottomWidth: 0,
                                borderLeftWidth: 0,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isNone ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Sem bordas"
                        >
                          <div className={`w-6 h-6 border-2 border-dashed ${isNone ? 'border-primary-300' : 'border-gray-300'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: width,
                                borderRightWidth: 0,
                                borderBottomWidth: width,
                                borderLeftWidth: 0,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isTopBottom ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Topo e fundo"
                        >
                          <div className={`w-6 h-6 border-t-2 border-b-2 ${isTopBottom ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                        
                        <button
                          onClick={() => {
                            const width = child.style?.borderWidth || 1
                            handleFullUpdate({
                              style: {
                                ...child.style,
                                borderTopWidth: 0,
                                borderRightWidth: width,
                                borderBottomWidth: 0,
                                borderLeftWidth: width,
                              }
                            })
                          }}
                          className={`w-10 h-10 border-2 rounded transition flex items-center justify-center ${
                            isLeftRight ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                          title="Esquerda e direita"
                        >
                          <div className={`w-6 h-6 border-l-2 border-r-2 ${isLeftRight ? 'border-primary-500' : 'border-gray-500'}`}></div>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* STYLE TAB - Para linha */}
        {activeTab === 'style' && child.type === 'line' && (
          <>
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Estilo da Linha</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs theme-text-secondary w-20">Color:</label>
                  <input
                    type="color"
                    value={child.style?.strokeColor || '#000000'}
                    onChange={(e) => handleStyleUpdate('strokeColor', e.target.value)}
                    className="w-8 h-6 border theme-border rounded cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-xs theme-text-secondary w-20">Espessura:</label>
                  <input
                    type="number"
                    value={child.style?.strokeWidth || 1}
                    onChange={(e) => handleStyleUpdate('strokeWidth', parseFloat(e.target.value))}
                    className="w-24 px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                    min="0.5"
                    max="20"
                    step="0.5"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <label className="text-xs theme-text-secondary w-20">Style:</label>
                  <div className="flex gap-1 flex-1">
                    {[
                      { value: 'solid', label: 'Solid' },
                      { value: 'dashed', label: 'Dashed' },
                      { value: 'dotted', label: 'Dotted' }
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => handleStyleUpdate('borderStyle', style.value)}
                        className={`flex-1 px-2 py-2 text-xs rounded border-2 transition ${
                          (child.style?.borderStyle || 'solid') === style.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div 
                          className="h-0 mx-auto w-full"
                          style={{ 
                            borderTopWidth: '2px',
                            borderTopStyle: style.value as 'solid' | 'dashed' | 'dotted',
                            borderTopColor: (child.style?.borderStyle || 'solid') === style.value ? '#8b5cf6' : '#666'
                          }}
                        />
                        <span className="mt-1 block text-[10px]">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* IMAGE TAB - Para imagem */}
        {activeTab === 'image' && child.type === 'image' && (
          <>
            <div>
              <h3 className="text-xs font-semibold theme-text mb-2">Image Settings</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs theme-text-secondary mb-1">Source / Data Binding</label>
                  <input
                    type="text"
                    value={child.source || ''}
                    onChange={(e) => handleUpdate('source', e.target.value)}
                    placeholder="campo_imagem ou URL"
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded font-mono bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs theme-text-muted mt-1">
                    Use o nome do campo ou uma URL direta
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs theme-text-secondary mb-1">Fit (Ajuste)</label>
                  <select
                    value={child.fit || 'contain'}
                    onChange={(e) => handleUpdate('fit', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                  >
                    <option value="contain">Contain (maintain aspect ratio, fit)</option>
                    <option value="cover">Cover (cobrir, cortar)</option>
                    <option value="fill">Fill (esticar)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs theme-text-secondary mb-1">Alignment</label>
                  <select
                    value={child.alignment || 'center'}
                    onChange={(e) => handleUpdate('alignment', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border theme-border rounded bg-white text-gray-900"
                  >
                    <option value="center">Centro</option>
                    <option value="top">Topo</option>
                    <option value="bottom">Baixo</option>
                    <option value="left">Esquerda</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
