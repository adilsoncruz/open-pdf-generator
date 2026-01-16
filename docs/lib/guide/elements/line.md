# Line Element

The `LineElement` draws straight lines (horizontal, vertical, or diagonal) for dividers, underlines, and decorations.

## Features

- ✅ **Any direction**: Horizontal, vertical, or diagonal
- ✅ **Various styles**: Solid, dashed, dotted
- ✅ **Customizable thickness**: From hairline to thick lines
- ✅ **Custom patterns**: Flexible dash patterns
- ✅ **Lightweight and fast**: Instant rendering

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"line"` |
| `id` | string | ✅ | Unique identifier |
| `x` | number | ✅ | Start X position |
| `y` | number | ✅ | Start Y position |
| `x2` | number | ✅ | End X position |
| `y2` | number | ✅ | End Y position |
| `style` | object | ❌ | Line styles |
| `printCondition` | string | ❌ | Condition to render |

---

## Styles

```json
{
  "style": {
    "color": "#9ca3af",
    "width": 1,
    "penStyle": "solid",
    "dashPattern": null
  }
}
```

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `color` | hex | Line color | `#000000` |
| `width` | number | Thickness in points | `1` |
| `penStyle` | string | Style: `solid`, `dashed`, `dotted` | `solid` |
| `dashPattern` | array | Custom pattern `[dash, gap]` | `null` |

::: tip Tip
`penStyle` has priority over `dashPattern`. Use one or the other.
:::

---

## Basic Example

### Horizontal Line

```json
{
  "type": "line",
  "id": "divider",
  "x": 50,
  "y": 300,
  "x2": 545,
  "y2": 300,
  "style": {
    "color": "#d1d5db",
    "width": 1
  }
}
```

### Vertical Line

```json
{
  "type": "line",
  "id": "separator",
  "x": 300,
  "y": 100,
  "x2": 300,
  "y2": 700,
  "style": {
    "color": "#9ca3af",
    "width": 0.5
  }
}
```

### Diagonal Line

```json
{
  "type": "line",
  "id": "diagonal",
  "x": 50,
  "y": 50,
  "x2": 200,
  "y2": 150,
  "style": {
    "color": "#ef4444",
    "width": 2
  }
}
```

---

## Directions

### Horizontal (→)

```json
{
  "x": 50,
  "y": 300,
  "x2": 545,
  "y2": 300
}
```

`y` equal, `x2 > x`

---

### Vertical (↓)

```json
{
  "x": 300,
  "y": 100,
  "x2": 300,
  "y2": 700
}
```

`x` equal, `y2 > y`

---

### Diagonal (↘)

```json
{
  "x": 50,
  "y": 50,
  "x2": 200,
  "y2": 200
}
```

`x2 > x` and `y2 > y`

---

### Inverse Diagonal (↙)

```json
{
  "x": 200,
  "y": 50,
  "x2": 50,
  "y2": 200
}
```

`x2 < x` and `y2 > y`

---

## Thickness

### Hairline (Thin)

```json
{
  "style": {
    "width": 0.5
  }
}
```

```
────────────────
```

Ideal for: Delicate details, subtle lines

---

### Normal

```json
{
  "style": {
    "width": 1
  }
}
```

```
────────────────
```

Ideal for: Standard dividers, borders

---

### Medium

```json
{
  "style": {
    "width": 2
  }
}
```

```
━━━━━━━━━━━━━━━━
```

Ideal for: Titles, important sections

---

### Thick

```json
{
  "style": {
    "width": 4
  }
}
```

```
████████████████
```

Ideal for: Major divisions, emphasis

---

## Line Styles

### Solid (Default)

```json
{
  "style": {
    "penStyle": "solid"
  }
}
```

```
────────────────────────
```

---

### Dashed

```json
{
  "style": {
    "penStyle": "dashed"
  }
}
```

```
─── ─── ─── ─── ─── ───
```

Internal pattern: `[6, 3]`

---

### Dotted

```json
{
  "style": {
    "penStyle": "dotted"
  }
}
```

```
· · · · · · · · · · · ·
```

Internal pattern: `[1, 2]`

---

## Custom Patterns (dashPattern)

### Format

```json
{
  "style": {
    "dashPattern": [dash, gap]
  }
}
```

The array defines the pattern of dashes and gaps.

---

### Pattern Examples

#### Short Dashes

```json
{
  "dashPattern": [5, 3]
}
```

```
─── ─── ─── ─── ───
```

---

#### Long Dashes

```json
{
  "dashPattern": [10, 5]
}
```

```
────── ────── ──────
```

---

#### Dots

```json
{
  "dashPattern": [1, 3]
}
```

```
· · · · · · · · · ·
```

---

#### Dash-Dot

```json
{
  "dashPattern": [10, 3, 2, 3]
}
```

```
────── · ────── · ──────
```

---

#### Dash-Dot-Dot

```json
{
  "dashPattern": [10, 3, 2, 3, 2, 3]
}
```

```
────── · · ────── · · ──────
```

---

## Use Cases

### Section Divider

```json
{
  "type": "line",
  "id": "section-divider",
  "x": 50,
  "y": 250,
  "x2": 545,
  "y2": 250,
  "style": {
    "color": "#e5e7eb",
    "width": 1
  }
}
```

---

### Cut Line

