# Watermark

The PDF Generator supports text and image watermarks configured inside `pageSettings`. Watermarks can be applied across all pages with custom opacity, rotation, and conditional rendering.

## Features

- ✅ **Text & Image Types**: Diagonal text stamps (e.g. `CONFIDENTIAL`, `DRAFT`) or company logo images.
- ✅ **Dynamic Data Binding**: Bind watermark text to template data variables.
- ✅ **Layer Ordering**: Choose whether the watermark is printed in the background (`onTop: false`) or over content (`onTop: true`).
- ✅ **Conditional Watermarks**: Use `printCondition` to display only under specific environments (e.g., status is `draft` or `preview`).

---

## Configuration Properties

Configured under `template.pageSettings.watermark`:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | `"text"` | Watermark type: `"text"` or `"image"` |
| `text` | string | `null` | Static watermark text |
| `dataBinding` | string | `null` | Variable path for dynamic text (e.g. `"docStatus"`) |
| `imageSource` | string | `null` | Image path or base64 data URL for image watermarks |
| `fontName` | string | `"Helvetica"` | Font family for text watermarks |
| `fontSize` | number | `60` | Font size in points |
| `fontStyle` | string | `"bold"` | `"normal"`, `"bold"`, or `"italic"` |
| `color` | string | `"#CCCCCC"` | Hex color code |
| `opacity` | number | `0.2` | Transparency level from `0.0` (invisible) to `1.0` (opaque) |
| `rotation` | number | `45` | Angle of rotation in degrees |
| `onTop` | boolean | `false` | When `true`, renders on top of page elements; when `false`, renders behind |
| `repeat` | boolean | `false` | When `true`, repeats watermark across the page in an alternating grid |
| `spacingX` | number | `null` | Horizontal spacing between repeated watermarks in points |
| `spacingY` | number | `null` | Vertical spacing between repeated watermarks in points |
| `printCondition` | string | `null` | Boolean expression deciding if watermark is rendered |

---

## Example: Draft Text Watermark

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
    "watermark": {
      "type": "text",
      "text": "DRAFT",
      "fontSize": 72,
      "color": "#DC2626",
      "opacity": 0.15,
      "rotation": 45,
      "printCondition": "status == 'draft'"
    }
  },
  "page": []
}
```

---

## Example: Dynamic Watermark with Data Binding

```json
{
  "watermark": {
    "type": "text",
    "dataBinding": "watermarkLabel",
    "fontSize": 54,
    "color": "#64748B",
    "opacity": 0.2,
    "rotation": -30
  }
}
```

---

## Example: Repeated Watermark (Tiled Pattern)

To tile a security stamp diagonally across the entire page:

```json
{
  "watermark": {
    "type": "text",
    "text": "CONFIDENTIAL",
    "fontSize": 32,
    "color": "#94A3B8",
    "opacity": 0.12,
    "rotation": 45,
    "repeat": true,
    "spacingX": 200,
    "spacingY": 140
  }
}
```
