# Barcode Element

The `BarcodeElement` generates QR Codes and barcodes dynamically from bound data.

## Features

- ✅ **QR Code**: 2D codes for URLs, PIX, complex data
- ✅ **Barcode**: Code 128 for SKUs, products
- ✅ **Error correction**: 4 levels for QR Code
- ✅ **High quality**: Scaled 2x for printing
- ✅ **Data binding**: Dynamic values from data

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"barcode"` |
| `id` | string | ✅ | Unique identifier |
| `x` | number | ✅ | X position |
| `y` | number | ✅ | Y position |
| `width` | number | ✅ | Width |
| `height` | number | ✅ | Height |
| `barcodeType` | string | ✅ | `"qrcode"` or `"barcode"` |
| `dataBinding` | string | ✅ | Field with data to encode |
| `style` | object | ❌ | Styles (QR Code only) |
| `printCondition` | string | ❌ | Condition to render |

---

## Code Types

### QR Code

```json
{
  "type": "barcode",
  "id": "qr-pix",
  "x": 400,
  "y": 650,
  "width": 150,
  "height": 150,
  "barcodeType": "qrcode",
  "dataBinding": "payment.pixQrCode"
}
```

**Ideal for:**
- URLs and links
- PIX (Central Bank QR Code)
- Complex data (JSON, XML)
- Wi-Fi credentials
- vCards (contacts)

---

### Barcode (Code 128)

```json
{
  "type": "barcode",
  "id": "product-code",
  "x": 50,
  "y": 700,
  "width": 250,
  "height": 80,
  "barcodeType": "barcode",
  "dataBinding": "product.sku"
}
```

**Ideal for:**
- Product SKUs
- Serial numbers
- Tracking codes
- Simple identifiers

---

## QR Code

### Complete Example

```json
{
  "type": "barcode",
  "id": "qr-payment-link",
  "x": 50,
  "y": 600,
  "width": 120,
  "height": 120,
  "barcodeType": "qrcode",
  "dataBinding": "order.paymentLink",
  "style": {
    "errorCorrection": "M"
  }
}
```

**Data:**
```json
{
  "order": {
    "number": "12345",
    "paymentLink": "https://payment.example.com/order/12345"
  }
}
```

---

### Error Correction Levels

```json
{
  "style": {
    "errorCorrection": "M"
  }
}
```

| Level | Recovery | Size | Recommended Use |
|-------|----------|------|-----------------|
| `L` | ~7% | Smaller | Digital screens, high-quality printing |
| `M` | ~15% | Medium | **General use** (default), common printing |
| `Q` | ~25% | Larger | Exposed labels, environments with dirt |
| `H` | ~30% | Maximum | Adverse environments, irregular surfaces |

::: tip Recommendation
Use `M` (default) for most cases. Use `H` only if the label will be exposed to adverse conditions.
:::

---

### Recommended Size

For reliable scanning:

```json
// Minimum
{ "width": 80, "height": 80 }

// Recommended
{ "width": 120, "height": 120 }

// Optimal
{ "width": 150, "height": 150 }
```

::: warning Attention
Very small QR Codes (< 60x60pt) may be difficult to scan, especially with level `H`.
:::

---

### Data Types

#### URL

```json
{
  "dataBinding": "url"
}
```

**Data:**
```json
{
  "url": "https://example.com/product/123"
}
```

---

#### PIX (Copy and Paste)

```json
{
  "dataBinding": "pix.qrCode"
}
```

**Data:**
```json
{
  "pix": {
    "qrCode": "00020126580014BR.GOV.BCB.PIX..."
  }
}
```

---

#### Simple Text

```json
{
  "dataBinding": "message"
}
```

**Data:**
```json
{
  "message": "Scan for more information"
}
```

---

#### JSON (Complex Data)

```json
{
  "dataBinding": "orderJson"
}
```

**Data:**
```json
{
  "orderJson": "{\"id\":123,\"customer\":\"John\",\"total\":1500}"
}
```

---

## Barcode

### Complete Example

```json
{
  "type": "barcode",
  "id": "tracking-code",
  "x": 50,
  "y": 750,
  "width": 300,
  "height": 60,
  "barcodeType": "barcode",
  "dataBinding": "tracking.code"
}
```

**Data:**
```json
{
  "tracking": {
    "code": "BR123456789BR"
  }
}
```

---

### Recommended Size

For reliable scanning:

```json
// Minimum
{ "width": 150, "height": 40 }

// Recommended
{ "width": 250, "height": 60 }

// Optimal (with text)
{ "width": 300, "height": 80 }
```

---

### Code 128

The default format is **Code 128**, which supports:
- ✅ Numbers: `0-9`
- ✅ Uppercase letters: `A-Z`
- ✅ Lowercase letters: `a-z`
- ✅ Symbols: `!@#$%^&*()-_=+[]{};:'",.<>/?`
- ✅ Control: Full ASCII

**Valid examples:**
```
1234567890
ABC-123-XYZ
SKU2024001
BR123456789BR
```

---

## Use Cases

### PIX QR Code

```json
{
  "type": "barcode",
  "id": "qr-pix",
  "x": 400,
  "y": 600,
  "width": 150,
  "height": 150,
  "barcodeType": "qrcode",
  "dataBinding": "pix.copyPaste",
  "style": {
    "errorCorrection": "M"
  }
}
```

