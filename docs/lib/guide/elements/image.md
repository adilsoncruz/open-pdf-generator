# Image Element

The `ImageElement` inserts images into the PDF from URLs, local files, or base64 data with fit and alignment control.

## Features

- ✅ **Multiple sources**: URL, local file, base64, data binding
- ✅ **Fit modes**: contain, cover, fill, scale-down
- ✅ **Alignment**: 9 different positions
- ✅ **Automatic cache**: Images are cached for performance
- ✅ **Supported formats**: JPEG, PNG, GIF

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"image"` |
| `id` | string | ✅ | Unique identifier |
| `x` | number | ✅ | X position |
| `y` | number | ✅ | Y position |
| `width` | number | ✅ | Container width |
| `height` | number | ✅ | Container height |
| `source` | string | ❌ | URL or path (static) |
| `dataBinding` | string | ❌ | Path to URL or base64 (dynamic) |
| `fit` | string | ❌ | Fit mode (default: `contain`) |
| `alignment` | string | ❌ | Alignment (default: `center`) |
| `printCondition` | string | ❌ | Condition to render |

::: warning Important
You MUST provide `source` OR `dataBinding` (at least one of the two).
:::

---

## Basic Example

### Static Image (URL)

```json
{
  "type": "image",
  "id": "logo",
  "x": 50,
  "y": 50,
  "width": 150,
  "height": 80,
  "source": "https://example.com/logo.png",
  "fit": "contain"
}
```

### Dynamic Image (Data Binding)

```json
{
  "type": "image",
  "id": "product-photo",
  "x": 200,
  "y": 200,
  "width": 200,
  "height": 200,
  "dataBinding": "product.image",
  "fit": "cover"
}
```

**Data:**
```json
{
  "product": {
    "name": "Notebook",
    "image": "https://example.com/product123.jpg"
  }
}
```

---

## Image Sources

### 1. URL (HTTP/HTTPS)

```json
{
  "source": "https://example.com/image.jpg"
}
```

### 2. Local File

```json
{
  "source": "file:///full/path/image.png"
}
```

Or relative path:
```json
{
  "source": "resources/images/logo.png"
}
```

### 3. Base64

```json
{
  "dataBinding": "base64Image"
}
```

**Data:**
```json
{
  "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

## Fit Modes (fit)

### contain (Default)

Entire image visible, maintains proportions, may have empty spaces.

```json
{
  "fit": "contain"
}
```

**Ideal for:**
- Logos
- Icons
- Images that cannot be cropped

**Visual example:**
```
┌──────────────────┐
│                  │
│  ┌──────────┐   │
│  │  IMAGE   │   │
│  └──────────┘   │
│                  │
└──────────────────┘
```

---

### cover

Fills entire container, maintains proportions, may crop parts of the image.

```json
{
  "fit": "cover"
}
```

**Ideal for:**
- Backgrounds
- Product photos
- Decorative images

**Visual example:**
```
┌──────────────────┐
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
└──────────────────┘
```

Parts of the image outside the container are cropped.

---

### fill

Stretches image to exactly fill the container (may distort).

```json
{
  "fit": "fill"
}
```

**Ideal for:**
- Images that already have container proportions
- Simple backgrounds

::: warning Caution
May distort the image if proportions are different!
:::

---

### scale-down

Like `contain`, but never enlarges beyond original size.

```json
{
  "fit": "scale-down"
}
```

**Ideal for:**
- Preserving quality
- High-resolution images
- Ready-made QR Codes

---

## Alignment (alignment)

### Available Values

| Value | Description |
|-------|-------------|
| `center` | Center (default) |
| `left` | Left (vertical center) |
| `right` | Right (vertical center) |
| `top` | Top (horizontal center) |
| `bottom` | Bottom (horizontal center) |
| `top-left` | Top left corner |
| `top-right` | Top right corner |
| `bottom-left` | Bottom left corner |
| `bottom-right` | Bottom right corner |

### Example

```json
{
  "type": "image",
  "source": "logo.png",
  "width": 200,
  "height": 100,
  "fit": "contain",
  "alignment": "top-left"
}
```

**Visual example:**
```
┌──────────────────┐
│ ┌────┐           │
│ │LOGO│           │
│ └────┘           │
│                  │
└──────────────────┘
```

---

## Use Cases

### Logo in Header

```json
{
  "type": "image",
  "id": "company-logo",
  "x": 30,
  "y": 20,
  "width": 120,
  "height": 60,
  "source": "https://company.com/logo.png",
  "fit": "contain",
  "alignment": "left"
}
```

---

### Product Photo

```json
{
  "type": "image",
  "id": "product-photo",
  "x": 50,
  "y": 200,
  "width": 250,
  "height": 250,
  "dataBinding": "product.photo",
  "fit": "cover",
  "alignment": "center"
}
```

---

### Full Width Background

```json
{
  "type": "image",
  "id": "background",
  "x": 0,
  "y": 0,
  "width": 595,
  "height": 842,
  "source": "background-pattern.png",
  "fit": "cover"
}
```

::: tip Tip
For backgrounds, use element rendered "under" (behind the content).
:::

---

### Digital Signature

```json
{
  "type": "image",
  "id": "signature",
  "x": 50,
  "y": 700,
  "width": 200,
  "height": 80,
  "dataBinding": "contract.signatureBase64",
  "fit": "contain",
  "alignment": "bottom-left"
}
```

**Data:**
```json
{
  "contract": {
    "signatureBase64": "data:image/png;base64,iVBORw..."
  }
}
```

---

### Multiple Images in Loop

```json
{
  "type": "loop",
  "dataBinding": "products",
  "ySpacing": 120,
  "elements": [
    {
      "type": "image",
      "x": 50,
      "y": 0,
      "width": 100,
      "height": 100,
      "dataBinding": "$item.image",
      "fit": "cover"
    },
    {
      "type": "text",
      "x": 170,
      "y": 40,
      "dataBinding": "$item.name"
    }
  ]
}
```

---

## Conditional Images

Show image only under conditions:

```json
{
  "type": "image",
  "source": "certified-seal.png",
  "printCondition": "product.certified == true"
}
```

---

## Performance and Cache

### Automatic Cache

The library automatically caches loaded images:

```kotlin
// Clear cache (if needed)
ImageRenderer.clearCache()

// Check cache size
val size = ImageRenderer.cacheSize()

// Configure maximum size
ImageRenderer.setMaxCacheSize(100) // 100 images
```

### Performance Tips

::: tip Optimization
- ✅ Use optimized images (compressed JPEG)
- ✅ Size images to approximate usage size
- ✅ Avoid very large images (> 2 MB)
- ✅ Use cache for repeated images
- ✅ Prefer JPEG for photos, PNG for logos/icons
:::

---

## Limitations

- ❌ Does not support SVG (convert to PNG/JPEG first)
- ❌ Does not support animated GIF (only first frame)
- ❌ Does not support rotation
- ❌ Does not support filters (brightness, contrast, etc.)
- ❌ Does not support adjustable transparency (fixed alpha)

---

## Supported Formats

| Format | Extension | Recommended For |
|--------|-----------|-----------------|
| JPEG | `.jpg`, `.jpeg` | Photos, complex images |
| PNG | `.png` | Logos, icons, transparency |
| GIF | `.gif` | Simple images (no animation) |

---

## Troubleshooting

### Image doesn't appear

1. ✅ Verify URL is accessible
2. ✅ Confirm supported format
3. ✅ Verify base64 is complete
4. ✅ Test `fit: "fill"` for debug

### Image cropped

- Use `fit: "contain"` instead of `cover`
- Adjust `width` and `height` to maintain proportions

### Image distorted

- Use `fit: "contain"` or `cover`
- Never use `fit: "fill"` with different proportions

### Slow performance

- Reduce image sizes
- Compress JPEGs
- Verify cache is enabled

---

## Next Steps

- [Barcode Element](/guide/elements/barcode) - QR Codes and barcodes
- [Rectangle Element](/guide/elements/rectangle) - Backgrounds and borders
- [Loop Element](/guide/elements/loop) - Multiple images
- [Examples](/examples/) - See Image in action

