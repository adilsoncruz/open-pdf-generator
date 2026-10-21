# Element Groups

Element Groups (`groups`) allow you to bundle multiple template elements together under a common group identifier and control their printing simultaneously using a single `printCondition`.

## Features

- ✅ **Unified Visibility**: Control multiple elements with one `printCondition`.
- ✅ **Section-Aware**: Groups can be defined in the template body, header, footer, background, or summary page.
- ✅ **Visual Editor Integration**: Create, name, inspect, and ungroup elements via the right-click context menu or layers panel in the Editor.

---

## Group Properties

Each group object inside `template.groups` (or section groups) contains:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique group identifier (e.g. `"group-1"`) |
| `name` | string | ❌ | Friendly display name (e.g. `"Tax Total Block"`) |
| `elementIds` | string[] | ✅ | Array of element IDs belonging to this group |
| `printCondition` | string | ❌ | Boolean expression evaluated for all elements in the group |

---

## Example: Conditional Group

```json
{
  "version": "1.0",
  "groups": [
    {
      "id": "discount-group",
      "name": "Discount Section",
      "printCondition": "order.discount > 0",
      "elementIds": ["discount-label", "discount-value", "discount-badge"]
    }
  ],
  "page": [
    { "type": "text", "id": "discount-label", "x": 350, "y": 400, "text": "Discount Applied:" },
    { "type": "text", "id": "discount-value", "x": 480, "y": 400, "text": "-{{order.discount | currency:'USD'}}" },
    { "type": "rectangle", "id": "discount-badge", "x": 340, "y": 395, "width": 200, "height": 24 }
  ]
}
```

If `order.discount > 0` is false, none of the 3 elements in the group will be rendered in the generated PDF.
