# Rectangle Element

The `RectangleElement` draws rectangles for backgrounds, borders, dividers, and visual decorations.

## Features

- ✅ **Flexible dimensions**: Absolute or percentage values
- ✅ **Customizable colors**: Fill and border
- ✅ **Rounded corners**: Configurable corner radius
- ✅ **Border styles**: Solid, dashed, dotted
- ✅ **Transparency**: Supports transparent fill or border

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"rectangle"` |
| `id` | string | ✅ | Unique identifier |
| `x` | number | ✅ | X position |
| `y` | number | ✅ | Y position |
| `width` | number\|string | ✅ | Width (number or "100%") |
| `height` | number\|string | ✅ | Height (number or "100%") |
| `style` | object | ❌ | Rectangle styles |
| `printCondition` | string | ❌ | Condition to render |

---

## Styles

```json
{
  "style": {
    "fillColor": "#2563eb",
    "borderColor": "#1e40af",
    "borderWidth": 2,
    "cornerRadius": 8,
    "penStyle": "solid"
  }
}
```

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `fillColor` | hex | Fill color | `null` (transparent) |
| `borderColor` | hex | Border color | `null` |
| `borderWidth` | number | Border thickness | `1` |
| `cornerRadius` | number | Corner radius | `0` (square) |
| `penStyle` | string | Line style | `solid` |

---

## Basic Example

### Simple Rectangle

```json
{
  "type": "rectangle",
  "id": "box",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 100,
  "style": {
    "fillColor": "#dbeafe",
    "borderColor": "#2563eb",
    "borderWidth": 1
  }
}
```

---

## Dimensions

### Absolute Values

```json
{
  "width": 200,
  "height": 100
}
```

Fixed values in points (pt).

---

### Percentage Values

```json
{
  "width": "100%",
  "height": "50%"
}
```

Percentage of container (header, body, or footer).

**Practical example:**
```json
{
  "type": "rectangle",
  "id": "header-background",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 100,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

Fills entire header width with 100pt height.

---

## Colors

### Fill

```json
{
  "style": {
    "fillColor": "#3b82f6"
  }
}
```

Filled rectangle, no border.

---

### Border

```json
{
  "style": {
    "borderColor": "#ef4444",
    "borderWidth": 2
  }
}
```

Transparent rectangle with red 2pt border.

---

### Both

```json
{
  "style": {
    "fillColor": "#fef3c7",
    "borderColor": "#f59e0b",
    "borderWidth": 1
  }
}
```

Light yellow rectangle with orange border.

---

### Transparent

For completely transparent rectangle (position marker):

```json
{
  "style": {
    "fillColor": null,
    "borderColor": null
  }
}
```

---

## Rounded Corners

### Corner Radius

```json
{
  "style": {
    "cornerRadius": 12
  }
}
```

| Value | Result |
|-------|--------|
| `0` | Square corners (default) |
| `4-8` | Slightly rounded |
| `12-16` | Moderately rounded |
| `24+` | Well rounded |
| `width/2` | Perfect circle (if width = height) |

**Visual examples:**

```json
// Square corners
{ "cornerRadius": 0 }
┌────────┐
│        │
└────────┘

// Slightly rounded
{ "cornerRadius": 8 }
╭────────╮
│        │
╰────────╯

// Well rounded
{ "cornerRadius": 20 }
╭────────╮
│        │
╰────────╯

// Pill shape (height/2)
{ "cornerRadius": 25, "height": 50 }
╭───────╮
│       │
╰───────╯
```

---

## Border Styles

### Solid (Default)

```json
{
  "style": {
    "penStyle": "solid"
  }
}
```

```
────────────────
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
─── ─── ─── ───
```

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
· · · · · · · ·
```

---

## Use Cases

### Header Background

```json
{
  "type": "rectangle",
  "id": "header-bg",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 100,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

---

### Information Box

```json
{
  "type": "rectangle",
  "id": "info-box",
  "x": 50,
  "y": 200,
  "width": 495,
  "height": 80,
  "style": {
    "fillColor": "#fef3c7",
    "borderColor": "#f59e0b",
    "borderWidth": 1,
    "cornerRadius": 8
  }
}
```

With overlaid text:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "box",
      "x": 50,
      "y": 200,
      "width": 495,
      "height": 80,
      "style": {
        "fillColor": "#fef3c7",
        "borderColor": "#f59e0b",
        "borderWidth": 1,
        "cornerRadius": 8
      }
    },
    {
      "type": "text",
      "id": "box-text",
      "x": 70,
      "y": 230,
      "value": "⚠️ Attention: Electronic fiscal document",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold",
        "color": "#92400e"
      }
    }
  ]
}
```

---

### Visual Divider

```json
{
  "type": "rectangle",
  "id": "divider",
  "x": 50,
  "y": 300,
  "width": 495,
  "height": 2,
  "style": {
    "fillColor": "#e5e7eb"
  }
}
```

---

### Badge/Tag

```json
{
  "type": "rectangle",
  "id": "vip-badge",
  "x": 450,
  "y": 50,
  "width": 80,
  "height": 30,
  "style": {
    "fillColor": "#dc2626",
    "cornerRadius": 15
  }
}
```

With text:

```json
{
  "type": "text",
  "x": 465,
  "y": 60,
  "value": "VIP",
  "style": {
    "fontSize": 12,
    "fontWeight": "bold",
    "color": "#ffffff"
  }
}
```

---

### Dashed Border (Cut Line)

```json
{
  "type": "rectangle",
  "id": "cut-line",
  "x": 20,
  "y": 750,
  "width": 555,
  "height": 1,
  "style": {
    "borderColor": "#9ca3af",
    "borderWidth": 1,
    "penStyle": "dashed"
  }
}
```

---

### Background with Gradient (Simulated)

Since there's no native gradient support, simulate with multiple rectangles:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 0,
      "y": 0,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#1e40af"
      }
    },
    {
      "type": "rectangle",
      "x": 0,
      "y": 20,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#2563eb"
      }
    },
    {
      "type": "rectangle",
      "x": 0,
      "y": 40,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#3b82f6"
      }
    }
  ]
}
```

