# List Element

The `ListElement` renders a vertical list from an array in your data.

## Type

```json
{ "type": "list" }
```

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"list"` |
| `id` | string | ✅ | Unique element id |
| `x` | number | ✅ | X position |
| `y` | number | ✅ | Y position |
| `width` | number | ❌ | List width (default: `400`) |
| `height` | number | ❌ | Base height (default: `50`) |
| `dataBinding` | string | ✅ | Path to an array in data |
| `itemSpacing` | number | ❌ | Space between items (default: `10`) |
| `listStyle` | string | ❌ | `BULLETED`, `NUMBERED`, `DASH`, `DIAMOND`, `START` |
| `style` | object | ❌ | Text style for each item |
| `positionMode` | string | ❌ | `ABSOLUTE` or `RELATIVE` |
| `relativeOffsetY` | number | ❌ | Vertical offset in `RELATIVE` mode |

## Example

```json
{
  "type": "list",
  "id": "features",
  "x": 40,
  "y": 120,
  "width": 500,
  "dataBinding": "product.features",
  "listStyle": "BULLETED",
  "itemSpacing": 8,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#111827"
  }
}
```

> `dataBinding` must resolve to an array.
