# Link Element

The `LinkElement` (`"type": "link"`) renders a clickable hyperlink in the PDF document. It behaves like a text element with an associated URL annotation that readers can click to open in an external web browser.

## Features

- ✅ **Clickable Hyperlinks**: Embeds native PDF link annotations pointing to a target `url`.
- ✅ **Dynamic or Static Text**: Display label can be static (`value`) or interpolated via `dataBinding`.
- ✅ **Text Styling**: Full font styling support (`fontSize`, `color`, `fontFamily`, `fontWeight`, underline/style).
- ✅ **Conditional Rendering**: Controlled with `printCondition`.

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"link"` |
| `id` | string | ✅ | Unique element identifier |
| `x` | number | ✅ | Horizontal position in points |
| `y` | number | ✅ | Vertical position in points |
| `url` | string | ✅ | The destination URL (e.g. `https://example.com`) |
| `value` | string | ⚠️ | Static text label (required if `dataBinding` not set) |
| `dataBinding` | string | ⚠️ | Dynamic path to label data (required if `value` not set) |
| `width` | number | ❌ | Bounding width in points |
| `height` | number | ❌ | Bounding height in points |
| `style` | object | ❌ | Font and text styling options |
| `printCondition` | string | ❌ | Condition expression to render link |
| `positionMode` | string | ❌ | `"absolute"` or `"relative"` |
| `relativeOffsetY` | number | ❌ | Offset relative to previous flow element |

---

## Example: External Website Link

```json
{
  "type": "link",
  "id": "company-portal",
  "x": 50,
  "y": 700,
  "width": 200,
  "height": 20,
  "value": "Visit our Customer Portal",
  "url": "https://portal.example.com",
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#2563EB",
    "fontWeight": "bold"
  }
}
```

## Example: Dynamic Link with Data Binding

```json
{
  "type": "link",
  "id": "invoice-url",
  "x": 50,
  "y": 720,
  "dataBinding": "customer.website",
  "url": "https://company.org/invoices",
  "style": {
    "fontSize": 10,
    "color": "#4F46E5"
  }
}
```
