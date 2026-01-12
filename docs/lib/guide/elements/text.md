# Text Element

The `TextElement` renders static or dynamic text with support for data binding, transformations, and advanced styles.

## Features

- ✅ **Data binding**: Link dynamic data
- ✅ **Transformations**: Apply pipes for formatting
- ✅ **Advanced styles**: Font, color, alignment, padding
- ✅ **Multiline**: Text with multiple lines
- ✅ **Indentation**: First line indent
- ✅ **Line height**: Line spacing control

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"text"` |
| `id` | string | ✅ | Unique identifier |
| `x` | number | ✅ | X position |
| `y` | number | ✅ | Y position |
| `width` | number | ❌ | Container width |
| `height` | number | ❌ | Container height |
| `value` | string | ❌ | Static text |
| `dataBinding` | string | ❌ | Path to dynamic data |
| `style` | object | ❌ | Text styles |
| `printCondition` | string | ❌ | Condition to render |
| `positionMode` | string | ❌ | `ABSOLUTE` (default) or `RELATIVE` |
| `relativeOffsetY` | number | ❌ | Y offset when `RELATIVE` |

::: tip Tip
Use `value` for fixed text or `dataBinding` for dynamic text. You can use both with `{{}}` interpolation.
:::

---

## Basic Example

### Static Text

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "value": "Electronic Invoice",
  "style": {
    "fontSize": 18,
    "fontWeight": "bold",
    "color": "#1e40af"
  }
}
```

### Dynamic Text

```json
{
  "type": "text",
  "id": "customer-name",
  "x": 50,
  "y": 150,
  "dataBinding": "customer.name",
  "style": {
    "fontSize": 14
  }
}
```

**Data:**
```json
{
  "customer": {
    "name": "John Smith"
  }
}
```

**Result:** `John Smith`

---

## Data Binding with Interpolation

Mix static text with dynamic data:

```json
{
  "type": "text",
  "value": "Customer: {{customer.name}}",
  "style": {
    "fontSize": 12
  }
}
```

**Result:** `Customer: John Smith`

---

## Transformations (Pipes)

Apply transformations to data:

```json
{
  "type": "text",
  "dataBinding": "customer.name | upperCase"
}
```

**Result:** `JOHN SMITH`

### Multiple Transformations

```json
{
  "dataBinding": "description | trim | truncate:50 | capitalize"
}
```

See [Transformations](/guide/transformations) for the complete list.

---

## Styles

### Style Properties

```json
{
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "fontWeight": "normal",
    "fontStyle": "normal",
    "color": "#000000",
    "backgroundColor": "#f3f4f6",
    "alignment": "left",
    "verticalAlignment": "center",
    "lineHeight": 1.5,
    "multiline": true,
    "firstLineIndent": 20,
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 10,
    "paddingRight": 10
  }
}
```

### Font

| Property | Values | Description |
|----------|--------|-------------|
| `fontSize` | number | Size in points (default: `12`) |
| `fontFamily` | string | `Helvetica`, `Times`, `Courier` |
| `fontWeight` | string | `normal`, `bold` |
| `fontStyle` | string | `normal`, `italic` |

**Font Families:**
- `Helvetica` → Sans-serif, modern (default)
- `Times` → Serif, formal
- `Courier` → Monospace, code

---

### Colors

| Property | Type | Description |
|----------|------|-------------|
| `color` | hex | Text color (default: `#000000`) |
| `backgroundColor` | hex | Background color (optional) |

```json
{
  "style": {
    "color": "#1e40af",
    "backgroundColor": "#dbeafe"
  }
}
```

---

### Alignment

#### Horizontal

| Value | Description |
|-------|-------------|
| `left` | Left aligned (default) |
| `center` | Centered |
| `right` | Right aligned |
| `justify` | Justified |

```json
{
  "style": {
    "alignment": "center"
  }
}
```

#### Vertical

| Value | Description |
|-------|-------------|
| `top` | Top of container |
| `center` | Center (default) |
| `bottom` | Bottom of container |

```json
{
  "style": {
    "verticalAlignment": "top"
  }
}
```

---

### Multiline Text

For text with multiple lines:

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "width": 400,
  "height": 100,
  "value": "This is a long text that will be automatically wrapped into multiple lines within the specified container.",
  "style": {
    "multiline": true,
    "fontSize": 10,
    "lineHeight": 1.5,
    "alignment": "justify"
  }
}
```

**Behavior:**
- Text wraps automatically at `width`
- `lineHeight` controls spacing between lines
- `height` defines maximum container height

---

### Overflow (Height Control)

::: tip New in v1.1
Control how multiline text behaves when it exceeds the defined height.
:::

| Value | Behavior |
|-------|----------|
| `visible` | Text can exceed height (default) |
| `hidden` | Text is clipped at defined height |
| `auto` | Height adjusts to actual content |

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "width": 400,
  "height": 50,
  "dataBinding": "description",
  "style": {
    "multiline": true,
    "overflow": "auto"
  }
}
```

