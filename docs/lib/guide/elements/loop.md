# Loop Element

The `LoopElement` allows repeating a set of elements for each item in an array, facilitating the generation of dynamic lists and tables.

## When to Use

Use `LoopElement` for:
- ✅ Rendering item lists
- ✅ Creating custom layouts (alternative to tables)
- ✅ Repeating element groups with different data
- ✅ Building reports with repetitive sections

::: tip Tip
For simple tabular data, use [`TableElement`](/lib/guide/elements/table). For more complex layouts, use `LoopElement`.
:::

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"loop"` |
| `id` | string | ✅ | Unique identifier |
| `dataBinding` | string | ✅ | Path to the array |
| `elements` | array | ✅ | Elements to repeat |
| `x` | number | ❌ | Initial X position |
| `y` | number | ❌ | Initial Y position |
| `width` | number | ❌ | Container width (for `100%` in children) |
| `height` | number | ❌ | Height of each item (for `100%` in children) |
| `itemSpacing` | number | ❌ | Vertical spacing between items (default: 0) |

::: tip New Feature
`width` and `height` allow child elements to use `"100%"` to occupy all available loop space!
:::

---

## Special Variables and Data Binding

Inside a loop, you can access item properties in two ways:

| Form | Example | Description |
|------|---------|-------------|
| Direct | `name` | Direct property access (recommended) |
| Prefixed | `$item.name` | Explicit item access |
| Index | `$index` | Item index (0-based) |

::: tip Recommendation
Use **direct** property access (without `$item.`), like table columns. It's simpler and cleaner!
:::

---

## Basic Example

```json
{
  "type": "loop",
  "id": "product-list",
  "dataBinding": "products",
  "ySpacing": 25,
  "elements": [
    {
      "type": "text",
      "id": "product-name",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "product-price",
      "x": 300,
      "y": 0,
      "dataBinding": "$item.price | currency:'BRL'",
      "style": {
        "fontSize": 12
      }
    }
  ]
}
```

**Data:**
```json
{
  "products": [
    { "name": "Notebook", "price": 3500.00 },
    { "name": "Mouse", "price": 50.00 },
    { "name": "Keyboard", "price": 150.00 }
  ]
}
```

**Result:**
```
Notebook                              R$ 3,500.00
Mouse                                 R$ 50.00
Keyboard                              R$ 150.00
```

---

## Example with Index

Display item numbering:

```json
{
  "type": "loop",
  "id": "numbered-list",
  "dataBinding": "items",
  "ySpacing": 30,
  "elements": [
    {
      "type": "text",
      "id": "number",
      "x": 50,
      "y": 0,
      "dataBinding": "$index | concat:'. '",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "description",
      "x": 80,
      "y": 0,
      "dataBinding": "$item.description",
      "style": {
        "fontSize": 12
      }
    }
  ]
}
```

**Data:**
```json
{
  "items": [
    { "description": "Prepare documentation" },
    { "description": "Review code" },
    { "description": "Deploy" }
  ]
}
```

**Result:**
```
0. Prepare documentation
1. Review code
2. Deploy
```

::: tip Tip
For index starting at 1, use transformation: `$index | concat:1 | concat:'. '`
:::

---

## Example with Multiple Elements

Create cards for each product:

```json
{
  "type": "loop",
  "id": "product-cards",
  "dataBinding": "products",
  "ySpacing": 120,
  "elements": [
    {
      "type": "rectangle",
      "id": "card-bg",
      "x": 50,
      "y": 0,
      "width": 500,
      "height": 100,
      "style": {
        "fillColor": "#f8f9fa",
        "strokeColor": "#dee2e6",
        "strokeWidth": 1
      }
    },
    {
      "type": "image",
      "id": "product-image",
      "x": 60,
      "y": 10,
      "width": 80,
      "height": 80,
      "dataBinding": "$item.image"
    },
    {
      "type": "text",
      "id": "product-name",
      "x": 160,
      "y": 20,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "product-description",
      "x": 160,
      "y": 45,
      "dataBinding": "$item.description | truncate:60",
      "style": {
        "fontSize": 10,
        "color": "#6c757d"
      }
    },
    {
      "type": "text",
      "id": "product-price",
      "x": 160,
      "y": 70,
      "dataBinding": "$item.price | currency:'BRL'",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold",
        "color": "#28a745"
      }
    }
  ]
}
```

---

## Loop with Conditions

Filter items using `printCondition`:

```json
{
  "type": "loop",
  "id": "in-stock-products",
  "dataBinding": "products",
  "ySpacing": 25,
  "elements": [
    {
      "type": "text",
      "id": "product-info",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "printCondition": "$item.stock > 0"
    }
  ]
}
```

::: tip Alternative
Use `ConditionalElement` inside the loop:

```json
{
  "type": "loop",
  "elements": [
    {
      "type": "conditional",
      "condition": "$item.stock > 0",
      "elements": [
        { "type": "text", "dataBinding": "$item.name" }
      ]
    }
  ]
}
```
:::

---

## Nested Loop

Loops inside loops:

```json
{
  "type": "loop",
  "id": "categories",
  "dataBinding": "categories",
  "ySpacing": 100,
  "elements": [
    {
      "type": "text",
      "id": "category-name",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold"
      }
    },
    {
      "type": "loop",
      "id": "category-products",
      "x": 70,
      "y": 25,
      "dataBinding": "$item.products",
      "ySpacing": 20,
      "elements": [
        {
          "type": "text",
          "id": "product-name",
          "x": 0,
          "y": 0,
          "dataBinding": "$item.name"
        }
      ]
    }
  ]
}
```

**Data:**
```json
{
  "categories": [
    {
      "name": "Electronics",
      "products": [
        { "name": "Notebook" },
        { "name": "Mouse" }
      ]
    },
    {
      "name": "Books",
      "products": [
        { "name": "Clean Code" },
        { "name": "Design Patterns" }
      ]
    }
  ]
}
```

**Result:**
```
Electronics
  Notebook
  Mouse

