# Container Element

The `ContainerElement` acts as a bounding box and relative layout context for multiple child elements. It allows nesting elements, applying background styling and borders, and structuring dynamic document layouts.

## Features

- ✅ **Nested Layouts**: Contains a list of child elements (`text`, `image`, `shape`, etc.) positioned relative to the container.
- ✅ **Dynamic Width & Height**: Supports fixed values (`400`), percentage (`"100%"`), and `autoHeight`.
- ✅ **Styling**: Background color, borders, corner radius, and padding via `style`.
- ✅ **Conditional Rendering**: Supports `printCondition` to show or hide the entire container and its children.
- ✅ **Auto-Height Calculation**: Automatically expands based on its internal content when `autoHeight: true`.

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"container"` |
| `id` | string | ✅ | Unique element identifier |
| `x` | number | ❌ | X position (default: `0`) |
| `y` | number | ❌ | Y position (default: `0`) |
| `width` | number \| string | ❌ | Width in points or percentage like `"100%"` (default: `400`) |
| `height` | number \| string | ❌ | Height in points or percentage (default: `50`) |
| `autoHeight` | boolean | ❌ | Automatically adjust height to content (default: `true`) |
| `heightMode` | string | ❌ | `"auto"` or `"fixed"` (default: `"auto"`) |
| `elements` | array | ✅ | List of child elements inside the container |
| `style` | object | ❌ | Styling: `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius` |
| `printCondition` | string | ❌ | Expression condition to render container |
| `positionMode` | string | ❌ | Position mode (`"absolute"` or `"relative"`) |
| `relativeOffsetY` | number | ❌ | Spacing when placed below preceding flow content |

---

## Example: Card Container with Nested Elements

```json
{
  "type": "container",
  "id": "customer-card",
  "x": 30,
  "y": 120,
  "width": "100%",
  "autoHeight": true,
  "style": {
    "backgroundColor": "#F8FAFC",
    "borderColor": "#E2E8F0",
    "borderWidth": 1,
    "borderRadius": 8
  },
  "elements": [
    {
      "type": "text",
      "id": "card-title",
      "x": 15,
      "y": 15,
      "text": "Customer Information",
      "font": { "size": 12, "style": "bold", "color": "#0F172A" }
    },
    {
      "type": "text",
      "id": "customer-name",
      "x": 15,
      "y": 35,
      "text": "Name: {{customer.name}}",
      "font": { "size": 10, "color": "#334155" }
    },
    {
      "type": "text",
      "id": "customer-email",
      "x": 15,
      "y": 50,
      "text": "Email: {{customer.email}}",
      "font": { "size": 10, "color": "#334155" }
    }
  ]
}
```

---

## Full-Width Background Containers

Containers can also span `100%` width to create section headers, banners, or callout cards:

```json
{
  "type": "container",
  "id": "header-banner",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 60,
  "autoHeight": false,
  "style": {
    "backgroundColor": "#0F172A"
  },
  "elements": [
    {
      "type": "text",
      "id": "banner-text",
      "x": 30,
      "y": 20,
      "text": "ORDER CONFIRMATION",
      "font": { "size": 16, "style": "bold", "color": "#FFFFFF" }
    }
  ]
}
```
