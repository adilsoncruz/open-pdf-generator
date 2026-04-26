# Check List Element

The `CheckListElement` renders a check list using a map/object from your data.

## Type

```json
{ "type": "check_list" }
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"check_list"` |
| `id` | string | ✅ | Unique element id |
| `x` | number | ✅ | X position |
| `y` | number | ✅ | Y position |
| `width` | number | ❌ | List width (default: `400`) |
| `height` | number | ❌ | Base height (default: `50`) |
| `dataBinding` | string | ✅ | Path to an object/map in data |
| `itemSpacing` | number | ❌ | Space between items (default: `0`) |
| `checkStyle` | string | ❌ | `RECTANGLE`, `CIRCLE`, `BORDERED` |
| `style` | object | ❌ | Text and checkmark style |
| `positionMode` | string | ❌ | `ABSOLUTE` or `RELATIVE` |
| `relativeOffsetY` | number | ❌ | Vertical offset in `RELATIVE` mode |

## Example

```json
{
  "type": "check_list",
  "id": "requirements",
  "x": 40,
  "y": 180,
  "width": 500,
  "dataBinding": "audit.checks",
  "checkStyle": "RECTANGLE",
  "itemSpacing": 6,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#111827"
  }
}
```

> `dataBinding` must resolve to an object/map (`{ "label": true/false }`).
