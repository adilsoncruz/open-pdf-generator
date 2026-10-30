# Elemento Image

El `ImageElement` inserta imágenes en el PDF desde URLs, archivos locales o datos base64, con control de ajuste y alineación.

## Características

- ✅ **Múltiples orígenes**: URL, archivo local, base64, enlace de datos (data binding)
- ✅ **Modos de ajuste**: contain, cover, fill, scale-down
- ✅ **Alineación**: 9 posiciones diferentes
- ✅ **Cache automático**: las imágenes se cachean para mejorar el rendimiento
- ✅ **Formatos soportados**: JPEG, PNG, GIF

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"image"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posición X |
| `y` | number | ✅ | Posición Y |
| `width` | number | ✅ | Ancho del contenedor |
| `height` | number | ✅ | Alto del contenedor |
| `source` | string | ❌ | URL o ruta (estático) |
| `dataBinding` | string | ❌ | Ruta a una URL o base64 (dinámico) |
| `fit` | string | ❌ | Modo de ajuste (predeterminado: `contain`) |
| `alignment` | string | ❌ | Alineación (predeterminada: `center`) |
| `printCondition` | string | ❌ | Condición para renderizar |

::: warning Importante
Debes proporcionar `source` O `dataBinding` (al menos uno de los dos).
:::

---

## Ejemplo Básico

### Imagen Estática (URL)

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

### Imagen Dinámica (Enlace de Datos)

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

**Datos:**
```json
{
  "product": {
    "name": "Notebook",
    "image": "https://example.com/product123.jpg"
  }
}
```

---

## Orígenes de Imagen

### 1. URL (HTTP/HTTPS)

```json
{
  "source": "https://example.com/image.jpg"
}
```

### 2. Archivo Local

```json
{
  "source": "file:///full/path/image.png"
}
```

O ruta relativa:
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

**Datos:**
```json
{
  "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

## Modos de Ajuste (fit)

### contain (Predeterminado)

Toda la imagen es visible, mantiene las proporciones, puede dejar espacios vacíos.

```json
{
  "fit": "contain"
}
```

**Ideal para:**
- Logos
- Íconos
- Imágenes que no pueden recortarse

**Ejemplo visual:**
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

Llena todo el contenedor, mantiene las proporciones, puede recortar partes de la imagen.

```json
{
  "fit": "cover"
}
```

**Ideal para:**
- Fondos
- Fotos de productos
- Imágenes decorativas

**Ejemplo visual:**
```
┌──────────────────┐
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
│ IMMMMMMMMMMMAGE  │
└──────────────────┘
```

Las partes de la imagen fuera del contenedor quedan recortadas.

---

### fill

Estira la imagen para llenar exactamente el contenedor (puede deformarla).

```json
{
  "fit": "fill"
}
```

**Ideal para:**
- Imágenes que ya tienen las proporciones del contenedor
- Fondos sencillos

::: warning Precaución
¡Puede deformar la imagen si las proporciones son diferentes!
:::

---

### scale-down

Como `contain`, pero nunca agranda más allá del tamaño original.

```json
{
  "fit": "scale-down"
}
```

**Ideal para:**
- Preservar la calidad
- Imágenes de alta resolución
- Códigos QR ya generados

---

## Alineación (alignment)

### Valores Disponibles

| Valor | Descripción |
|-------|-------------|
| `center` | Centrado (predeterminado) |
| `left` | Izquierda (centro vertical) |
| `right` | Derecha (centro vertical) |
| `top` | Arriba (centro horizontal) |
| `bottom` | Abajo (centro horizontal) |
| `top-left` | Esquina superior izquierda |
| `top-right` | Esquina superior derecha |
| `bottom-left` | Esquina inferior izquierda |
| `bottom-right` | Esquina inferior derecha |

### Ejemplo

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

**Ejemplo visual:**
```
┌──────────────────┐
│ ┌────┐           │
│ │LOGO│           │
│ └────┘           │
│                  │
└──────────────────┘
```

---

## Casos de Uso

### Logo en el Encabezado

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

### Foto de Producto

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

### Fondo a Todo el Ancho

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

::: tip Consejo
Para fondos, usa el elemento renderizado "debajo" (detrás del contenido).
:::

---

### Firma Digital

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

**Datos:**
```json
{
  "contract": {
    "signatureBase64": "data:image/png;base64,iVBORw..."
  }
}
```

---

### Varias Imágenes en un Bucle

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

## Imágenes Condicionales

Muestra la imagen solo bajo condiciones:

```json
{
  "type": "image",
  "source": "certified-seal.png",
  "printCondition": "product.certified == true"
}
```

---

## Rendimiento y Cache

### Cache Automático

La librería cachea automáticamente las imágenes cargadas:

```kotlin
// Limpiar el cache (si es necesario)
ImageRenderer.clearCache()

// Consultar el tamaño del cache
val size = ImageRenderer.cacheSize()

// Configurar el tamaño máximo
ImageRenderer.setMaxCacheSize(100) // 100 imágenes
```

### Consejos de Rendimiento

::: tip Optimización
- ✅ Usa imágenes optimizadas (JPEG comprimido)
- ✅ Dimensiona las imágenes aproximando el tamaño de uso
- ✅ Evita imágenes muy grandes (> 2 MB)
- ✅ Usa el cache para imágenes repetidas
- ✅ Prefiere JPEG para fotos, PNG para logos/íconos
:::

---

## Limitaciones

- ❌ No soporta SVG (convierte primero a PNG/JPEG)
- ❌ No soporta GIF animado (solo el primer cuadro)
- ❌ No soporta rotación
- ❌ No soporta filtros (brillo, contraste, etc.)
- ❌ No soporta transparencia ajustable (alpha fijo)

---

## Formatos Soportados

| Formato | Extensión | Recomendado Para |
|--------|-----------|-----------------|
| JPEG | `.jpg`, `.jpeg` | Fotos, imágenes complejas |
| PNG | `.png` | Logos, íconos, transparencia |
| GIF | `.gif` | Imágenes simples (sin animación) |

---

## Solución de Problemas

### La imagen no aparece

1. ✅ Verifica que la URL sea accesible
2. ✅ Confirma que el formato sea soportado
3. ✅ Verifica que el base64 esté completo
4. ✅ Prueba `fit: "fill"` para depurar

### Imagen recortada

- Usa `fit: "contain"` en lugar de `cover`
- Ajusta `width` y `height` para mantener las proporciones

### Imagen deformada

- Usa `fit: "contain"` o `cover`
- Nunca uses `fit: "fill"` con proporciones diferentes

### Rendimiento lento

- Reduce los tamaños de las imágenes
- Comprime los JPEG
- Verifica que el cache esté habilitado

---

## Próximos Pasos

- [Elemento Barcode](/es/lib/guide/elements/barcode) - Códigos QR y códigos de barras
- [Elemento Rectangle](/es/lib/guide/elements/rectangle) - Fondos y bordes
- [Elemento Loop](/es/lib/guide/elements/loop) - Varias imágenes
- [Ejemplos](/es/lib/examples/) - Ve el Image en acción
