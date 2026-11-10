# JSON Templates

Templates are defined in JSON and describe the layout and content of the PDF.

## Basic Structure

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 30,
      "right": 30,
      "bottom": 30,
      "left": 30
    }
  },
  "pageElements": []
}
```

## Page Settings

### Size

| Value | Dimensions |
|-------|------------|
| `A4` | 595 x 842 pt |
| `A3` | 842 x 1191 pt |
| `LETTER` | 612 x 792 pt |
| `LEGAL` | 612 x 1008 pt |

### Orientation

| Value | Description |
|-------|-------------|
| `portrait` | Vertical (default) |
| `landscape` | Horizontal |

### Margins

```json
{
  "margins": {
    "top": 30,
    "right": 30,
    "bottom": 30,
    "left": 30
  }
}
```

All values are in points (pt). 1 inch = 72 pt.

---

## Elements

Elements are the building blocks of your PDF. Each element has:

```json
{
  "type": "text",
  "id": "unique-id",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 50
}
```

### Common Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Element type |
| `id` | string | ✅ | Unique identifier |
| `x` | number | ✅ | X position (from left) |
| `y` | number | ✅ | Y position (from top) |
| `width` | number | ❌ | Width |
| `height` | number | ❌ | Height |
| `printCondition` | string | ❌ | Condition for rendering |

### Available Elements

| Type | Description |
|------|-------------|
| `text` | Static or dynamic text |
| `image` | Images (URL, file, base64) |
| `table` | Tables with pagination |
| `rectangle` | Rectangles and backgrounds |
| `line` | Lines |
| `barcode` | QR Codes and barcodes |
| `conditional` | Conditional groups |
| `loop` | Element repetition |
| `container` | Modular block with child elements, auto-height and borders |
| `rich-text` | Formatted Markdown text (bold, italic) |
| `link` | Clickable links (URL or email) |
| `list` | Bulleted or numbered lists |
| `check-list` | Interactive check lists |
| `spacer` | Vertical layout spacer |

---

## Fixed Header & Footer

```json
{
  "version": "1.0",
  "pageSettings": { ... },
  "fixedHeader": {
    "height": 80,
    "elements": [
      {
        "type": "text",
        "id": "header-title",
        "x": 50,
        "y": 30,
        "value": "Company Name"
      }
    ]
  },
  "fixedFooter": {
    "height": 50,
    "elements": [
      {
        "type": "text",
        "id": "page-number",
        "x": 280,
        "y": 20,
        "dataBinding": "$currentPage | prefix:'Page ' | suffix:' of ' | concat:$totalPages"
      }
    ]
  },
  "pageElements": [ ... ]
}
```

Headers and footers repeat on every page automatically.

---

## Next Steps

- [Data Binding](/lib/guide/data-binding) - Bind dynamic data
- [Elements](/lib/guide/elements/text) - Learn about each element
- [Examples](/lib/examples/) - See practical examples

