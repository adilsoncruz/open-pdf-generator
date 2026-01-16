# Fixed Header & Footer

Fixed headers and footers are elements that repeat on all pages of the document, ideal for logos, titles, page numbering, and legal information.

## Overview

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │         FIXED HEADER             │  │ ← Repeats on all pages
│  └───────────────────────────────────┘  │
│                                         │
│           PAGE CONTENT                  │
│           (Body / Elements)             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         FIXED FOOTER             │  │ ← Repeats on all pages
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Template Structure

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 30,
      "right": 30,
      "bottom": 30,
      "left": 30
    }
  },
  "fixedHeader": {
    "height": 80,
    "elements": [...]
  },
  "fixedFooter": {
    "height": 50,
    "elements": [...]
  },
  "elements": [...]
}
```

---

## Fixed Header

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `height` | number | ✅ | Header height in points |
| `elements` | array | ✅ | List of elements |

### Basic Example

```json
{
  "fixedHeader": {
    "height": 80,
    "elements": [
      {
        "type": "rectangle",
        "id": "header-bg",
        "x": 0,
        "y": 0,
        "width": "100%",
        "height": 80,
        "style": {
          "fillColor": "#1e40af"
        }
      },
      {
        "type": "image",
        "id": "logo",
        "x": 30,
        "y": 15,
        "width": 120,
        "height": 50,
        "source": "https://company.com/logo.png",
        "fit": "contain"
      },
      {
        "type": "text",
        "id": "company-name",
        "x": 170,
        "y": 25,
        "value": "MY COMPANY LTD",
        "style": {
          "fontSize": 16,
          "fontWeight": "bold",
          "color": "#ffffff"
        }
      },
      {
        "type": "text",
        "id": "company-id",
        "x": 170,
        "y": 50,
        "value": "ID: 12.345.678/0001-99",
        "style": {
          "fontSize": 10,
          "color": "#93c5fd"
        }
      }
    ]
  }
}
```

---

## Fixed Footer

### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `height` | number | ✅ | Footer height in points |
| `elements` | array | ✅ | List of elements |

### Basic Example

```json
{
  "fixedFooter": {
    "height": 50,
    "elements": [
      {
        "type": "line",
        "id": "footer-line",
        "x": 30,
        "y": 0,
        "x2": 565,
        "y2": 0,
        "style": {
          "color": "#d1d5db",
          "width": 1
        }
      },
      {
        "type": "text",
        "id": "footer-text",
        "x": 30,
        "y": 15,
        "value": "Automatically generated document",
        "style": {
          "fontSize": 8,
          "color": "#6b7280"
        }
      },
      {
        "type": "text",
        "id": "footer-page",
        "x": 500,
        "y": 15,
        "value": "Page ${_pageNumber}",
        "style": {
          "fontSize": 8,
          "color": "#6b7280"
        }
      }
    ]
  }
}
```

---

## System Variables

Inside headers and footers, you can use special system variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `_pageNumber` | Current page number | 1, 2, 3... |
| `_date` | Current date (YYYY-MM-DD) | 2026-01-16 |
| `_dateTime` | Current date and time | 2026-01-16T14:30:45 |

### Usage Example

```json
{
  "type": "text",
  "dataBinding": "_pageNumber",
  "style": {
    "fontSize": 9
  }
}
```

Or combined with text:

```json
{
  "type": "text",
  "value": "Page ${_pageNumber}",
  "style": {
    "fontSize": 9
  }
}
```

### Date in Footer

```json
{
  "type": "text",
  "value": "Generated on: ${_date}",
  "style": {
    "fontSize": 8,
    "color": "#6b7280"
  }
}
```

---

## Conditional Header/Footer

You can control when header/footer is displayed using `printCondition`:

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `printCondition` | string | Condition to show/hide the header/footer |

### Show Header Only on Page 2+

```json
{
  "header": {
    "height": 60,
    "printCondition": "_pageNumber > 1",
    "elements": [...]
  }
}
```

### Show Footer Only on First Page

```json
{
  "footer": {
    "height": 40,
    "printCondition": "_pageNumber == 1",
    "elements": [...]
  }
}
```

### Based on Data

```json
{
  "header": {
    "height": 80,
    "printCondition": "showHeader == true",
    "elements": [...]
  }
}
```

::: tip Dynamic Space
When using `printCondition` with `_pageNumber`, the space for header/footer is automatically adjusted per page. For example, if header only shows on page 2+, page 1 will have more space for content.
:::

---

## Coordinates

### Coordinate System

Inside `fixedHeader` and `fixedFooter`, coordinates are **relative** to the container:

```
Header (height: 80)
┌─────────────────────────────────────────┐
│ (0,0)                           (565,0) │
│                                         │
│                                         │
│ (0,80)                         (565,80) │
└─────────────────────────────────────────┘

