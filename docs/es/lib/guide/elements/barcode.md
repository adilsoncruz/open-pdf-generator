# Elemento Barcode

El `BarcodeElement` genera códigos QR y códigos de barras dinámicamente a partir de datos enlazados.

## Características

- ✅ **Código QR**: códigos 2D para URLs, PIX, datos complejos
- ✅ **Código de barras**: Code 128 para SKUs, productos
- ✅ **Corrección de errores**: 4 niveles para el código QR
- ✅ **Alta calidad**: escalado 2x para impresión
- ✅ **Enlace de datos (data binding)**: valores dinámicos desde los datos

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"barcode"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posición X |
| `y` | number | ✅ | Posición Y |
| `width` | number | ✅ | Ancho |
| `height` | number | ✅ | Alto |
| `barcodeType` | string | ✅ | `"qrcode"` o `"barcode"` |
| `dataBinding` | string | ✅ | Campo con los datos a codificar |
| `style` | object | ❌ | Estilos (solo código QR) |
| `printCondition` | string | ❌ | Condición para renderizar |

---

## Tipos de Código

### Código QR

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

**Ideal para:**
- URLs y enlaces
- PIX (código QR del Banco Central)
- Datos complejos (JSON, XML)
- Credenciales Wi-Fi
- vCards (contactos)

---

### Código de Barras (Code 128)

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

**Ideal para:**
- SKUs de productos
- Números de serie
- Códigos de seguimiento
- Identificadores simples

---

## Código QR

### Ejemplo Completo

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

**Datos:**
```json
{
  "order": {
    "number": "12345",
    "paymentLink": "https://payment.example.com/order/12345"
  }
}
```

---

### Niveles de Corrección de Errores

```json
{
  "style": {
    "errorCorrection": "M"
  }
}
```

| Nivel | Recuperación | Tamaño | Uso Recomendado |
|-------|----------|------|-----------------|
| `L` | ~7% | Menor | Pantallas digitales, impresión de alta calidad |
| `M` | ~15% | Medio | **Uso general** (predeterminado), impresión común |
| `Q` | ~25% | Mayor | Etiquetas expuestas, ambientes con suciedad |
| `H` | ~30% | Máximo | Ambientes adversos, superficies irregulares |

::: tip Recomendación
Usa `M` (predeterminado) para la mayoría de los casos. Usa `H` solo si la etiqueta estará expuesta a condiciones adversas.
:::

---

### Tamaño Recomendado

Para un escaneo confiable:

```json
// Mínimo
{ "width": 80, "height": 80 }

// Recomendado
{ "width": 120, "height": 120 }

// Óptimo
{ "width": 150, "height": 150 }
```

::: warning Atención
Los códigos QR muy pequeños (< 60x60pt) pueden ser difíciles de escanear, especialmente con el nivel `H`.
:::

---

### Tipos de Datos

#### URL

```json
{
  "dataBinding": "url"
}
```

**Datos:**
```json
{
  "url": "https://example.com/product/123"
}
```

---

#### PIX (Copiar y Pegar)

```json
{
  "dataBinding": "pix.qrCode"
}
```

**Datos:**
```json
{
  "pix": {
    "qrCode": "00020126580014BR.GOV.BCB.PIX..."
  }
}
```

---

#### Texto Simple

```json
{
  "dataBinding": "message"
}
```

**Datos:**
```json
{
  "message": "Scan for more information"
}
```

---

#### JSON (Datos Complejos)

```json
{
  "dataBinding": "orderJson"
}
```

**Datos:**
```json
{
  "orderJson": "{\"id\":123,\"customer\":\"John\",\"total\":1500}"
}
```

---

## Código de Barras

### Ejemplo Completo

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

**Datos:**
```json
{
  "tracking": {
    "code": "BR123456789BR"
  }
}
```

---

### Tamaño Recomendado

Para un escaneo confiable:

```json
// Mínimo
{ "width": 150, "height": 40 }

// Recomendado
{ "width": 250, "height": 60 }

// Óptimo (con texto)
{ "width": 300, "height": 80 }
```

