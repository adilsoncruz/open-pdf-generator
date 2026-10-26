import React, { useState } from 'react'
import { useTemplateStore } from '../../store/templateStore'
import { Icon } from '../atoms'

export function HistoryContent() {
  const { 
    history, 
    historyIndex, 
    jumpToHistoryIndex, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    template,
    loadTemplate,
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
      template: JSON.parse(JSON.stringify(template)),
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
    const updated = snapshots.filter((s) => s.id !== id)
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