```json
{
  "type": "line",
  "id": "cut-line",
  "x": 20,
  "y": 750,
  "x2": 575,
  "y2": 750,
  "style": {
    "color": "#9ca3af",
    "width": 0.5,
    "dashPattern": [10, 5]
  }
}
```

With text:

```json
{
  "type": "text",
  "x": 10,
  "y": 745,
  "value": "✂",
  "style": {
    "fontSize": 12,
    "color": "#9ca3af"
  }
}
```

---

### Underline

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "value": "ANNUAL REPORT 2025",
  "style": {
    "fontSize": 18,
    "fontWeight": "bold"
  }
}
{
  "type": "line",
  "id": "underline",
  "x": 50,
  "y": 122,
  "x2": 250,
  "y2": 122,
  "style": {
    "color": "#2563eb",
    "width": 2
  }
}
```

---

### Manual Grid / Table

```json
{
  "elements": [
    {
      "type": "line",
      "id": "line-h1",
      "x": 50,
      "y": 200,
      "x2": 545,
      "y2": 200
    },
    {
      "type": "line",
      "id": "line-h2",
      "x": 50,
      "y": 230,
      "x2": 545,
      "y2": 230
    },
    {
      "type": "line",
      "id": "line-v1",
      "x": 50,
      "y": 200,
      "x2": 50,
      "y2": 230
    },
    {
      "type": "line",
      "id": "line-v2",
      "x": 250,
      "y": 200,
      "x2": 250,
      "y2": 230
    },
    {
      "type": "line",
      "id": "line-v3",
      "x": 545,
      "y": 200,
      "x2": 545,
      "y2": 230
    }
  ]
}
```

::: tip Tip
For tables, use [`TableElement`](/lib/guide/elements/table) which is easier!
:::

---

### Box Border

```json
{
  "elements": [
    {
      "type": "line",
      "id": "top",
      "x": 50,
      "y": 100,
      "x2": 250,
      "y2": 100
    },
    {
      "type": "line",
      "id": "bottom",
      "x": 50,
      "y": 200,
      "x2": 250,
      "y2": 200
    },
    {
      "type": "line",
      "id": "left",
      "x": 50,
      "y": 100,
      "x2": 50,
      "y2": 200
    },
    {
      "type": "line",
      "id": "right",
      "x": 250,
      "y": 100,
      "x2": 250,
      "y2": 200
    }
  ]
}
```

::: tip Tip
For rectangles, use [`RectangleElement`](/lib/guide/elements/rectangle) which is simpler!
:::

---

### Arrow (Simulated)

```json
{
  "elements": [
    {
      "type": "line",
      "id": "arrow-body",
      "x": 100,
      "y": 200,
      "x2": 300,
      "y2": 200,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    },
    {
      "type": "line",
      "id": "arrow-tip-1",
      "x": 300,
      "y": 200,
      "x2": 285,
      "y2": 190,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    },
    {
      "type": "line",
      "id": "arrow-tip-2",
      "x": 300,
      "y": 200,
      "x2": 285,
      "y2": 210,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    }
  ]
}
```

---

## Conditions

Show line only under conditions:

```json
{
  "type": "line",
  "x": 50,
  "y": 500,
  "x2": 545,
  "y2": 500,
  "printCondition": "showDivider == true"
}
```

---

## Inside Loops

```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 40,
  "elements": [
    {
      "type": "text",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name"
    },
    {
      "type": "line",
      "x": 50,
      "y": 25,
      "x2": 545,
      "y2": 25,
      "style": {
        "color": "#e5e7eb",
        "width": 0.5
      }
    }
  ]
}
```

Creates a dividing line after each item.

---

## Performance

::: tip Optimization
- Lines are extremely lightweight
- Use freely for dividers and decorations
- Rendering is instant
- No impact on PDF size
:::

---

## Limitations

- ❌ Does not support curves (only straight lines)
- ❌ Does not support native arrows
- ❌ Does not support gradients
- ❌ Does not support shadows
- ❌ Very complex dashed patterns may not render well

---

## Coordinate Calculation

### Full Width Horizontal Line

```json
{
  "x": 30,
  "y": 300,
  "x2": 565,  // 595 (A4) - 30 (margin)
  "y2": 300
}
```

### Full Height Vertical Line

```json
{
  "x": 300,
  "y": 30,
  "x2": 300,
  "y2": 812  // 842 (A4) - 30 (margin)
}
```

---

## Colors

Always use 6-digit hexadecimal format:

```json
✅ "#9ca3af"
✅ "#000000"
✅ "#ff0000"

❌ "#aaa"  // Doesn't work
❌ "gray"  // Doesn't work
❌ "rgb(156,163,175)"  // Doesn't work
```

---

## Design Tips

### Subtle Dividers

```json
{
  "style": {
    "color": "#e5e7eb",
    "width": 0.5
  }
}
```

### Medium Dividers

```json
{
  "style": {
    "color": "#d1d5db",
    "width": 1
  }
}
```

### Strong Dividers

```json
{
  "style": {
    "color": "#9ca3af",
    "width": 2
  }
}
```

---

## Next Steps

- [Rectangle Element](/lib/guide/elements/rectangle) - Alternative for complete borders
- [Text Element](/lib/guide/elements/text) - Combine with underlines
- [Table Element](/lib/guide/elements/table) - Alternative for grids
- [Examples](/lib/examples/) - See Line in action

