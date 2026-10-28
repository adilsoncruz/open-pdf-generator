# Spacer Element

The `SpacerElement` (`"type": "spacer"`) defines empty vertical or horizontal spacing in flow layouts, especially within containers or relative positioning flows where dynamic separation between elements is required.

## Features

- ✅ **Flexible Dimensions**: Supports fixed points (`height: 20`) or percentage widths (`"100%"`).
- ✅ **Layout Clearance**: Pushes subsequent flow elements down by its configured height.
- ✅ **Conditional Spacing**: Can be activated or hidden conditionally with `printCondition`.

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"spacer"` |
| `id` | string | ✅ | Unique element identifier |
| `x` | number | ❌ | Horizontal position (default: `0`) |
| `y` | number | ❌ | Vertical position (default: `0`) |
| `width` | number \| string | ❌ | Width in points or percentage (default: `"100%"`) |
| `height` | number | ❌ | Vertical spacing height in points (default: `0`) |
| `printCondition` | string | ❌ | Condition expression to activate spacer |
| `positionMode` | string | ❌ | `"absolute"` or `"relative"` |
| `relativeOffsetY` | number | ❌ | Spacing when placed below preceding flow content |

---

## Example: Vertical Spacing Between Sections

```json
{
  "type": "spacer",
  "id": "section-gap",
  "height": 24,
  "width": "100%"
}
```
