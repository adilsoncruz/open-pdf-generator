interface ShortcutItem {
  keys: string[]
  action: string
  description: string
}

interface ShortcutSection {
  title: string
  icon: string
  items: ShortcutItem[]
}

const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: 'Canvas & Selection',
    icon: '🎯',
    items: [
      { keys: ['Click'], action: 'Select element', description: 'Select an element on canvas to edit its properties' },
      { keys: ['Shift', 'Click'], action: 'Multi-select', description: 'Select multiple elements simultaneously' },
      { keys: ['Ctrl / ⌘', 'A'], action: 'Select all', description: 'Select all elements in current section' },
      { keys: ['Esc'], action: 'Deselect', description: 'Clear current element selection' },
      { keys: ['↑', '↓', '←', '→'], action: 'Move (1px)', description: 'Nudge selected element by 1 point/pixel' },
      { keys: ['Shift', '↑ ↓ ← →'], action: 'Move (10px)', description: 'Move selected element faster by 10 points' },
    ],
  },
  {
    title: 'Editing & Clipboard',
    icon: '✂️',
    items: [
      { keys: ['Del / ⌫'], action: 'Delete element', description: 'Remove selected element or group' },
      { keys: ['Ctrl / ⌘', 'C'], action: 'Copy', description: 'Copy selected element to clipboard buffer' },
      { keys: ['Ctrl / ⌘', 'V'], action: 'Paste', description: 'Paste copied element into canvas' },
      { keys: ['Ctrl / ⌘', 'G'], action: 'Group', description: 'Group 2 or more selected elements' },
      { keys: ['Ctrl / ⌘', 'Shift', 'G'], action: 'Ungroup', description: 'Ungroup elements from selected group' },
    ],
  },
  {
    title: 'Document & Actions',
    icon: '⚡',
    items: [
      { keys: ['Ctrl / ⌘', 'S'], action: 'Save template', description: 'Save current template file to disk' },
      { keys: ['Ctrl / ⌘', 'Z'], action: 'Undo', description: 'Undo last editing change' },
      { keys: ['Ctrl / ⌘', 'Y'], action: 'Redo', description: 'Redo previously undone change' },
      { keys: ['Ctrl / ⌘', 'Shift', 'P'], action: 'Toggle preview', description: 'Switch between Canvas and PDF Preview' },
      { keys: ['F1'], action: 'Expressions help', description: 'Open help modal on Expressions tab' },
      { keys: ['F2'], action: 'Conditions help', description: 'Open help modal on Conditions tab' },
    ],
  },
]

export default function HelpShortcutsTab() {
  return (
    <div className="space-y-6">
      {SHORTCUT_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-3">
          <h4 className="text-sm font-semibold theme-text flex items-center gap-2">
            <span>{section.icon}</span>
            {section.title}
          </h4>
          <div className="border theme-border rounded-lg overflow-hidden theme-bg-tertiary">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="border-b theme-border bg-black/5 dark:bg-white/5 text-xs theme-text-muted">
                <tr>
                  <th className="py-2.5 px-4 font-medium w-44">Shortcut</th>
                  <th className="py-2.5 px-4 font-medium w-48">Action</th>
                  <th className="py-2.5 px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {section.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-0.5 text-xs font-mono font-semibold bg-white dark:bg-slate-800 border theme-border rounded shadow-sm text-slate-800 dark:text-slate-200"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4 font-medium theme-text whitespace-nowrap">{item.action}</td>
                    <td className="py-2 px-4 theme-text-secondary text-xs">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
