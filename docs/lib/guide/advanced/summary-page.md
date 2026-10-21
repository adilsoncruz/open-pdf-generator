# Summary Page

The `summaryPage` configuration allows generating a dedicated closing or summary page appended at the end of the document.

## Features

- ✅ **Dedicated Final Page**: Perfect for closing totals, signatures, terms of service, or audit trails.
- ✅ **Separate Elements & Groups**: Defined independently from standard body pages.
- ✅ **Dedicated Background**: Supports custom `background` container/shapes specifically for the summary page.
- ✅ **Conditional Generation**: Rendered only when `printCondition` evaluates to `true`.

---

## Configuration Properties

Defined at the root level of the template (`template.summaryPage`):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `elements` | array | ✅ | List of elements to render on the summary page |
| `groups` | array | ❌ | List of element groups defined on the summary page |
| `background` | object | ❌ | Dedicated `BodyBackground` settings for this page |
| `printCondition` | string | ❌ | Boolean expression to decide whether to append the summary page |

---

## Example: Signatures and Closing Summary

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    {
      "type": "text",
      "id": "intro",
      "x": 36,
      "y": 50,
      "text": "Contract Body..."
    }
  ],
  "summaryPage": {
    "printCondition": "requireSignatures == true",
    "elements": [
      {
        "type": "text",
        "id": "summary-title",
        "x": 36,
        "y": 60,
        "text": "Terms and Signatures",
        "font": { "size": 18, "style": "bold" }
      },
      {
        "type": "line",
        "id": "sig-line-1",
        "x1": 36,
        "y1": 300,
        "x2": 250,
        "y2": 300
      },
      {
        "type": "text",
        "id": "sig-label-1",
        "x": 36,
        "y": 310,
        "text": "Contractor Signature"
      }
    ]
  }
}
```
