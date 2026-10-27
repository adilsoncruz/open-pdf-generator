import { useState, useMemo } from 'react'
import { useTemplateStore, type ElementLocation } from '../../../store/templateStore'
import { PALETTE_CATEGORIES, type PaletteItemConfig, type PaletteCategory } from './paletteConfig'
import { PaletteItem } from './PaletteItem'

export interface ElementsPaletteProps {
  currentSection: ElementLocation
  categories?: PaletteCategory[]
}

export function ElementsPalette({
  currentSection,
  categories = PALETTE_CATEGORIES,
}: ElementsPaletteProps) {
  const { addElement } = useTemplateStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return categories

    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const matchLabel = item.label.toLowerCase().includes(query)
          const matchTitle = item.title.toLowerCase().includes(query)
          const matchType = item.type.toLowerCase().includes(query)
          const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(query))
          return matchLabel || matchTitle || matchType || matchKeywords
        }),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [categories, searchTerm])

  const handleAdd = (item: PaletteItemConfig) => {
    addElement(item.createElement(), currentSection)
  }

  return (
    <div className="p-2.5 space-y-2.5 border-b border-slate-800/80 shrink-0">
      {/* Barra de busca */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar elementos..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-md pl-7 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
        <svg
          className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1"
            title="Limpar busca"
            aria-label="Limpar busca"
          >
            ×
          </button>
        )}
      </div>

      {/* Categorias e Itens */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500">
          Nenhum elemento encontrado
        </div>
      ) : (
        filteredCategories.map((category) => (
          <div key={category.id}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-0.5">
              {category.name}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {category.items.map((item) => (
                <PaletteItem
                  key={item.id}
                  item={item}
                  onAdd={() => handleAdd(item)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
