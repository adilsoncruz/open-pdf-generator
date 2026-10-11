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
  const [sectionsExpanded, setSectionsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'elements' | 'layers'>('layers')
  const [showAddBandDropdown, setShowAddBandDropdown] = useState(false)
  const { selectedElementIds, selectElement, selectedContainerParentId, addElement } = useTemplateStore()
  const getSectionElements = () => {
    if (currentSection === 'header') return template.pageSettings.header?.elements || []
    if (currentSection === 'footer') return template.pageSettings.footer?.elements || []
    if (currentSection === 'bodyBackground') return template.pageSettings.bodyBackground?.elements || []
    if (currentSection === 'summary') return template.summaryPage?.elements || []
    return template.page || []
  }

  const selectedContainerId = ['body', 'header', 'footer', 'summary'].includes(currentSection)
    ? selectedContainerParentId || (getSectionElements().find(el => el.id === selectedElementIds[0] && el.type === 'container')?.id || null)
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
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200">
      {/* 1. Header do Painel com Abas: 'Elementos' e 'Camadas' + Botão '+' */}
      <div className="p-2 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('elements')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'elements'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon name="plus" size="xs" />
            <span>Elementos</span>
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
              activeTab === 'layers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon name="layers" size="xs" />
            <span>Camadas</span>
          </button>
        </div>

        <div className="flex items-center gap-1 relative">
          {/* Botão '+' com Dropdown para Adicionar Bandas */}
          <button
            onClick={() => setShowAddBandDropdown(!showAddBandDropdown)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition shadow-sm"
            title="Adicionar Seção / Banda"
          >
            <Icon name="plus" size="sm" />
          </button>

          {/* Menu Dropdown do Botão '+' */}
          {showAddBandDropdown && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 backdrop-blur-md">
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 mb-1">
                Adicionar Seção
              </div>
              
              <button
                disabled={!!template.pageSettings.header}
                onClick={() => {
                  if (!template.pageSettings.header) addHeader()
                  setShowAddBandDropdown(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-300"
              >
                <span>🏷</span>
                <div>
                  <div className="font-medium">Header Band</div>
                  <div className="text-[10px] text-slate-500">Faixa fixa superior</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentSection('body')
                  setShowAddBandDropdown(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-slate-800 transition text-slate-300"
              >
                <span>📄</span>
                <div>
                  <div className="font-medium">Page Body Band</div>
                  <div className="text-[10px] text-slate-500">Fluxo principal dinâmico</div>
                </div>
              </button>

              <button
                disabled={!!template.summaryPage}
                onClick={() => {
                  if (!template.summaryPage) addSummaryPage()
                  setShowAddBandDropdown(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-300"
              >
                <span>📊</span>
                <div>
                  <div className="font-medium">Summary Band</div>
                  <div className="text-[10px] text-slate-500">Totais e assinaturas finais</div>
                </div>
              </button>

              <button
                disabled={!!template.pageSettings.footer}
                onClick={() => {
                  if (!template.pageSettings.footer) addFooter()
                  setShowAddBandDropdown(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-300"
              >
                <span>🏷</span>
                <div>
                  <div className="font-medium">Footer Band</div>
                  <div className="text-[10px] text-slate-500">Faixa fixa no rodapé</div>
                </div>
              </button>

              <button
                disabled={!!template.pageSettings.bodyBackground}
                onClick={() => {
                  if (!template.pageSettings.bodyBackground) addBodyBackground()
                  setShowAddBandDropdown(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition text-slate-300"
              >
                <span>🖼</span>
                <div>
                  <div className="font-medium">Background Layer</div>
                  <div className="text-[10px] text-slate-500">Marca d'água / Timbrado</div>
                </div>
              </button>

              <div className="border-t border-slate-800 my-1" />

              <button
                onClick={() => {
                  const id = `container-${Date.now()}`
                  addElement({ type: 'container', id, name: 'Novo Container', x: 0, y: 0, width: '100%', height: 120, elements: [] }, currentSection)
                  setShowAddBandDropdown(false)
                }}
                className="w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 hover:bg-slate-800 transition text-slate-300"
              >
                <span>⊞</span>
                <div>
                  <div className="font-medium">Novo Container</div>
                  <div className="text-[10px] text-slate-500">Bloco de agrupamento</div>
                </div>
              </button>
            </div>
          )}

          <IconButton
            icon="chevron-left"
            onClick={toggleSidebarMinimized}
            tooltip="Minimizar barra"
            size="sm"
            className="text-slate-400 hover:text-white"
          />
        </div>
      </div>
      {/* Conteúdo da Aba "Elementos" (Biblioteca categorizada) */}
      {activeTab === 'elements' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Categoria 1: Tipografia & Links */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Básicos
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => addElement({ type: 'text', id: `text-${Date.now()}`, value: 'Novo Texto', x: 40, y: 40, width: 200, height: 25, style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' } }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-serif text-slate-300 group-hover:text-indigo-400">T</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Texto</div>
                    <div className="text-[10px] text-slate-400">Suporta variáveis e bindings</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() => addElement({ type: 'rich_text', id: `rich_text-${Date.now()}`, value: '**Texto** em *Markdown*', x: 40, y: 40, width: 200, height: 30, style: { fontSize: 12, fontFamily: 'Helvetica', color: '#000000' } }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-serif text-slate-300 group-hover:text-indigo-400">¶</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Rich Text</div>
                    <div className="text-[10px] text-slate-400">Formatação em Markdown</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() => addElement({ type: 'link', id: `link-${Date.now()}`, value: 'Clique aqui', url: 'https://exemplo.com', x: 40, y: 40, width: 140, height: 25, style: { fontSize: 12, fontFamily: 'Helvetica', color: '#3b82f6' } }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-400">🔗</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Hiperlink</div>
                    <div className="text-[10px] text-slate-400">Link clicável externo</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>
            </div>
          </div>

          {/* Categoria 2: Estrutura & Fluxo */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Estrutura & Fluxo
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => addElement({ type: 'container', id: `container-${Date.now()}`, name: 'Container', x: 0, y: 40, width: '100%', height: 120, elements: [] }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-400">⊞</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Container</div>
                    <div className="text-[10px] text-slate-400">Bloco de posicionamento</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() => addElement({ type: 'spacer', id: `spacer-${Date.now()}`, x: 0, width: '100%', height: 40 }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-400">↕</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Espaçador</div>
                    <div className="text-[10px] text-slate-400">Espaço vertical relativo</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() => addElement({ type: 'page_break', id: `page_break-${Date.now()}`, x: 0, width: '100%', height: 20 }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-400">✂</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Quebra de Página</div>
                    <div className="text-[10px] text-slate-400">Força salto para próxima página</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>
            </div>
          </div>

          {/* Categoria 3: Mídia & Tabelas */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Mídia & Tabelas
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => addElement({ type: 'table', id: `table-${Date.now()}`, width: 400, dataBinding: '', columns: [{ header: 'Coluna 1', field: 'item', width: 200 }], style: { headerBackground: '#f3f4f6', headerColor: '#000000', borderWidth: 1 } }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-400">▦</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Tabela</div>
                    <div className="text-[10px] text-slate-400">Grade dinâmica para listas</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() => addElement({ type: 'image', id: `image-${Date.now()}`, width: 120, height: 80, source: '', fit: 'contain' }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-400">🖼</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Imagem</div>
                    <div className="text-[10px] text-slate-400">URL estática ou Base64</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>

              <button
                onClick={() => addElement({ type: 'barcode', id: `barcode-${Date.now()}`, width: 100, height: 100, barcodeType: 'qrcode', dataBinding: '' }, currentSection)}
                className="w-full px-2.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 transition text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-300 group-hover:text-indigo-400">▥</span>
                  <div>
                    <div className="text-xs font-medium text-slate-200">Barcode / QR</div>
                    <div className="text-[10px] text-slate-400">Código de barras e QR code</div>
                  </div>
                </div>
                <Icon name="plus" size="xs" className="text-slate-400 group-hover:text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba "Camadas" (Árvore de Bandas e Elementos) */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex-shrink-0 bg-slate-950/30">
            {/* Seletor Rápido de Seções / Bandas Irmãs */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Estrutura de Bandas
              </div>

              {/* 1. Background Layer */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700">
                <button
                  onClick={() => setCurrentSection('bodyBackground')}
                  className={`flex items-center gap-2 text-xs font-medium flex-1 text-left ${currentSection === 'bodyBackground' ? 'text-indigo-400' : 'text-slate-300'}`}
                >
                  <span>🖼</span>
                  <span>Background</span>
                </button>
                <span className="text-[10px] text-slate-400">{template.pageSettings.bodyBackground ? 'Ativo' : 'Vazio'}</span>
              </div>

              {/* 2. Header Band */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700">
                <button
                  onClick={() => setCurrentSection('header')}
                  className={`flex items-center gap-2 text-xs font-medium flex-1 text-left ${currentSection === 'header' ? 'text-indigo-400' : 'text-slate-300'}`}
                >
                  <span>🏷</span>
                  <span>Header</span>
                </button>
                <span className="text-[10px] text-slate-400">{template.pageSettings.header ? `${template.pageSettings.header.height || 60}pt` : 'Off'}</span>
              </div>

              {/* 3. Body Band */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700">
                <button
                  onClick={() => setCurrentSection('body')}
                  className={`flex items-center gap-2 text-xs font-medium flex-1 text-left ${currentSection === 'body' ? 'text-indigo-400' : 'text-slate-300'}`}
                >
                  <span>📄</span>
                  <span>Page Body</span>
                </button>
                <span className="text-[10px] text-indigo-400 font-mono">Fluxo</span>
              </div>

              {/* 4. Summary Band */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700">
                <button
                  onClick={() => setCurrentSection('summary')}
                  className={`flex items-center gap-2 text-xs font-medium flex-1 text-left ${currentSection === 'summary' ? 'text-indigo-400' : 'text-slate-300'}`}
                >
                  <span>📊</span>
                  <span>Summary</span>
                </button>
                <span className="text-[10px] text-slate-400">{template.summaryPage ? 'Ativo' : 'Off'}</span>
              </div>

              {/* 5. Footer Band */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700">
                <button
                  onClick={() => setCurrentSection('footer')}
                  className={`flex items-center gap-2 text-xs font-medium flex-1 text-left ${currentSection === 'footer' ? 'text-indigo-400' : 'text-slate-300'}`}
                >
                  <span>🏷</span>
                  <span>Footer</span>
                </button>
                <span className="text-[10px] text-slate-400">{template.pageSettings.footer ? `${template.pageSettings.footer.height || 40}pt` : 'Off'}</span>
              </div>
            </div>
          </div>

          {/* Containers e Elementos na Seção Ativa */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Elementos em {currentSection.toUpperCase()}
            </span>
            <GroupButton selectedContainerId={selectedContainerId} />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <ElementsList selectedContainerId={selectedContainerId} />
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

  if (!['body', 'header', 'footer', 'summary'].includes(currentSection)) return null

  const getSectionElements = () => {
    if (currentSection === 'header') return template.pageSettings.header?.elements || []
    if (currentSection === 'footer') return template.pageSettings.footer?.elements || []
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
