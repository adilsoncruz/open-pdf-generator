# Table Element

The `TableElement` renders tabular data with automatic pagination support, fixed headers, and customizable styles.

## Features

- ✅ **Automatic pagination**: Headers repeat on each page
- ✅ **Flexible width**: Supports fixed, percentage, or auto values
- ✅ **Zebra stripes**: Alternating row colors
- ✅ **Customizable styles**: Colors, borders, fonts, alignments
- ✅ **Transformations**: Apply pipes to cell data
- ✅ **Responsive**: Automatic column width adjustment

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"table"` |
| `id` | string | ✅ | Unique identifier |
| `x` | number | ✅ | X position |
| `y` | number | ✅ | Y position (ignored if `paginated=true`) |
| `dataBinding` | string | ✅ | Path to data array |
| `columns` | array | ✅ | Column definitions |
| `width` | number\|string | ❌ | Width (number, "100%", or auto) |
| `paginated` | boolean | ❌ | Automatic pagination (default: `true`) |
| `style` | object | ❌ | Table styles |
| `printCondition` | string | ❌ | Condition to render |

---

## Columns

Each column has the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `header` | string | ✅ | Header text |
| `field` | string | ✅ | Data binding field (can use `$item`) |
| `width` | number | ❌ | Column width |
| `alignment` | string | ❌ | Horizontal alignment (`left`, `center`, `right`) |
| `verticalAlignment` | string | ❌ | Vertical alignment (`top`, `middle`, `bottom`) |
| `headerAlignment` | string | ❌ | Header alignment (overrides `alignment`) |
| `format` | string | ❌ | Format (`text`, `number`, `currency`) |

---

## Basic Example

```json
{
  "type": "table",
  "id": "products-table",
  "x": 30,
  "y": 150,
  "dataBinding": "products",
  "columns": [
    {
      "header": "Code",
      "field": "code",
      "width": 80,
      "alignment": "center"
    },
    {
      "header": "Product",
      "field": "name",
      "width": 200,
      "alignment": "left"
    },
    {
      "header": "Price",
      "field": "price",
      "width": 100,
      "alignment": "right"
    }
  ]
}
```

**Data:**
```json
{
  "products": [
    { "code": "001", "name": "Notebook", "price": 3500.00 },
    { "code": "002", "name": "Mouse", "price": 50.00 },
    { "code": "003", "name": "Keyboard", "price": 150.00 }
  ]
}
```

---

## Column Transformations

Use pipes in `field` to transform data:

```json
{
  "columns": [
    {
      "header": "Name",
      "field": "$item.name | upperCase"
    },
    {
      "header": "Price",
      "field": "$item.price | currency:'BRL'"
    },
    {
      "header": "Date",
      "field": "$item.date | date:'dd/MM/yyyy'"
    },
    {
      "header": "Code",
      "field": "$item.code | padLeft:6:'0'"
    }
  ]
}
```

---

## Table Width

### Fixed Value

```json
{
  "width": 535
}
```

### Percentage

```json
{
  "width": "100%"
}
```

Uses 100% of available width (page minus margins).

### Auto

```json
{
  "width": null
}
```

Or omit the property. Uses sum of column widths.

---

## Pagination

### Automatic (default)

```json
{
  "paginated": true
}
```

- ✅ Table breaks automatically between pages
- ✅ Header repeats on each new page
- ✅ Respects margins and fixed header/footer
- ✅ Recommended for long tables

### Disabled

```json
{
  "paginated": false
}
```

- ⚠️ Uses fixed positioning (X, Y)
- ⚠️ Doesn't break pages automatically
- ⚠️ May be cut at page end
- ✅ Use for small tables or summaries

---

## Styles

### Style Properties

```json
{
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontWeight": "bold",
    "headerAlignment": "center",
    
    "fontSize": 9,
    "cellColor": "#374151",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f3f4f6",
    
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellBorderType": "all",
    
    "cellPadding": 6,
    "rowHeight": 25
  }
}
```

### Header

| Property | Description | Default |
|----------|-------------|---------|
| `headerBackground` | Background color | `#f0f0f0` |
| `headerColor` | Text color | `#000000` |
| `headerFontSize` | Font size | `10` |
| `headerFontWeight` | Font weight | `bold` |
| `headerAlignment` | Alignment | `center` |
| `headerHeight` | Header height | `30` |

### Cells

| Property | Description | Default |
|----------|-------------|---------|
| `fontSize` | Font size | `9` |
| `cellColor` | Text color | `#000000` |
| `cellBackground` | Background color | `#ffffff` |
| `alternateRowBackground` | Alternating color (zebra) | `null` |
| `cellPadding` | Internal spacing | `5` |
| `rowHeight` | Minimum row height | `auto` |

### Borders

| Property | Description | Default |
|----------|-------------|---------|
| `borderColor` | Border color | `#000000` |
| `borderWidth` | Border thickness | `1` |
| `cellBorderType` | Border type | `all` |

#### Border Types

- `all`: Borders on all cells
- `row`: Only horizontal borders
- `cells`: Complete borders on each cell
- `top-bottom`: Only top and bottom borders
- `left-right`: Only left and right borders
- `none`: No borders

---

## Zebra Stripes (Alternating Colors)

```json
{
  "style": {
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f9fafb"
  }
}
```

Even and odd rows will have different colors automatically.

---

## Alignment

### Per Column

```json
{
  "columns": [
    {
      "header": "Code",
      "field": "code",
      "alignment": "center"
    },
    {
      "header": "Price",
      "field": "price",
      "alignment": "right"
    }
  ]
}
```

### Header vs Cells

```json
{
  "header": "Quantity",
  "field": "qty",
  "alignment": "right",
  "headerAlignment": "center"
}
```

- Header centered
- Cells right-aligned

