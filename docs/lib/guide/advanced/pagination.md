# Pagination

The library offers automatic and manual pagination control for multi-page documents.

## Overview

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Page 1        │   │   Page 2        │   │   Page 3        │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │   Header    │ │   │ │   Header    │ │   │ │   Header    │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
│                 │   │                 │   │                 │
│  Table Pt 1     │   │  Table Pt 2     │   │  Table Pt 3     │
│  ───────────    │   │  ───────────    │   │  ───────────    │
│  row 1          │   │  row 21         │   │  row 41         │
│  row 2          │   │  row 22         │   │  row 42         │
│  ...            │   │  ...            │   │  ...            │
│  row 20         │   │  row 40         │   │  row 50         │
│                 │   │                 │   │                 │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │   Footer    │ │   │ │   Footer    │ │   │ │   Footer    │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## Automatic Pagination

### Tables

Tables with `paginated: true` break automatically:

```json
{
  "type": "table",
  "id": "product-list",
  "dataBinding": "products",
  "paginated": true,
  "columns": [...]
}
```

**Behavior:**
- ✅ Automatic break when reaching end of usable area
- ✅ Table header repeats on each page
- ✅ Respects `fixedHeader` and `fixedFooter`
- ✅ Rows are not cut in the middle

### Values for `paginated`

| Value | Behavior |
|-------|----------|
| `true` | Automatic pagination (recommended) |
| `false` | Fixed position, no break |
| `null` (omitted) | Default: `true` |

---

## Page Variables

Use these variables in any text:

| Variable | Description | Example |
|----------|-------------|---------|
| <code v-pre>{{pageNumber}}</code> | Current page | 1, 2, 3... |
| <code v-pre>{{totalPages}}</code> | Total pages | 10 |

### Usage Examples

```json
{
  "type": "text",
  "value": "Page {{pageNumber}}",
  "style": { "fontSize": 9 }
}
```

**Result:** `Page 3`

```json
{
  "type": "text",
  "value": "{{pageNumber}} of {{totalPages}}",
  "style": { "fontSize": 9 }
}
```

**Result:** `3 of 10`

```json
{
  "type": "text",
  "value": "Sheet {{pageNumber}}/{{totalPages}}",
  "style": { "fontSize": 9 }
}
```

**Result:** `Sheet 3/10`

---

## Print Usable Area

### Calculation

```
Usable area = Page height 
            - Top margin 
            - Bottom margin 
            - Header height 
            - Footer height
```

### Example (A4 Portrait)

```
A4 Page: 842pt height
Margins: 30pt (top) + 30pt (bottom) = 60pt
Header: 80pt
Footer: 50pt

Usable area = 842 - 60 - 80 - 50 = 652pt
```

The table will occupy a maximum of 652pt per page before breaking.

---

## Manual Pagination

For total control, use `paginated: false`:

```json
{
  "type": "table",
  "id": "summary",
  "x": 50,
  "y": 500,
  "paginated": false,
  "dataBinding": "summary",
  "columns": [...]
}
```

**Behavior:**
- Table positioned exactly at (x, y)
- Does not break pages automatically
- May be cut if exceeds page area

::: warning Caution
Use `paginated: false` only for small tables or when you need exact positioning (e.g., summaries, totals).
:::

---

## Table Header on Each Page

With `paginated: true`, the table header repeats automatically:

```json
{
  "type": "table",
  "paginated": true,
  "columns": [
    { "header": "Code", "field": "$item.code" },
    { "header": "Description", "field": "$item.description" },
    { "header": "Value", "field": "$item.value" }
  ]
}
```

**Page 1:**
```
┌─────────┬───────────────┬─────────┐
│ Code    │ Description   │ Value   │  ← Header
├─────────┼───────────────┼─────────┤
│ 001     │ Product A     │ $100    │
│ 002     │ Product B     │ $200    │
│ ...     │ ...           │ ...     │
└─────────┴───────────────┴─────────┘
```

**Page 2:**
```
┌─────────┬───────────────┬─────────┐
│ Code    │ Description   │ Value   │  ← Header repeats
├─────────┼───────────────┼─────────┤
│ 021     │ Product U     │ $500    │
│ 022     │ Product V     │ $600    │
│ ...     │ ...           │ ...     │
└─────────┴───────────────┴─────────┘
```

---

## Page Numbering in Footer

### Complete Example