Footer (height: 50)
┌─────────────────────────────────────────┐
│ (0,0)                           (565,0) │
│                                         │
│ (0,50)                         (565,50) │
└─────────────────────────────────────────┘
```

- `x=0` → page left margin
- `y=0` → top of container (header) or top of footer
- Available width: `pageWidth - marginLeft - marginRight`

---

## 100% Width

Use `"100%"` to fill the entire width:

```json
{
  "type": "rectangle",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 80,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

The rectangle will occupy the entire available width (page - margins).

---

## Complete Example: Invoice

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 20,
      "right": 30,
      "bottom": 20,
      "left": 30
    }
  },
  "fixedHeader": {
    "height": 120,
    "elements": [
      {
        "type": "rectangle",
        "id": "header-bg",
        "x": 0,
        "y": 0,
        "width": "100%",
        "height": 120,
        "style": {
          "fillColor": "#1e3a8a"
        }
      },
      {
        "type": "image",
        "id": "logo",
        "x": 20,
        "y": 20,
        "width": 100,
        "height": 80,
        "source": "logo.png",
        "fit": "contain"
      },
      {
        "type": "text",
        "id": "company",
        "x": 140,
        "y": 25,
        "value": "EXAMPLE COMPANY INC.",
        "style": {
          "fontSize": 18,
          "fontWeight": "bold",
          "color": "#ffffff"
        }
      },
      {
        "type": "text",
        "id": "company-id",
        "x": 140,
        "y": 50,
        "value": "ID: 12.345.678/0001-99",
        "style": {
          "fontSize": 10,
          "color": "#93c5fd"
        }
      },
      {
        "type": "text",
        "id": "address",
        "x": 140,
        "y": 70,
        "value": "123 Main Street - New York/NY",
        "style": {
          "fontSize": 9,
          "color": "#93c5fd"
        }
      },
      {
        "type": "text",
        "id": "inv-label",
        "x": 400,
        "y": 30,
        "value": "INVOICE",
        "style": {
          "fontSize": 14,
          "fontWeight": "bold",
          "color": "#fbbf24"
        }
      },
      {
        "type": "text",
        "id": "inv-number",
        "x": 400,
        "y": 50,
        "dataBinding": "invoice.number | padLeft:9:'0'",
        "style": {
          "fontSize": 12,
          "color": "#ffffff"
        }
      }
    ]
  },
  "fixedFooter": {
    "height": 60,
    "elements": [
      {
        "type": "line",
        "id": "footer-line",
        "x": 0,
        "y": 5,
        "x2": 535,
        "y2": 5,
        "style": {
          "color": "#d1d5db",
          "width": 0.5
        }
      },
      {
        "type": "text",
        "id": "footer-info",
        "x": 0,
        "y": 20,
        "value": "This document is a graphical representation of the invoice",
        "style": {
          "fontSize": 7,
          "color": "#9ca3af"
        }
      },
      {
        "type": "text",
        "id": "footer-key",
        "x": 0,
        "y": 35,
        "dataBinding": "invoice.key",
        "style": {
          "fontSize": 6,
          "fontFamily": "Courier",
          "color": "#6b7280"
        }
      },
      {
        "type": "text",
        "id": "page",
        "x": 480,
        "y": 20,
        "value": "Page ${_pageNumber}",
        "style": {
          "fontSize": 9,
          "color": "#6b7280"
        }
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "id": "items",
      "x": 0,
      "y": 20,
      "dataBinding": "invoice.items",
      "paginated": true,
      "columns": [...]
    }
  ]
}
```

---

## Multi-Column Layout in Header

Create complex layouts by manually positioning elements:

```json
{
  "fixedHeader": {
    "height": 100,
    "elements": [
      {
        "type": "rectangle",
        "x": 0,
        "y": 0,
        "width": "100%",
        "height": 100,
        "style": { "fillColor": "#f3f4f6" }
      },
      
      {
        "type": "text",
        "x": 20,
        "y": 15,
        "value": "COLUMN 1",
        "style": { "fontWeight": "bold" }
      },
      {
        "type": "text",
        "x": 20,
        "y": 35,
        "value": "Line 1"
      },
      {
        "type": "text",
        "x": 20,
        "y": 50,
        "value": "Line 2"
      },
      
      {
        "type": "text",
        "x": 200,
        "y": 15,
        "value": "COLUMN 2",
        "style": { "fontWeight": "bold" }
      },
      {
        "type": "text",
        "x": 200,
        "y": 35,
        "value": "Line 1"
      },
      {
        "type": "text",
        "x": 200,
        "y": 50,
        "value": "Line 2"
      },
      
      {
        "type": "text",
        "x": 380,
        "y": 15,
        "value": "COLUMN 3",
        "style": { "fontWeight": "bold" }
      },
      {
        "type": "text",
        "x": 380,
        "y": 35,
        "value": "Line 1"
      },
      {
        "type": "text",
        "x": 380,
        "y": 50,
        "value": "Line 2"
      }
    ]
  }
}
```

---

## Tips

### 1. Calculate Usable Area

```
Usable body area = pageHeight - marginTop - marginBottom - headerHeight - footerHeight

A4 Portrait:
842 - 30 - 30 - 80 - 50 = 652pt usable area for content
```

### 2. Use Divider Lines

```json
{
  "type": "line",
  "x": 0,
  "y": 79,
  "x2": 535,
  "y2": 79,
  "style": {
    "color": "#e5e7eb",
    "width": 1
  }
}
```

### 3. QR Code in Footer

```json
{
  "type": "barcode",
  "id": "qr-validation",
  "x": 480,
  "y": 5,
  "width": 45,
  "height": 45,
  "barcodeType": "qrcode",
  "dataBinding": "document.validationUrl"
}
```

---

## Limitations

- ❌ Height is fixed (does not auto-adjust to content)
- ❌ Does not support multiple headers/footers (only one header and one footer)
- ❌ `totalPages` is not yet supported (only `_pageNumber` is available)

---

## Performance

::: tip Optimization
- Headers/footers are rendered once and replicated
- Images in header are automatically cached
- Prefer lightweight SVG/PNG for logos
:::

---

## Next Steps

- [Pagination](/guide/advanced/pagination) - Page break control
- [Table Element](/guide/elements/table) - Paginated tables with repeating header
- [Examples](/examples/) - See header/footer in action

