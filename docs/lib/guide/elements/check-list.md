# Checklist Element

The `CheckListElement` renders interactive-looking checklists and task items with checkboxes (rectangle, bordered, or circular). It can be dynamically bound to JSON objects or key-value maps.

## Features

- ✅ **Box Styles**: `RECTANGLE` (square), `BORDERED` (rounded square), `CIRCLE` (circular check)
- ✅ **Key-Value Mapping**: Automatically extracts item label from the map key and checked status from boolean values
- ✅ **Static Tasks**: Define tasks and their initial status directly in the template
- ✅ **Dynamic Data Binding**: Bind to objects like `tasks: { "Task A": true, "Task B": false }`
- ✅ **Visual Fidelity**: Checked items render a crisp vector checkmark
- ✅ **Multi-page Flow**: Automatically breaks across pages when task lists exceed the page

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"check_list"` |
| `id` | string | ✅ | Unique element identifier |
| `x` | number | ✅ | Horizontal position (pt) |
| `y` | number | ✅ | Vertical position (pt) |
| `width` | number / string | ❌ | Width in points or `"100%"` (default: 400) |
| `height` | number | ❌ | Height in points (default: 50) |
| `dataBinding` | string | ❌ | Path to key-value object in payload (e.g. `"tasks"` or `"audit.checklist"`) |
| `items` | object | ❌ | Static map of task labels to boolean status `{ "Item": true }` |
| `checkStyle` | string | ❌ | `"RECTANGLE"` (default), `"BORDERED"`, or `"CIRCLE"` |
| `itemSpacing` | number | ❌ | Vertical spacing between items in points (default: 0) |
| `startY` | number | ❌ | Explicit vertical starting offset in points |
| `style` | object | ❌ | Text & box styles (`fontSize`, `fontFamily`, `color`, `backgroundColor`) |
| `printCondition` | string | ❌ | Dynamic expression determining if the checklist renders |

---

## JSON Examples

### Dynamic Checklist from Payload

```json
{
  "type": "check_list",
  "id": "audit-checklist",
  "x": 40,
  "y": 140,
  "width": 500,
  "dataBinding": "auditTasks",
  "checkStyle": "BORDERED",
  "itemSpacing": 6,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

**Payload Example:**
```json
{
  "auditTasks": {
    "Document inspection verified": true,
    "Safety protocol compliance confirmed": true,
    "Final sign-off approved": false
  }
}
```

### Static Checklist

```json
{
  "type": "check_list",
  "id": "release-checklist",
  "x": 40,
  "y": 280,
  "width": 450,
  "checkStyle": "CIRCLE",
  "items": {
    "Core Kotlin unit tests passing": true,
    "CLI distribution build verified": true,
    "Editor canvas and property inspectors updated": true,
    "Documentation published": false
  },
  "itemSpacing": 4,
  "style": {
    "fontSize": 10,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

---

## Kotlin Programmatic DSL

```kotlin
val template = TemplateBuilder()
    .addCheckList {
        id = "inspection-checklist"
        x = 40f
        y = 120f
        width = 515f
        dataBinding = "inspectionItems"
        checkStyle = CheckStyle.CIRCLE
        itemSpacing = 5f
        style = TextStyle(fontSize = 11f, color = "#0f172a")
    }
    .build()
```
