# Page Break Element

The `PageBreakElement` forces the PDF rendering engine to end the current page immediately and continue rendering subsequent elements on a fresh page.

## Features

- ✅ **Explicit Page Division**: Clean separation between multi-page sections.
- ✅ **Conditional Breaking**: Supports `printCondition` to trigger page breaks only when specific data conditions are met.
- ✅ **Dynamic Flow Support**: Integrates seamlessly with loops, tables, and auto-flowing elements.

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"page_break"` |
| `id` | string | ✅ | Unique element identifier |
| `x` | number | ❌ | X position (default: `0`) |
| `y` | number | ❌ | Y position (default: `0`) |
| `positionMode` | string | ❌ | Usually `"relative"` (default) to break after preceding elements |
| `relativeOffsetY` | number | ❌ | Extra spacing before the break |
| `printCondition` | string | ❌ | Boolean expression to decide whether to trigger the break |

---

## Basic Example

```json
{
  "type": "page_break",
  "id": "break-section-2",
  "positionMode": "relative"
}
```

---

## Conditional Page Break Example

Only split to a new page if the invoice has more than 5 items or if terms and conditions are requested:

```json
{
  "type": "page_break",
  "id": "conditional-terms-break",
  "positionMode": "relative",
  "printCondition": "items.length > 5 || showTerms == true"
}
```