---

## Complete Example: Invoice

```json
{
  "type": "table",
  "id": "invoice-items",
  "x": 30,
  "y": 200,
  "width": "100%",
  "dataBinding": "items",
  "paginated": true,
  "columns": [
    {
      "header": "Code",
      "field": "$item.code | padLeft:6:'0'",
      "width": 60,
      "alignment": "center"
    },
    {
      "header": "Product Description",
      "field": "$item.description | capitalize",
      "width": 220,
      "alignment": "left"
    },
    {
      "header": "Qty.",
      "field": "$item.quantity",
      "width": 50,
      "alignment": "center"
    },
    {
      "header": "Unit",
      "field": "$item.unit | upperCase",
      "width": 50,
      "alignment": "center"
    },
    {
      "header": "Unit Price",
      "field": "$item.unitPrice | currency:'BRL'",
      "width": 80,
      "alignment": "right"
    },
    {
      "header": "Total",
      "field": "$item.total | currency:'BRL'",
      "width": 75,
      "alignment": "right"
    }
  ],
  "style": {
    "headerBackground": "#1e40af",
    "headerColor": "#ffffff",
    "headerFontSize": 9,
    "headerFontWeight": "bold",
    "headerAlignment": "center",
    "headerHeight": 25,
    
    "fontSize": 8,
    "cellColor": "#1f2937",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f9fafb",
    
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellBorderType": "all",
    
    "cellPadding": 5
  },
  "printCondition": "items.length > 0"
}
```

---

## Responsive Widths

Column widths are adjusted proportionally if needed:

```json
{
  "width": 500,
  "columns": [
    { "header": "A", "field": "a", "width": 100 },
    { "header": "B", "field": "b", "width": 200 },
    { "header": "C", "field": "c", "width": 100 }
  ]
}
```

- Column sum: 400
- Table width: 500
- Ratio: 500 / 400 = 1.25
- Adjusted widths: 125, 250, 125

---

## Inside Loops

You can nest tables inside loops:

```json
{
  "type": "loop",
  "dataBinding": "orders",
  "ySpacing": 200,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.number | prefix:'Order: #'",
      "style": { "fontSize": 14, "fontWeight": "bold" }
    },
    {
      "type": "table",
      "y": 25,
      "dataBinding": "$item.items",
      "paginated": false,
      "columns": [
        { "header": "Product", "field": "$item.name" },
        { "header": "Quantity", "field": "$item.qty" },
        { "header": "Value", "field": "$item.value | currency:'BRL'" }
      ]
    }
  ]
}
```

::: warning Attention
When inside a loop, use `paginated: false` to avoid unexpected behavior.
:::

---

## Empty Tables

If `dataBinding` returns an empty array:
- ✅ Header is rendered
- ✅ No data rows
- 💡 Use `printCondition` to hide completely

```json
{
  "type": "table",
  "dataBinding": "items",
  "printCondition": "items.length > 0",
  "columns": [...]
}
```

---

## Performance

::: tip Optimization
- Paginated tables are more efficient
- Limit column count (< 10 recommended)
- Use `truncate` on long texts
- Avoid complex transformations in cells
:::

---

## Limitations

- ❌ Does not support merged cells (colspan/rowspan)
- ❌ Does not support sub-headers
- ❌ Row height is uniform
- ❌ Does not support images inside cells (use `text` only)

For more complex layouts, use [LoopElement](/lib/guide/elements/loop).

---

## Comparison: Table vs Loop

| Aspect | TableElement | LoopElement |
|--------|--------------|-------------|
| **Pagination** | Automatic | Manual |
| **Headers** | Yes | No |
| **Zebra stripes** | Yes | Manual |
| **Uniform columns** | Yes | Manual |
| **Free layout** | No | Yes |
| **Complexity** | Low | High |
| **Best for** | Tabular data | Custom layouts |

---

## Use Cases

### Sales Report

```json
{
  "type": "table",
  "dataBinding": "sales",
  "columns": [
    { "header": "Date", "field": "$item.date | date:'dd/MM/yyyy'" },
    { "header": "Salesperson", "field": "$item.salesperson | capitalize'" },
    { "header": "Customer", "field": "$item.customer" },
    { "header": "Amount", "field": "$item.amount | currency:'BRL'" },
    { "header": "Status", "field": "$item.status | upperCase" }
  ],
  "style": {
    "alternateRowBackground": "#f3f4f6"
  }
}
```

### Bank Statement

```json
{
  "type": "table",
  "dataBinding": "transactions",
  "columns": [
    { "header": "Date", "field": "$item.date | date:'dd/MM'" },
    { "header": "Description", "field": "$item.description | truncate:40" },
    { "header": "Debit", "field": "$item.debit | currency:'BRL'" },
    { "header": "Credit", "field": "$item.credit | currency:'BRL'" },
    { "header": "Balance", "field": "$item.balance | currency:'BRL'" }
  ],
  "style": {
    "fontSize": 8,
    "cellPadding": 4,
    "borderWidth": 0.3
  }
}
```

### Attendance List

```json
{
  "type": "table",
  "dataBinding": "participants",
  "columns": [
    { "header": "No.", "field": "$index | concat:1", "width": 40 },
    { "header": "Name", "field": "$item.name", "width": 200 },
    { "header": "ID", "field": "$item.id", "width": 120 },
    { "header": "Signature", "field": "", "width": 175 }
  ],
  "style": {
    "headerBackground": "#1f2937",
    "headerColor": "#ffffff",
    "rowHeight": 35
  }
}
```

---

## Next Steps

- [LoopElement](/lib/guide/elements/loop) - Alternative for complex layouts
- [Transformations](/lib/guide/transformations) - Format cell data
- [Examples](/lib/examples/) - See tables in action
