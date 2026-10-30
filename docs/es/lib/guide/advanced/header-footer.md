# Encabezado y Pie de Página Fijos

Los encabezados y pies de página fijos son elementos que se repiten en todas las páginas del documento, ideales para logotipos, títulos, numeración de páginas e información legal.

## Vista General

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │         ENCABEZADO FIJO           │  │ ← Se repite en todas las páginas
│  └───────────────────────────────────┘  │
│                                         │
│           CONTENIDO DE LA PÁGINA        │
│           (Cuerpo / Elementos)          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         PIE DE PÁGINA FIJO        │  │ ← Se repite en todas las páginas
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Estructura de la Plantilla

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

## Encabezado Fijo

### Propiedades

| Propiedad | Tipo | Obligatorio | Descripción |
|----------|------|----------|-------------|
| `height` | number | ✅ | Altura del encabezado en puntos |
| `elements` | array | ✅ | Lista de elementos |

### Ejemplo Básico

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

## Pie de Página Fijo

### Propiedades

| Propiedad | Tipo | Obligatorio | Descripción |
|----------|------|----------|-------------|
| `height` | number | ✅ | Altura del pie de página en puntos |
| `elements` | array | ✅ | Lista de elementos |

### Ejemplo Básico

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
        "width": 565,
        "height": 0,
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

## Variables del Sistema

Dentro de los encabezados y pies de página, puedes usar variables especiales del sistema:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `_pageNumber` | Número de página actual | 1, 2, 3... |
| `_date` | Fecha actual (YYYY-MM-DD) | 2026-01-16 |
| `_dateTime` | Fecha y hora actuales | 2026-01-16T14:30:45 |

### Ejemplo de Uso

```json
{
  "type": "text",
  "dataBinding": "_pageNumber",
  "style": {
    "fontSize": 9
  }
}
```

O combinado con texto:

```json
{
  "type": "text",
  "value": "Page ${_pageNumber}",
  "style": {
    "fontSize": 9
  }
}
```

### Fecha en el Pie de Página

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

## Encabezado/Pie de Página Condicional

Puedes controlar cuándo se muestra el encabezado/pie de página usando `printCondition`:

### Propiedades

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `printCondition` | string | Condición para mostrar/ocultar el encabezado/pie de página |

### Mostrar el Encabezado Solo desde la Página 2

```json
{
  "header": {
    "height": 60,
    "printCondition": "_pageNumber > 1",
    "elements": [...]
  }
}
```

### Mostrar el Pie de Página Solo en la Primera Página

```json
{
  "footer": {
    "height": 40,
    "printCondition": "_pageNumber == 1",
    "elements": [...]
  }
}
```

### Basado en Datos

```json
{
  "header": {
    "height": 80,
    "printCondition": "showHeader == true",
    "elements": [...]
  }
}
```

::: tip Espacio Dinámico
Al usar `printCondition` con `_pageNumber`, el espacio para el encabezado/pie de página se ajusta automáticamente por página. Por ejemplo, si el encabezado solo aparece desde la página 2, la página 1 tendrá más espacio para el contenido.
:::

---

## Coordenadas

### Sistema de Coordenadas

Dentro de `fixedHeader` y `fixedFooter`, las coordenadas son **relativas** al contenedor:

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

- `x=0` → margen izquierdo de la página
- `y=0` → parte superior del contenedor (encabezado) o parte superior del pie de página
- Ancho disponible: `pageWidth - marginLeft - marginRight`

---

## Ancho del 100%

Usa `"100%"` para ocupar todo el ancho:

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

El rectángulo ocupará todo el ancho disponible (página - márgenes).

---

## Ejemplo Completo: Factura

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
        "width": 535,
        "height": 5,
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

## Layout de Múltiples Columnas en el Encabezado

Crea layouts complejos posicionando los elementos manualmente:

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

## Consejos

### 1. Calcula el Área Útil

```
Área útil del cuerpo = pageHeight - marginTop - marginBottom - headerHeight - footerHeight

A4 Vertical:
842 - 30 - 30 - 80 - 50 = 652pt de área útil para contenido
```

### 2. Usa Líneas Divisorias

```json
{
  "type": "line",
  "x": 0,
  "y": 79,
  "width": 535,
  "height": 79,
  "style": {
    "color": "#e5e7eb",
    "width": 1
  }
}
```

### 3. Código QR en el Pie de Página

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

## Limitaciones

- ❌ La altura es fija (no se ajusta automáticamente al contenido)
- ❌ No soporta múltiples encabezados/pies de página (solo un encabezado y un pie)
- ❌ `totalPages` aún no está soportado (solo `_pageNumber` está disponible)

---

## Rendimiento

::: tip Optimización
- Los encabezados/pies de página se renderizan una vez y se replican
- Las imágenes del encabezado se cachean automáticamente
- Prefiere SVG/PNG ligeros para los logotipos
:::

---

## Próximos Pasos

- [Paginación](/es/lib/guide/advanced/pagination) - Control de saltos de página
- [Elemento Tabla](/es/lib/guide/elements/table) - Tablas paginadas con encabezado repetido
- [Ejemplos](/es/lib/examples/) - Ver el encabezado/pie de página en acción
