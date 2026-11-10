import { useTemplateStore, type Element, type ElementGroup, flattenElements } from '../../../store/templateStore'
import { Icon } from '../../atoms'
import { useTranslation } from '../../../i18n'

export function GroupPropertiesPanel({ 
  group, 
  location 
}: { 
  group: ElementGroup; 
  location: 'body' | 'header' | 'footer' | 'bodyBackground' | 'summary' 
}) {
  const { t } = useTranslation()
  const { updateGroup, deleteGroup, selectGroup, template } = useTemplateStore()
  
  // Buscar elementos do grupo (incluindo filhos de container)
  const groupElements = (() => {
    let allElements: Element[] = []
    
    if (location === 'header' && template.pageSettings.header) {
      allElements = template.pageSettings.header.elements
    } else if (location === 'footer' && template.pageSettings.footer) {
      allElements = template.pageSettings.footer.elements
    } else if (location === 'bodyBackground' && template.pageSettings.bodyBackground) {
      allElements = template.pageSettings.bodyBackground.elements
    } else if (location === 'summary' && template.summaryPage) {
      allElements = template.summaryPage.elements
    } else {
      allElements = template.page || []
    }
    
    const flat = flattenElements(allElements)
    return flat.filter(el => group.elementIds.includes(el.id))
  })()
  
  return (
    <div className="w-[300px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          <h2 className="text-sm font-semibold text-slate-200">Propriedades do Grupo</h2>
        </div>
        <button
          onClick={() => selectGroup(null)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          title="Fechar"
        >
          <Icon name="close" size="xs" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Identificação / Nome */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">Nome do Grupo</span>
            <span className="text-[10px] text-slate-500 font-mono">#{group.id}</span>
          </div>
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-purple-500 transition">
            <input
              type="text"
              value={group.name}
              onChange={(e) => updateGroup(group.id, { name: e.target.value }, location)}
              className="w-full bg-transparent text-slate-200 text-xs focus:outline-none"
              placeholder="Nome do grupo..."
            />
          </div>
        </div>

        {/* Print Condition */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">Condição de Impressão</span>
            <span className="text-[10px] text-purple-400 font-mono">printCondition</span>
          </div>
          <textarea
            value={group.printCondition || ''}
            onChange={(e) => updateGroup(group.id, { printCondition: e.target.value || undefined }, location)}
            placeholder="Ex: invoice.total > 1000"
            rows={3}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-500 transition resize-none"
          />
          <div className="mt-1.5 p-2 rounded bg-slate-950/50 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium">Expressões suportadas na lib:</div>
            <div className="font-mono text-purple-300">• invoice.total &gt; 1000</div>
            <div className="font-mono text-purple-300">• status == 'APROVADO'</div>
            <div className="font-mono text-purple-300">• _pageNumber == 1</div>
            <div className="font-mono text-purple-300">• tipo in ['A', 'B']</div>
            <div className="text-slate-500 italic">Deixe vazio para imprimir sempre.</div>
          </div>
        </div>

        {/* Elementos do Grupo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300">Elementos no Grupo</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono">
              {groupElements.length} itens
            </span>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {groupElements.map((element) => (
              <div
                key={element.id}
                className="px-2.5 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs flex items-center justify-between"
              >
                <div className="truncate flex-1 min-w-0 pr-2">
                  <div className="font-mono text-slate-200 text-[11px] truncate">#{element.id}</div>
                  <div className="text-[9px] text-slate-500 uppercase">{element.type}</div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {Math.round(element.x ?? 0)},{Math.round(element.y ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ação Desagrupar */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              deleteGroup(group.id, location)
              selectGroup(null)
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Icon name="ungroup" size="xs" />
            <span>{t.properties.ungroupElements}</span>
          </button>
          <p className="text-[10px] text-slate-500 mt-1.5 text-center">
            {t.properties.ungroupNotice}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Component to display and edit summary page properties
 */

