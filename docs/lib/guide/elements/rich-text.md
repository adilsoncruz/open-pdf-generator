# Rich Text Element

The `RichTextElement` (`"type": "rich_text"` or `"richText"`) renders styled inline text with lightweight Markdown formatting support, such as bold (`**bold**`) and italic (`*italic*`) styles within the same block.

## Features

- ✅ **Inline Markdown Formatting**: Supports `**bold**` and `*italic*` tokens in the same text paragraph.
- ✅ **Template Expressions**: Supports string interpolation `${variable}` and data transformations.
- ✅ **Paragraph Alignment**: Supports `left`, `center`, `right`, and `justify`.
- ✅ **Dynamic or Static Text**: Works with static `value` or dynamic `dataBinding`.

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"rich_text"` or `"richText"` |
| `id` | string | ✅ | Unique element identifier |
| `x` | number | ✅ | Horizontal position in points |
| `y` | number | ✅ | Vertical position in points |
| `value` | string | ⚠️ | Static text with Markdown markup (required if `dataBinding` not set) |
| `dataBinding` | string | ⚠️ | Expression or path resolving to Markdown text |
| `width` | number | ❌ | Width in points (defaults to full printable area) |
| `height` | number | ❌ | Height in points (used when `overflow: "hidden"`) |
| `style` | object | ❌ | Styling options (`fontSize`, `fontFamily`, `color`, `alignment`, `overflow`) |
| `printCondition` | string | ❌ | Condition expression to render element |
| `positionMode` | string | ❌ | `"absolute"` or `"relative"` |
| `relativeOffsetY` | number | ❌ | Offset relative to previous flow element |

---

## Example: Markdown Formatted Paragraph

```json
{
  "type": "rich_text",
  "id": "terms-and-conditions",
  "x": 50,
  "y": 600,
  "width": 500,
  "value": "Please note that all **payments** are due within *30 days* of invoice issuance. Late fees may apply.",
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#334155",
    "alignment": "justify"
  }
}
```

## Example: Dynamic Text with Markdown

```json
{
  "type": "rich_text",
  "id": "dynamic-notes",
  "x": 50,
  "y": 680,
  "width": 500,
  "dataBinding": "Order status for **${order.id}** is currently *${order.status}*.",
  "style": {
    "fontSize": 10,
    "color": "#1E293B"
  }
}
```
