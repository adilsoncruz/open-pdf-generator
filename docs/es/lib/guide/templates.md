# Plantillas

Las plantillas se definen en JSON y describen el layout y el contenido del PDF.

## Estructura Básica

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
  "pageElements": []
}
```

## Configuración de Página

### Tamaño

| Valor | Dimensiones |
|-------|-------------|
| `A4` | 595 x 842 pt |
| `A3` | 842 x 1191 pt |
| `LETTER` | 612 x 792 pt |
| `LEGAL` | 612 x 1008 pt |

### Orientación

| Valor | Descripción |
|-------|-------------|
| `portrait` | Vertical (por defecto) |
| `landscape` | Horizontal |

### Márgenes

```json
{
  "margins": {
    "top": 30,
    "right": 30,
    "bottom": 30,
    "left": 30
  }
}
```

Todos los valores están en puntos (pt). 1 pulgada = 72 pt.

---

## Elementos

Los elementos son los bloques de construcción de tu PDF. Cada elemento tiene:

```json
{
  "type": "text",
  "id": "unique-id",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 50
}
```

### Propiedades Comunes

| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `type` | string | ✅ | Tipo de elemento |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posición X (desde la izquierda) |
| `y` | number | ✅ | Posición Y (desde arriba) |
| `width` | number | ❌ | Ancho |
| `height` | number | ❌ | Alto |
| `printCondition` | string | ❌ | Condición para el renderizado |

### Elementos Disponibles

| Tipo | Descripción |
|------|-------------|
| `text` | Texto estático o dinámico |
| `image` | Imágenes (URL, archivo, base64) |
| `table` | Tablas con paginación |
| `rectangle` | Rectángulos y fondos |
| `line` | Líneas |
| `barcode` | Códigos QR y códigos de barra |
| `conditional` | Grupos condicionales |
| `loop` | Repetición de elementos |

---

## Encabezado y Pie de Página Fijos

```json
{
  "version": "1.0",
  "pageSettings": { ... },
  "fixedHeader": {
    "height": 80,
    "elements": [
      {
        "type": "text",
        "id": "header-title",
        "x": 50,
        "y": 30,
        "value": "Company Name"
      }
    ]
  },
  "fixedFooter": {
    "height": 50,
    "elements": [
      {
        "type": "text",
        "id": "page-number",
        "x": 280,
        "y": 20,
        "dataBinding": "$currentPage | prefix:'Page ' | suffix:' of ' | concat:$totalPages"
      }
    ]
  },
  "pageElements": [ ... ]
}
```

Los encabezados y pies de página se repiten automáticamente en cada página.

---

## Próximos Pasos

- [Data Binding](/lib/guide/data-binding) - Vincula datos dinámicos
- [Elementos](/lib/guide/elements/text) - Conoce cada elemento
- [Ejemplos](/lib/examples/) - Ve ejemplos prácticos