With text:

```json
{
  "type": "text",
  "x": 400,
  "y": 765,
  "value": "Pay with PIX",
  "style": {
    "fontSize": 10,
    "alignment": "center"
  }
}
```

---

### Tracking Link

```json
{
  "type": "barcode",
  "id": "qr-tracking",
  "x": 50,
  "y": 600,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "tracking.url"
}
```

**Data:**
```json
{
  "tracking": {
    "code": "BR123456789BR",
    "url": "https://tracking.postal.com/BR123456789BR"
  }
}
```

---

### Product Code (SKU)

```json
{
  "elements": [
    {
      "type": "barcode",
      "id": "sku-barcode",
      "x": 50,
      "y": 700,
      "width": 200,
      "height": 50,
      "barcodeType": "barcode",
      "dataBinding": "product.sku"
    },
    {
      "type": "text",
      "x": 50,
      "y": 760,
      "dataBinding": "product.sku",
      "style": {
        "fontSize": 9,
        "fontFamily": "Courier",
        "alignment": "center"
      }
    }
  ]
}
```

---

### Document Authentication

```json
{
  "type": "barcode",
  "id": "qr-authentication",
  "x": 450,
  "y": 750,
  "width": 80,
  "height": 80,
  "barcodeType": "qrcode",
  "dataBinding": "document.authenticationHash",
  "style": {
    "errorCorrection": "Q"
  }
}
```

**Data:**
```json
{
  "document": {
    "number": "INV-12345",
    "authenticationHash": "https://validation.example.com/verify/abc123xyz"
  }
}
```

---

### Feedback Link

```json
{
  "type": "barcode",
  "id": "qr-feedback",
  "x": 250,
  "y": 700,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "feedback.url"
}
```

With frame:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 240,
      "y": 690,
      "width": 120,
      "height": 140,
      "style": {
        "fillColor": "#f3f4f6",
        "borderColor": "#d1d5db",
        "borderWidth": 1,
        "cornerRadius": 8
      }
    },
    {
      "type": "barcode",
      "id": "qr",
      "x": 250,
      "y": 700,
      "width": 100,
      "height": 100,
      "barcodeType": "qrcode",
      "dataBinding": "feedback.url"
    },
    {
      "type": "text",
      "x": 300,
      "y": 810,
      "value": "Rate us!",
      "style": {
        "fontSize": 9,
        "alignment": "center"
      }
    }
  ]
}
```

---

## Inside Loops

```json
{
  "type": "loop",
  "dataBinding": "products",
  "ySpacing": 120,
  "elements": [
    {
      "type": "text",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "barcode",
      "x": 50,
      "y": 25,
      "width": 150,
      "height": 40,
      "barcodeType": "barcode",
      "dataBinding": "$item.sku"
    }
  ]
}
```

---

## Conditions

Show code only under conditions:

```json
{
  "type": "barcode",
  "barcodeType": "qrcode",
  "dataBinding": "pix.qrCode",
  "printCondition": "paymentMethod == 'pix'"
}
```

---

## Performance

### Generation

Code generation is done by the **ZXing** (Zebra Crossing) library:
- ✅ QR Code: ~5-10ms
- ✅ Barcode: ~2-5ms

### Quality Optimization

Codes are generated at 2x scale and then reduced to ensure print quality:

```kotlin
// Internally, the library does:
val scaleFactor = 2
val scaledWidth = width * scaleFactor
// Generates larger image
// Reduces to final size (anti-aliasing)
```

---

## Limitations

### QR Code

- ❌ Margin (quiet zone) is removed to save space
- ❌ Does not support colored QR Code
- ❌ Does not support logo in center
- ❌ ~3KB data limit (depends on correction)

### Barcode

- ❌ Only Code 128 (other formats not supported)
- ❌ Does not include text below automatically
- ❌ Does not support custom checksum
- ❌ Minimum recommended height: 40pt

---

## Troubleshooting

### QR Code doesn't scan

1. ✅ Increase size (minimum 80x80pt)
2. ✅ Reduce error correction (`L` or `M`)
3. ✅ Verify data is correct
4. ✅ Print in high resolution (300 DPI+)

### Barcode unreadable

1. ✅ Increase width (minimum 150pt)
2. ✅ Increase height (minimum 40pt)
3. ✅ Verify data is valid
4. ✅ Add text below the code

### Data too long

For QR Code with lots of data:
- Use correction `L` (smaller QR)
- Increase size (200x200pt+)
- Consider shortening URL with bit.ly or similar

---

## Sizes by Correction (Reference)

For 50-character URL:

| Correction | Minimum Size | Recommended |
|------------|--------------|-------------|
| L | 80x80pt | 100x100pt |
| M | 90x90pt | 120x120pt |
| Q | 100x100pt | 150x150pt |
| H | 120x120pt | 180x180pt |

---

## Next Steps

- [Image Element](/lib/guide/elements/image) - Alternative for ready-made codes
- [Text Element](/lib/guide/elements/text) - Add labels
- [Rectangle Element](/lib/guide/elements/rectangle) - Create frames
- [Examples](/lib/examples/) - See Barcode in action

