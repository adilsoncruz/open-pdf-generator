# Elements

Complete reference of all available elements for templates.

---

## Overview

| Element | Description | Data Binding |
|---------|-------------|--------------|
| [TextElement](#textelement) | Static or dynamic text | ✅ |
| [RichTextElement](#richtextelement) | Markdown formatted inline text | ✅ |
| [LinkElement](#linkelement) | Clickable hyperlink annotations | ✅ |
| [ImageElement](#imageelement) | Images (URL, base64) | ✅ |
| [TableElement](#tableelement) | Tables with automatic pagination | ✅ |
| [ContainerElement](#containerelement) | Bounding box for nested child elements | ❌ |
| [RectangleElement](#rectangleelement) | Rectangles and backgrounds | ❌ |
| [LineElement](#lineelement) | Lines and dividers | ❌ |
| [SpacerElement](#spacerelement) | Vertical/horizontal layout spacing | ❌ |
| [BarcodeElement](#barcodeelement) | QR Code and barcodes | ✅ |
| [ConditionalElement](#conditionalelement) | Conditional rendering | ✅ |
| [LoopElement](#loopelement) | Element repetition | ✅ |
| [ListElement](#listelement) | Bulleted or numbered lists | ✅ |
| [CheckListElement](#checklistelement) | Interactive-style task checklists | ✅ |

---

## Common Properties

All elements share these properties:

```json
{
  "type": "text",
  "id": "unique-element",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 50,
  "printCondition": "data.active == true"
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Element type |
| `id` | string | ⚠️ Recommended | Unique identifier |
| `x` | number | ✅ | Horizontal position (pt) |
| `y` | number | ✅ | Vertical position (pt) |
| `width` | number | ⚠️ Depends | Width |
| `height` | number | ⚠️ Depends | Height |
| `printCondition` | string | ❌ | Condition to render |

---

## TextElement

Renders static text or with data binding.

### Properties

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "width": 400,
  "value": "Static Text",
  "dataBinding": "customer.name | uppercase",
  "fontSize": 14,
  "fontFamily": "Helvetica",
  "fontWeight": "bold",
  "fontStyle": "normal",
  "color": "#2563eb",
  "alignment": "left",
  "lineHeight": 1.5
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | - | Static text |
| `dataBinding` | string | - | Data path + pipes |
| `fontSize` | number | 12 | Font size (pt) |
| `fontFamily` | string | Helvetica | Font family |
| `fontWeight` | string | normal | `normal` or `bold` |
| `fontStyle` | string | normal | `normal` or `italic` |
| `color` | string | #000000 | Hexadecimal color |
| `alignment` | string | left | `left`, `center`, `right`, `justify` |
| `lineHeight` | number | 1.2 | Line height |

### Examples

```json
// Static text
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 50,
  "value": "MONTHLY REPORT",
  "fontSize": 24,
  "fontWeight": "bold"
}

// Data binding with transformation
{
  "type": "text",
  "id": "customer",
  "x": 50,
  "y": 100,
  "dataBinding": "order.customer.name | uppercase",
  "fontSize": 14
}

// Inline date
{
  "type": "text",
  "id": "date",
  "x": 50,
  "y": 130,
  "dataBinding": "order.date | date:'MM/dd/yyyy'"
}
```

---

## ImageElement

Renders images from URL or base64.

### Properties

```json
{
  "type": "image",
  "id": "logo",
  "x": 50,
  "y": 50,
  "width": 150,
  "height": 80,
  "source": "https://example.com/logo.png",
  "dataBinding": "company.logo",
  "fit": "contain",
  "alignment": "center"
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `source` | string | - | Static URL or base64 |
| `dataBinding` | string | - | Data path to URL |
| `fit` | string | contain | Fit mode |
| `alignment` | string | center | Alignment |

### Fit Modes

| Mode | Behavior |
|------|----------|
| `contain` | Maintains aspect ratio, fits entirely |
| `cover` | Maintains aspect ratio, fills area |
| `fill` | Stretches to fill |
| `scale-down` | Reduces if necessary |

---

## TableElement

Renders tables with automatic pagination.

### Properties

```json
{
  "type": "table",
  "id": "items",
  "x": 30,
  "y": 200,
  "width": 535,
  "dataBinding": "order.items",
  "columns": [
    {
      "header": "Code",
      "dataBinding": "$item.code",
      "width": 80,
      "alignment": "center"
    },
    {
      "header": "Description",
      "dataBinding": "$item.description",
      "width": 300
    },
    {
      "header": "Value",
      "dataBinding": "$item.value | currency:'USD'",
      "width": 155,
      "alignment": "right"
    }
  ],
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontWeight": "bold",
    "rowFontSize": 9,
    "alternateRowBackground": "#f3f4f6",
    "borderWidth": 0.5,
    "borderColor": "#d1d5db",
    "cellPadding": 5
  }
}
```

### Column

| Property | Type | Description |
|----------|------|-------------|
| `header` | string | Header text |
| `dataBinding` | string | `$item.field` for data |
| `width` | number | Column width |
| `alignment` | string | `left`, `center`, `right` |

### Style

| Property | Type | Description |
|----------|------|-------------|
| `headerBackground` | string | Header background color |
| `headerColor` | string | Header text color |
| `alternateRowBackground` | string | Alternate row color |
| `borderWidth` | number | Border thickness |
| `borderColor` | string | Border color |
| `cellPadding` | number | Cell padding |

---

## RectangleElement

Renders rectangles for backgrounds, borders and decorations.

### Properties

```json
{
  "type": "rectangle",
  "id": "background",
  "x": 0,
  "y": 0,
  "width": 595,
  "height": 100,
  "fillColor": "#2563eb",
  "borderColor": "#1e40af",
  "borderWidth": 2,
  "cornerRadius": 8
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fillColor` | string | - | Fill color |
| `borderColor` | string | - | Border color |
| `borderWidth` | number | 0 | Border thickness |
| `cornerRadius` | number | 0 | Corner radius |

---

## LineElement

Renders horizontal, vertical or diagonal lines.

### Properties

```json
{
  "type": "line",
  "id": "divider",
  "x": 50,
  "y": 200,
  "width": 545,
  "height": 200,
  "color": "#d1d5db",
  "width": 1,
  "dashPattern": [5, 3]
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | number | - | End X |
| `height` | number | - | End Y |
| `color` | string | #000000 | Line color |
| `width` | number | 1 | Thickness |
| `dashPattern` | array | - | Dash pattern [dash, space] |

---

## BarcodeElement

Renders QR Codes and barcodes.

### Properties

```json
{
  "type": "barcode",
  "id": "qrcode",
  "x": 400,
  "y": 650,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "payment.pixCode",
  "errorCorrection": "M"
}
```

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `barcodeType` | string | `qrcode`, `barcode` | Type |
| `dataBinding` | string | - | Data to encode |
| `value` | string | - | Static value |
| `errorCorrection` | string | `L`, `M`, `Q`, `H` | Correction level (QR) |

---

## ConditionalElement

Renders child elements conditionally.

### Properties

```json
{
  "type": "conditional",
  "id": "stock-alert",
  "condition": "product.stock < 10",
  "elements": [
    {
      "type": "rectangle",
      "x": 400,
      "y": 100,
      "width": 120,
      "height": 25,
      "fillColor": "#fef2f2",
      "borderColor": "#f87171"
    },
    {
      "type": "text",
      "x": 410,
      "y": 107,
      "value": "⚠️ Low stock",
      "color": "#dc2626",
      "fontSize": 10
    }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `condition` | string | Boolean expression |
| `elements` | array | Elements to render |

### Operators

- `==`, `!=` - Equality
- `>`, `<`, `>=`, `<=` - Comparison
- `&&`, `||` - Logical
- `in` - Membership

---

## LoopElement

Repeats elements for each item in a list.

### Properties

```json
{
  "type": "loop",
  "id": "product-list",
  "dataBinding": "order.products",
  "x": 50,
  "y": 200,
  "itemHeight": 30,
  "elements": [
    {
      "type": "text",
      "x": 0,
      "y": 0,
      "dataBinding": "$item.name"
    },
    {
      "type": "text",
      "x": 300,
      "y": 0,
      "dataBinding": "$item.value | currency:'USD'"
    }
  ]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `dataBinding` | string | Path to array |
| `itemHeight` | number | Height of each item |
| `elements` | array | Template for each item |

### Special Variables

- `$item` - Current iteration item
- `$index` - Index (0-based)

---

## ContainerElement

Acts as a layout container grouping child elements with background and border styling.

### Properties

```json
{
  "type": "container",
  "id": "card-box",
  "x": 50,
  "y": 100,
  "width": "100%",
  "autoHeight": true,
  "style": {
    "backgroundColor": "#F8FAFC",
    "borderColor": "#CBD5E1",
    "borderWidth": 1,
    "borderRadius": 6
  },
  "elements": []
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `elements` | array | `[]` | List of nested child elements |
| `autoHeight` | boolean | `true` | Automatically adjust container height to contents |
| `heightMode` | string | `auto` | Height sizing mode (`auto` or `fixed`) |
| `pageBreakBefore` | boolean | `false` | When true, renders container on a new page |
| `pageBreakCondition` | string | `null` | Optional expression to conditionally evaluate page break |
| `style` | object | - | Styling (`backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`) |

---

## RichTextElement

Renders formatted inline text with Markdown support (`**bold**`, `*italic*`).

### Properties

```json
{
  "type": "rich_text",
  "id": "notice",
  "x": 50,
  "y": 200,
  "width": 500,
  "value": "Total amount due is **${order.total}**. Please pay before *${order.dueDate}*.",
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#1E293B",
    "alignment": "left"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `value` | string | Markdown-formatted string with optional `${expression}` |
| `dataBinding` | string | Dynamic source containing Markdown text |
| `style` | object | Typography and alignment configuration |

---

## LinkElement

Renders a clickable PDF hyperlink annotation.

### Properties

```json
{
  "type": "link",
  "id": "website-link",
  "x": 50,
  "y": 300,
  "url": "https://example.com",
  "value": "Visit our website",
  "style": {
    "fontSize": 12,
    "color": "#2563EB"
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `url` | string | Destination hyperlink URL |
| `value` | string | Static text label |
| `dataBinding` | string | Dynamic text label |
| `style` | object | Font and color styles |

---

## SpacerElement

Inserts empty vertical or horizontal space in relative flow layouts.

### Properties

```json
{
  "type": "spacer",
  "id": "spacer-1",
  "height": 20,
  "width": "100%"
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `height` | number | `0` | Spacing height in points |
| `width` | number \| string | `"100%"` | Spacing width in points or percentage |

---

## ListElement

Renders bulleted, numbered, or styled lists of items with support for multi-line flow and page splitting.

### Properties

```json
{
  "type": "list",
  "id": "features-list",
  "x": 40,
  "y": 150,
  "width": 500,
  "dataBinding": "features",
  "listStyle": "BULLETED",
  "itemSpacing": 8,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dataBinding` | string | `""` | Path to array in payload |
| `items` | array | `[]` | Static string items fallback |
| `listStyle` | string | `"BULLETED"` | `"BULLETED"`, `"NUMBERED"`, `"START"`, `"DASH"`, `"DIAMOND"` |
| `startNumber` | number | `1` | Starting index for numbered lists |
| `itemSpacing` | number | `10` | Vertical space between items in points |
| `startY` | number | `null` | Optional starting Y offset |

---

## CheckListElement

Renders checklists with customizable checkbox styles (`RECTANGLE`, `BORDERED`, `CIRCLE`).

### Properties

```json
{
  "type": "check_list",
  "id": "tasks-checklist",
  "x": 40,
  "y": 280,
  "width": 500,
  "dataBinding": "tasks",
  "checkStyle": "BORDERED",
  "itemSpacing": 4,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dataBinding` | string | `""` | Path to map `{ "Label": boolean }` |
| `items` | object | `{}` | Static task map `{ "Task": true }` |
| `checkStyle` | string | `"RECTANGLE"` | `"RECTANGLE"`, `"BORDERED"`, `"CIRCLE"` |
| `itemSpacing` | number | `0` | Vertical space between tasks in points |
| `startY` | number | `null` | Optional starting Y offset |

---

## Next Steps

- [JSON Templates](/lib/guide/templates) - Complete structure
- [Data Binding](/lib/guide/data-binding) - Data binding
- [Transformations](/lib/guide/transformations) - Available pipes