---

## Grid/Layout Helper

Use transparent rectangles for layout debugging:

```json
{
  "type": "rectangle",
  "id": "debug-area",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 300,
  "style": {
    "borderColor": "#ff0000",
    "borderWidth": 1,
    "penStyle": "dotted"
  }
}
```

::: tip Debug Tip
Add rectangles with dotted red borders to visualize element areas during development. Remove before production!
:::

---

## Conditions

Show rectangle only under conditions:

```json
{
  "type": "rectangle",
  "style": {
    "fillColor": "#dcfce7",
    "borderColor": "#16a34a"
  },
  "printCondition": "status == 'approved'"
}
```

---

## Overlapping (Z-index)

Rectangles are rendered in the order they appear in the template:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "background",
      "x": 50,
      "y": 100,
      "width": 200,
      "height": 100,
      "style": {
        "fillColor": "#dbeafe"
      }
    },
    {
      "type": "rectangle",
      "id": "foreground",
      "x": 100,
      "y": 150,
      "width": 100,
      "height": 50,
      "style": {
        "fillColor": "#fef3c7"
      }
    }
  ]
}
```

The second rectangle appears on top of the first.

---

## Performance

::: tip Optimization
- Rectangles are very lightweight
- Use freely for backgrounds and dividers
- Prefer rectangles over images when possible
- Rendering is instant
:::

---

## Limitations

- ❌ Does not support native gradients
- ❌ Does not support shadows
- ❌ Does not support transformations (rotate, skew)
- ❌ `cornerRadius` is the same for all corners
- ❌ Does not support multiple borders (double, groove, etc.)

---

## Hexadecimal Colors

Always use 6-digit format:

```json
✅ "#2563eb"
✅ "#ff0000"
✅ "#f3f4f6"

❌ "#fff"  // Doesn't work
❌ "blue"  // Doesn't work
❌ "rgb(255,0,0)"  // Doesn't work
```

---

## Next Steps

- [Line Element](/guide/elements/line) - Lines and dividers
- [Image Element](/guide/elements/image) - Backgrounds with images
- [Text Element](/guide/elements/text) - Overlay text
- [Examples](/examples/) - See Rectangle in action