::: warning Important
Use `overflow: auto` when you have an element with `positionMode: RELATIVE` right below. This way the next element will be positioned after the actual text content.
:::

---

### Line Height

```json
{
  "style": {
    "fontSize": 12,
    "lineHeight": 1.5
  }
}
```

- `lineHeight` is a multiplier of `fontSize`
- `1.0` = no extra space
- `1.5` = 50% extra space (recommended)
- `2.0` = double line

---

### First Line Indent

```json
{
  "style": {
    "firstLineIndent": 20,
    "multiline": true
  }
}
```

**Result:**
```
    This is the first paragraph with
indentation on the first line. The following
lines have no indentation.
```

---

### Padding

```json
{
  "style": {
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 10,
    "paddingRight": 10,
    "backgroundColor": "#f3f4f6"
  }
}
```

Useful when combined with `backgroundColor` to create text "boxes".

---

## Practical Examples

### Section Title

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "value": "CUSTOMER DETAILS",
  "style": {
    "fontSize": 14,
    "fontWeight": "bold",
    "color": "#1e40af",
    "letterSpacing": 1
  }
}
```

### Label + Value

```json
{
  "type": "text",
  "x": 50,
  "y": 150,
  "value": "Name: {{customer.name | upperCase}}",
  "style": {
    "fontSize": 10
  }
}
```

### Text with Background

```json
{
  "type": "text",
  "x": 50,
  "y": 200,
  "value": "PAID",
  "style": {
    "fontSize": 12,
    "fontWeight": "bold",
    "color": "#ffffff",
    "backgroundColor": "#10b981",
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 15,
    "paddingRight": 15
  }
}
```

### Justified Paragraph

```json
{
  "type": "text",
  "x": 50,
  "y": 300,
  "width": 500,
  "height": 150,
  "dataBinding": "contract.text",
  "style": {
    "fontSize": 9,
    "multiline": true,
    "alignment": "justify",
    "lineHeight": 1.4,
    "firstLineIndent": 20
  }
}
```

### Currency Value

```json
{
  "type": "text",
  "x": 400,
  "y": 500,
  "dataBinding": "total | currency:'USD'",
  "style": {
    "fontSize": 16,
    "fontWeight": "bold",
    "color": "#059669",
    "alignment": "right"
  }
}
```

### Formatted Date

```json
{
  "type": "text",
  "x": 50,
  "y": 550,
  "dataBinding": "issueDate | date:'MM/dd/yyyy HH:mm'",
  "style": {
    "fontSize": 9,
    "color": "#6b7280"
  }
}
```

---

## Conditions

Render only under conditions:

```json
{
  "type": "text",
  "value": "⚠️ DISCOUNT APPLIED",
  "style": {
    "color": "#dc2626",
    "fontWeight": "bold"
  },
  "printCondition": "discount > 0"
}
```

See [Conditions](/guide/conditions) for more details.

---

## Inside Loops

```json
{
  "type": "loop",
  "dataBinding": "items",
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name | capitalize",
      "style": {
        "fontSize": 10
      }
    }
  ]
}
```

See [Loop Element](/guide/elements/loop) for more details.

---

## Relative Positioning

::: tip New in v1.1
Position elements dynamically based on previous content!
:::

### Position Mode

| Mode | Behavior |
|------|----------|
| `ABSOLUTE` | Fixed position on canvas (default) |
| `RELATIVE` | Position based on previous element |

### Example: Text After Loop

When you have a loop with variable number of items and want to position text after it:

```json
[
  {
    "type": "loop",
    "id": "items",
    "dataBinding": "items",
    "x": 50,
    "y": 100,
    "height": 30,
    "itemSpacing": 5,
    "elements": [...]
  },
  {
    "type": "text",
    "id": "total",
    "x": 50,
    "y": 0,
    "positionMode": "RELATIVE",
    "relativeOffsetY": 20,
    "value": "Total: {{total}}",
    "style": { "fontWeight": "bold" }
  }
]
```

**Behavior:**
- The "Total" text will be positioned 20pt below the last loop item
- Doesn't matter how many items the loop has
- `y` on canvas is ignored when `positionMode: RELATIVE`
- `relativeOffsetY` defines the space between elements

---

## Limitations

- ❌ Does not support rotated text
- ❌ Does not support text shadow
- ❌ Does not support color gradients

---

## Performance

::: tip Optimization
- Short texts are faster
- `multiline: false` is more efficient
- Avoid unnecessary `backgroundColor`
- Font cache is automatic
:::

---

## Next Steps

- [Transformations](/guide/transformations) - Format data
- [Conditions](/guide/conditions) - Conditional rendering
- [Image Element](/guide/elements/image) - Add images
- [Examples](/examples/) - See Text in action