```json
{
  "fixedFooter": {
    "height": 40,
    "elements": [
      {
        "type": "line",
        "x": 0,
        "y": 5,
        "x2": 535,
        "y2": 5,
        "style": {
          "color": "#e5e7eb",
          "width": 0.5
        }
      },
      {
        "type": "text",
        "x": 0,
        "y": 15,
        "value": "Confidential document",
        "style": {
          "fontSize": 8,
          "color": "#9ca3af"
        }
      },
      {
        "type": "text",
        "x": 480,
        "y": 15,
        "value": "Page {{pageNumber}} of {{totalPages}}",
        "style": {
          "fontSize": 8,
          "color": "#6b7280"
        }
      }
    ]
  }
}
```

---

## Elements That Affect Pagination

### Paginated Elements

| Element | Pagination |
|---------|------------|
| Table (`paginated: true`) | ✅ Automatic |
| Table (`paginated: false`) | ❌ Manual |
| Loop | ❌ Does not paginate automatically |
| Text, Image, Rectangle, Line | ❌ Fixed position |

### Impact of fixedHeader/Footer

```
Without header/footer:
┌─────────────────────────────────┐
│ ← Top margin (30pt)             │
│                                 │
│        Full usable area         │
│           (782pt)               │
│                                 │
│ ← Bottom margin (30pt)          │
└─────────────────────────────────┘

With header (80pt) and footer (50pt):
┌─────────────────────────────────┐
│ ← Top margin (30pt)             │
│ ┌─────────────────────────────┐ │
│ │      Header (80pt)          │ │
│ └─────────────────────────────┘ │
│                                 │
│        Reduced usable area      │
│           (652pt)               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      Footer (50pt)          │ │
│ └─────────────────────────────┘ │
│ ← Bottom margin (30pt)          │
└─────────────────────────────────┘
```

---

## Force New Page

Currently there's no native support for forcing page breaks. Alternatives:

### 1. Split Data

Process data beforehand and create separate templates:

```kotlin
val data1 = data.filter { /* first half */ }
val data2 = data.filter { /* second half */ }

generator.generate(template, data1, File("part1.pdf"))
generator.generate(template, data2, File("part2.pdf"))

// Concatenate PDFs if needed
```

### 2. Use Multiple Tables

```json
{
  "elements": [
    {
      "type": "table",
      "dataBinding": "section1",
      "paginated": true
    },
    {
      "type": "table",
      "dataBinding": "section2",
      "paginated": true
    }
  ]
}
```

Each table can start on a new page if the previous one takes enough space.

---

## Performance

### Optimization Tips

::: tip Optimization
1. **Limit rows per page**: Avoid tables with thousands of rows
2. **Pre-calculate totals**: Don't use heavy transformations in each cell
3. **Image cache**: Headers with images are cached automatically
4. **Avoid large loops**: Prefer tables for tabular data
:::

### Page Estimation

```kotlin
val rowsPerPage = (usableArea / rowHeight).toInt()
val totalPages = ceil(totalRows / rowsPerPage)
```

---

## Practical Examples

### Report with Many Data

```json
{
  "fixedHeader": {
    "height": 60,
    "elements": [
      {
        "type": "text",
        "value": "Sales Report - 2025"
      }
    ]
  },
  "fixedFooter": {
    "height": 30,
    "elements": [
      {
        "type": "text",
        "value": "{{pageNumber}}/{{totalPages}}"
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "dataBinding": "sales",
      "paginated": true,
      "columns": [
        { "header": "Date", "field": "$item.date | date:'dd/MM/yyyy'" },
        { "header": "Customer", "field": "$item.customer" },
        { "header": "Value", "field": "$item.value | currency:'BRL'" }
      ]
    }
  ]
}
```

### Invoice with Items

```json
{
  "fixedHeader": {
    "height": 120,
    "elements": [...]
  },
  "fixedFooter": {
    "height": 80,
    "elements": [
      {
        "type": "text",
        "value": "Access key: {{invoice.key}}"
      },
      {
        "type": "barcode",
        "barcodeType": "qrcode",
        "dataBinding": "invoice.qrcode"
      },
      {
        "type": "text",
        "value": "Sheet {{pageNumber}} of {{totalPages}}"
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "dataBinding": "invoice.items",
      "paginated": true
    }
  ]
}
```

---

## Limitations

- ❌ Does not support forced page break
- ❌ Loop does not paginate automatically
- ❌ Long text does not break between pages
- ❌ Images do not break between pages
- ❌ Does not support "keep together" (keep elements together)

---

## Next Steps

- [Header & Footer](/lib/guide/advanced/header-footer) - Fixed headers and footers
- [Table Element](/lib/guide/elements/table) - Paginated table details
- [Performance](/lib/guide/advanced/performance) - Optimization for large volumes

