# ⌨️ Keyboard Shortcuts - Desktop App

## 📄 File

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+N` / `Cmd+N` | **New** | Creates a new template (confirms if there are unsaved changes) |
| `Ctrl+O` / `Cmd+O` | **Open** | Opens an existing template file |
| `Ctrl+S` / `Cmd+S` | **Save** | Saves the current template (if file already exists) |
| `Ctrl+Shift+S` / `Cmd+Shift+S` | **Save As** | Saves the template with a new name |
| `Ctrl+Q` / `Cmd+Q` | **Quit** | Closes the application |

## ✏️ Edit

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Z` / `Cmd+Z` | **Undo** | Undoes the last action |
| `Ctrl+Y` / `Cmd+Y` | **Redo** | Redoes the last undone action |
| `Delete` or `Backspace` | **Delete Element** | 🆕 Removes the selected element |
| `Ctrl+X` / `Cmd+X` | **Cut** | Cuts the selected text |
| `Ctrl+C` / `Cmd+C` | **Copy** | Copies the selected text |
| `Ctrl+V` / `Cmd+V` | **Paste** | Pastes the copied text |
| `Ctrl+A` / `Cmd+A` | **Select All** | Selects all text |

## 👁️ View

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+R` / `Cmd+R` | **Reload** | Reloads the application |
| `Ctrl+Shift+R` / `Cmd+Shift+R` | **Force Reload** | Reloads ignoring cache |
| `Ctrl+Shift+I` / `Cmd+Option+I` | **Dev Tools** | Opens developer tools |
| `Ctrl++` / `Cmd++` | **Zoom In** | Increases interface zoom |
| `Ctrl+-` / `Cmd+-` | **Zoom Out** | Decreases interface zoom |
| `Ctrl+0` / `Cmd+0` | **Default Zoom** | Resets zoom to 100% |
| `F11` | **Fullscreen** | Toggles fullscreen mode |

## 🪟 Window

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+M` / `Cmd+M` | **Minimize** | Minimizes the window |
| `Ctrl+W` / `Cmd+W` | **Close** | Closes the current window |

---

## 🎯 Usage Tips

### 🗑️ Deleting Elements (NEW!)

**Feature added**: You can now delete elements quickly and intuitively!

**How to use:**
1. Click on an element in the Canvas to select it
2. Press `Delete` or `Backspace`
3. The element will be removed instantly

**Important note:** 
- ✅ Works when an element is selected
- ✅ Also available in menu: **Edit → Delete Element**
- ⚠️ Does not work when typing in input fields (to avoid accidents)

**Alternatives for deleting:**
1. **Delete/Backspace key** (fastest) ⚡
2. **Edit Menu → Delete Element**
3. **✕ button in elements list** (Sidebar)

### ↶ Undo and Redo

- Use `Ctrl+Z` / `Cmd+Z` to undo any action
- Use `Ctrl+Y` / `Cmd+Y` to redo
- Works for all edits, including deleting elements!

### 💾 Auto Save

- The **"• Unsaved"** indicator appears in the toolbar when there are changes
- Use `Ctrl+S` / `Cmd+S` to save quickly
- Always save before closing the app!

### 🎨 Recommended Workflow

1. **Open template:** `Ctrl+O`
2. **Edit elements:**
   - Select in Canvas → Edit properties
   - Drag to move
   - `Delete` to remove
3. **Undo if error:** `Ctrl+Z`
4. **Save frequently:** `Ctrl+S`
5. **Generate PDF:** "🎯 Generate PDF" button in toolbar

---

## 🔧 Technical Implementation

### Delete Element Feature

**Modified files:**
- `src/renderer/App.tsx`: Event listener for Delete/Backspace
- `src/main/index.ts`: Option in Edit menu
- `src/main/preload.ts`: Exposure of `onMenuDelete` event

**Logic:**
```typescript
// Detects Delete or Backspace
if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputField) {
  if (selectedElementId && selectedElementLocation) {
    e.preventDefault()
    deleteElement(selectedElementId, selectedElementLocation)
  }
}
```

**Safety:**
- Checks if target is not an input/textarea to avoid deleting elements while user types
- Only deletes if an element is selected
- Prevents default browser behavior

---

## 📊 Comparison with Other Editors

| Application | Delete | Undo | Save |
|-------------|--------|------|------|
| **PDF Editor (Ours)** | `Delete` / `Backspace` | `Ctrl+Z` | `Ctrl+S` |
| Photoshop | `Delete` | `Ctrl+Z` | `Ctrl+S` |
| Figma | `Delete` | `Ctrl+Z` | `Ctrl+S` |
| Canva | `Delete` | `Ctrl+Z` | `Ctrl+S` |

✅ **Our app follows industry standards!**

---

**The editor is now even more productive and intuitive!** 🚀
