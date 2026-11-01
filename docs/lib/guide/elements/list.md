# List Element

The `ListElement` renders bulleted, numbered, or styled lists of items with support for dynamic data binding, multi-line row wrapping, custom spacing, and automatic page flow.

## Features

- ✅ **List Styles**: `BULLETED` (•), `NUMBERED` (1, 2, 3), `START` (★), `DASH` (–), `DIAMOND` (◆)
- ✅ **Data Binding**: Bind to arrays of strings or objects (`dataBinding: "items"`)
- ✅ **Static Items**: Define static items directly in the element (`items: ["Item 1", "Item 2"]`)
- ✅ **Numbering Control**: Configure `startNumber` (e.g. start at 1, 5, or 10)
- ✅ **Item Spacing**: Fine-tune vertical spacing between items with `itemSpacing`
- ✅ **Multi-line Text**: Automatic row wrapping for long items
- ✅ **Page Flow**: Automatically splits across multiple pages when content exceeds available page height

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"list"` |
| `id` | string | ✅ | Unique element identifier |
| `x` | number | ✅ | Horizontal position (pt) |
| `y` | number | ✅ | Vertical position (pt) |
| `width` | number / string | ❌ | Width in points or `"100%"` (default: 400) |
| `height` | number | ❌ | Height in points (default: 50) |
| `dataBinding` | string | ❌ | Path to dynamic list/array in payload (e.g. `"fruits"` or `"order.items"`) |
| `items` | array | ❌ | Array of static string items (used when data binding is not defined) |
| `listStyle` | string | ❌ | `"BULLETED"` (default), `"NUMBERED"`, `"START"`, `"DASH"`, or `"DIAMOND"` |
| `startNumber` | number | ❌ | Starting index for numbered lists (default: 1) |
| `itemSpacing` | number | ❌ | Vertical spacing between items in points (default: 10) |
| `startY` | number | ❌ | Explicit vertical starting offset in points |
| `style` | object | ❌ | Visual style properties (`fontSize`, `fontFamily`, `color`, `backgroundColor`) |
| `printCondition` | string | ❌ | Dynamic expression determining if the element renders |

---

## JSON Examples

### Dynamic List with Numbering

```json
{
  "type": "list",
  "id": "step-list",
  "x": 40,
  "y": 120,
  "width": 500,
  "dataBinding": "steps",
  "listStyle": "NUMBERED",
  "itemSpacing": 8,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

### Static Bulleted List

```json
{
  "type": "list",
  "id": "features-list",
  "x": 40,
  "y": 250,
  "width": "100%",
  "listStyle": "BULLETED",
  "items": [
    "High performance rendering with OpenPDF",
    "Multi-page automatic flow and layout",
    "Pixel-perfect visual editor and CLI"
  ],
  "itemSpacing": 6,
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

---

## Kotlin Programmatic DSL

```kotlin
val template = TemplateBuilder()
    .addList {
        id = "terms-list"
        x = 40f
        y = 150f
        width = 515f
        dataBinding = "terms"
        listStyle = ListMode.BULLETED
        itemSpacing = 8f
        style = TextStyle(fontSize = 10f, color = "#475569")
    }
    .build()
```