---

### Code 128

El formato predeterminado es **Code 128**, que soporta:
- ✅ Números: `0-9`
- ✅ Letras mayúsculas: `A-Z`
- ✅ Letras minúsculas: `a-z`
- ✅ Símbolos: `!@#$%^&*()-_=+[]{};:'",.<>/?`
- ✅ Control: ASCII completo

**Ejemplos válidos:**
```
1234567890
ABC-123-XYZ
SKU2024001
BR123456789BR
```

---

## Casos de Uso

### Código QR para PIX

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

Con texto:

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

### Enlace de Seguimiento

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

**Datos:**
```json
{
  "tracking": {
    "code": "BR123456789BR",
    "url": "https://tracking.postal.com/BR123456789BR"
  }
}
```

---

### Código de Producto (SKU)

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

### Autenticación de Documentos

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

**Datos:**
```json
{
  "document": {
    "number": "INV-12345",
    "authenticationHash": "https://validation.example.com/verify/abc123xyz"
  }
}
```

---

### Enlace de Feedback

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

Con marco:

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

## Dentro de Bucles

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

## Condiciones

Muestra el código solo bajo condiciones:

```json
{
  "type": "barcode",
  "barcodeType": "qrcode",
  "dataBinding": "pix.qrCode",
  "printCondition": "paymentMethod == 'pix'"
}
```

---

## Rendimiento

### Generación

La generación de códigos se realiza con la librería **ZXing** (Zebra Crossing):
- ✅ Código QR: ~5-10ms
- ✅ Código de barras: ~2-5ms

### Optimización de Calidad

Los códigos se generan a escala 2x y luego se reducen para asegurar la calidad de impresión:

```kotlin
// Internamente, la librería hace:
val scaleFactor = 2
val scaledWidth = width * scaleFactor
// Genera una imagen más grande
// La reduce al tamaño final (anti-aliasing)
```

---

## Limitaciones

### Código QR

- ❌ El margen (quiet zone) se elimina para ahorrar espacio
- ❌ No soporta código QR a color
- ❌ No soporta logo en el centro
- ❌ Límite de ~3KB de datos (depende de la corrección)

### Código de Barras

- ❌ Solo Code 128 (otros formatos no soportados)
- ❌ No incluye texto debajo automáticamente
- ❌ No soporta checksum personalizado
- ❌ Altura mínima recomendada: 40pt

---

## Solución de Problemas

### El código QR no se escanea

1. ✅ Aumenta el tamaño (mínimo 80x80pt)
2. ✅ Reduce la corrección de errores (`L` o `M`)
3. ✅ Verifica que los datos sean correctos
4. ✅ Imprime en alta resolución (300 DPI+)

### El código de barras es ilegible

1. ✅ Aumenta el ancho (mínimo 150pt)
2. ✅ Aumenta la altura (mínimo 40pt)
3. ✅ Verifica que los datos sean válidos
4. ✅ Agrega texto debajo del código

### Datos demasiado largos

Para un código QR con muchos datos:
- Usa la corrección `L` (QR más pequeño)
- Aumenta el tamaño (200x200pt+)
- Considera acortar la URL con bit.ly o similar

---

## Tamaños por Corrección (Referencia)

Para una URL de 50 caracteres:

| Corrección | Tamaño Mínimo | Recomendado |
|------------|--------------|-------------|
| L | 80x80pt | 100x100pt |
| M | 90x90pt | 120x120pt |
| Q | 100x100pt | 150x150pt |
| H | 120x120pt | 180x180pt |

---

## Próximos Pasos

- [Elemento Image](/es/lib/guide/elements/image) - Alternativa para códigos ya generados
- [Elemento Text](/es/lib/guide/elements/text) - Agrega etiquetas
- [Elemento Rectangle](/es/lib/guide/elements/rectangle) - Crea marcos
- [Ejemplos](/es/lib/examples/) - Ve el Barcode en acción