Books
  Clean Code
  Design Patterns
```

::: warning Attention
In nested loops, `$item` refers to the innermost loop's item. To access the outer loop's item, you'll need to use direct data binding or restructure the data.
:::

---

## Grid Layout

To create grid layouts (multiple columns), calculate X position based on index:

```json
{
  "type": "loop",
  "id": "product-grid",
  "dataBinding": "products",
  "elements": [
    {
      "type": "text",
      "x": "calc($index % 3 * 180 + 50)",
      "y": "calc(floor($index / 3) * 80 + 100)",
      "dataBinding": "$item.name"
    }
  ]
}
```

::: warning Current Limitation
Dynamic position calculation is not natively supported. For grid layouts, you'll need to:
- Pre-process data in the backend
- Or use multiple loops with `slice` on data
:::

---

## Alternating Colors (Zebra Stripes)

To alternate colors between even and odd rows:

**Template:**
```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 30,
  "elements": [
    {
      "type": "rectangle",
      "printCondition": "$index % 2 == 0",
      "style": { "fillColor": "#f8f9fa" }
    },
    {
      "type": "rectangle",
      "printCondition": "$index % 2 != 0",
      "style": { "fillColor": "#ffffff" }
    },
    {
      "type": "text",
      "dataBinding": "$item.text"
    }
  ]
}
```

::: tip Simple Alternative
Use `TableElement` which already supports zebra stripes natively!
:::

---

## Difference between Loop and Table

| Aspect | LoopElement | TableElement |
|--------|-------------|--------------|
| **Structure** | Free layout | Structured table |
| **Columns** | Manual | Automatic |
| **Pagination** | ✅ Automatic | ✅ Automatic |
| **Flexibility** | High | Medium |
| **Complexity** | High | Low |
| **Best for** | Custom layouts | Tabular data |

**Comparative example:**

### With Loop:
```json
{
  "type": "loop",
  "dataBinding": "products",
  "elements": [
    { "type": "text", "x": 50, "dataBinding": "$item.name" },
    { "type": "text", "x": 200, "dataBinding": "$item.price" }
  ]
}
```

### With Table:
```json
{
  "type": "table",
  "dataBinding": "products",
  "columns": [
    { "header": "Name", "dataBinding": "$item.name" },
    { "header": "Price", "dataBinding": "$item.price" }
  ]
}
```

::: tip Recommendation
- Use **Table** for simple tabular data
- Use **Loop** for complex or custom layouts
:::

---

## Performance

::: tip Optimization
- Avoid very long loops (> 100 items)
- For large volumes, consider paginating data
- Nested loops multiply processing
- Use `printCondition` to filter unnecessary items
:::

---

## Automatic Pagination

::: tip New in v1.1
LoopElement now supports **automatic pagination**! When loop items exceed available page space, a new page is automatically created.
:::

### How It Works

1. The loop calculates each item's height based on child elements
2. Checks if the next item fits on the current page
3. If it doesn't fit, creates a new page and continues the loop
4. Header and footer are automatically repeated on each page

### Example with Many Items

```json
{
  "type": "loop",
  "id": "items-list",
  "dataBinding": "items",
  "x": 50,
  "y": 100,
  "width": 500,
  "height": 50,
  "itemSpacing": 10,
  "elements": [
    {
      "type": "rectangle",
      "x": 0,
      "y": 0,
      "width": "100%",
      "height": "100%",
      "style": { "fillColor": "#f3f4f6" }
    },
    {
      "type": "text",
      "x": 10,
      "y": 15,
      "dataBinding": "name"
    }
  ]
}
```

---

## Limitations

- ❌ Positions are fixed (no dynamic calculation)
- ❌ Nested loop doesn't directly access parent loop item

---

## Use Cases

### Participant List

```json
{
  "type": "loop",
  "dataBinding": "participants",
  "ySpacing": 35,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name | capitalize",
      "style": { "fontSize": 12, "fontWeight": "bold" }
    },
    {
      "type": "text",
      "y": 15,
      "dataBinding": "$item.email | lowerCase",
      "style": { "fontSize": 10, "color": "#6c757d" }
    }
  ]
}
```

### Invoice Items

```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 50,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.code | padLeft:6:'0' | prefix:'#'",
      "style": { "fontFamily": "monospace" }
    },
    {
      "type": "text",
      "x": 100,
      "dataBinding": "$item.description"
    },
    {
      "type": "text",
      "x": 350,
      "dataBinding": "$item.quantity | suffix:' un.'"
    },
    {
      "type": "text",
      "x": 450,
      "dataBinding": "$item.total | currency:'BRL'",
      "style": { "fontWeight": "bold" }
    }
  ]
}
```

---

## Next Steps

- [TableElement](/lib/guide/elements/table) - Alternative for tabular data
- [Conditional](/lib/guide/elements/conditional) - Combine loops with conditions
- [Transformations](/lib/guide/transformations) - Format data in loops
- [Examples](/lib/examples/) - See loops in action

