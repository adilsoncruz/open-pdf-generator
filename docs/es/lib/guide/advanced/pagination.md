# Paginación

La librería ofrece control de paginación automático y manual para documentos de varias páginas.

## Vista General

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Página 1      │   │   Página 2      │   │   Página 3      │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │ Encabezado  │ │   │ │ Encabezado  │ │   │ │ Encabezado  │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
│                 │   │                 │   │                 │
│  Tabla Pt 1     │   │  Tabla Pt 2     │   │  Tabla Pt 3     │
│  ───────────    │   │  ───────────    │   │  ───────────    │
│  fila 1         │   │  fila 21        │   │  fila 41        │
│  fila 2         │   │  fila 22        │   │  fila 42        │
│  ...            │   │  ...            │   │  ...            │
│  fila 20        │   │  fila 40        │   │  fila 50        │
│                 │   │                 │   │                 │
│ ┌─────────────┐ │   │ ┌─────────────┐ │   │ ┌─────────────┐ │
│ │ Pie de pág. │ │   │ │ Pie de pág. │ │   │ │ Pie de pág. │ │
│ └─────────────┘ │   │ └─────────────┘ │   │ └─────────────┘ │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## Paginación Automática

### Tablas

Las tablas con `paginated: true` se dividen automáticamente:

```json
{
  "type": "table",
  "id": "product-list",
  "dataBinding": "products",
  "paginated": true,
  "columns": [...]
}
```

**Comportamiento:**
- ✅ Salto automático al llegar al final del área útil
- ✅ El encabezado de la tabla se repite en cada página
- ✅ Respeta `fixedHeader` y `fixedFooter`
- ✅ Las filas no se cortan a la mitad

### Valores para `paginated`

| Valor | Comportamiento |
|-------|----------|
| `true` | Paginación automática (recomendado) |
| `false` | Posición fija, sin salto |
| `null` (omitido) | Predeterminado: `true` |

---

## Variables de Página

Usa estas variables en cualquier texto:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| <code v-pre>{{pageNumber}}</code> | Página actual | 1, 2, 3... |
| <code v-pre>{{totalPages}}</code> | Total de páginas | 10 |

### Ejemplos de Uso

```json
{
  "type": "text",
  "value": "Page {{pageNumber}}",
  "style": { "fontSize": 9 }
}
```

**Resultado:** `Page 3`

```json
{
  "type": "text",
  "value": "{{pageNumber}} of {{totalPages}}",
  "style": { "fontSize": 9 }
}
```

**Resultado:** `3 of 10`

```json
{
  "type": "text",
  "value": "Sheet {{pageNumber}}/{{totalPages}}",
  "style": { "fontSize": 9 }
}
```

**Resultado:** `Sheet 3/10`

---

## Área Útil de Impresión

### Cálculo

```
Área útil = Altura de la página 
          - Margen superior 
          - Margen inferior 
          - Altura del encabezado 
          - Altura del pie de página
```

### Ejemplo (A4 Vertical)

```
Página A4: 842pt de altura
Márgenes: 30pt (superior) + 30pt (inferior) = 60pt
Encabezado: 80pt
Pie de página: 50pt

Área útil = 842 - 60 - 80 - 50 = 652pt
```

La tabla ocupará como máximo 652pt por página antes de dividirse.

---

## Paginación Manual

Para control total, usa `paginated: false`:

```json
{
  "type": "table",
  "id": "summary",
  "x": 50,
  "y": 500,
  "paginated": false,
  "dataBinding": "summary",
  "columns": [...]
}
```

**Comportamiento:**
- Tabla posicionada exactamente en (x, y)
- No divide páginas automáticamente
- Puede cortarse si excede el área de la página

::: warning Precaución
Usa `paginated: false` solo para tablas pequeñas o cuando necesites un posicionamiento exacto (por ejemplo, resúmenes, totales).
:::

---

## Encabezado de la Tabla en Cada Página

Con `paginated: true`, el encabezado de la tabla se repite automáticamente:

```json
{
  "type": "table",
  "paginated": true,
  "columns": [
    { "header": "Code", "field": "$item.code" },
    { "header": "Description", "field": "$item.description" },
    { "header": "Value", "field": "$item.value" }
  ]
}
```

**Página 1:**
```
┌─────────┬───────────────┬─────────┐
│ Code    │ Description   │ Value   │  ← Encabezado
├─────────┼───────────────┼─────────┤
│ 001     │ Product A     │ $100    │
│ 002     │ Product B     │ $200    │
│ ...     │ ...           │ ...     │
└─────────┴───────────────┴─────────┘
```

**Página 2:**
```
┌─────────┬───────────────┬─────────┐
│ Code    │ Description   │ Value   │  ← El encabezado se repite
├─────────┼───────────────┼─────────┤
│ 021     │ Product U     │ $500    │
│ 022     │ Product V     │ $600    │
│ ...     │ ...           │ ...     │
└─────────┴───────────────┴─────────┘
```

---

## Numeración de Páginas en el Pie de Página

### Ejemplo Completo

```json
{
  "fixedFooter": {
    "height": 40,
    "elements": [
      {
        "type": "line",
        "x": 0,
        "y": 5,
        "x2": 535,
        "y2": 5,
        "style": {
          "color": "#e5e7eb",
          "width": 0.5
        }
      },
      {
        "type": "text",
        "x": 0,
        "y": 15,
        "value": "Confidential document",
        "style": {
          "fontSize": 8,
          "color": "#9ca3af"
        }
      },
      {
        "type": "text",
        "x": 480,
        "y": 15,
        "value": "Page {{pageNumber}} of {{totalPages}}",
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

## Elementos que Afectan la Paginación

### Elementos Paginados

| Elemento | Paginación |
|---------|------------|
| Tabla (`paginated: true`) | ✅ Automática |
| Tabla (`paginated: false`) | ❌ Manual |
| Loop | ❌ No pagina automáticamente |
| Texto, Imagen, Rectángulo, Línea | ❌ Posición fija |

### Impacto de fixedHeader/Footer

```
Sin encabezado/pie de página:
┌─────────────────────────────────┐
│ ← Margen superior (30pt)        │
│                                 │
│        Área útil completa       │
│           (782pt)               │
│                                 │
│ ← Margen inferior (30pt)        │
└─────────────────────────────────┘

Con encabezado (80pt) y pie de página (50pt):
┌─────────────────────────────────┐
│ ← Margen superior (30pt)        │
│ ┌─────────────────────────────┐ │
│ │    Encabezado (80pt)        │ │
│ └─────────────────────────────┘ │
│                                 │
│      Área útil reducida         │
│           (652pt)               │
│                                 │
│ ┌─────────────────────────────┐ │
│ │   Pie de página (50pt)      │ │
│ └─────────────────────────────┘ │
│ ← Margen inferior (30pt)        │
└─────────────────────────────────┘
```

---

## Forzar Nueva Página

Actualmente no existe soporte nativo para forzar saltos de página. Alternativas:

### 1. Dividir los Datos

Procesa los datos por adelantado y crea plantillas separadas:

```kotlin
// Divide los datos en dos mitades
val data1 = data.filter { /* primera mitad */ }
val data2 = data.filter { /* segunda mitad */ }

generator.generate(template, data1, File("part1.pdf"))
generator.generate(template, data2, File("part2.pdf"))

// Concatena los PDFs si es necesario
```

### 2. Usar Múltiples Tablas

```json
{
  "elements": [
    {
      "type": "table",
      "dataBinding": "section1",
      "paginated": true
    },
    {
      "type": "table",
      "dataBinding": "section2",
      "paginated": true
    }
  ]
}
```

Cada tabla puede comenzar en una nueva página si la anterior ocupa suficiente espacio.

---

## Rendimiento

### Consejos de Optimización

::: tip Optimización
1. **Limita las filas por página**: Evita tablas con miles de filas
2. **Pre-calcula los totales**: No uses transformaciones pesadas en cada celda
3. **Caché de imágenes**: Los encabezados con imágenes se cachean automáticamente
4. **Evita bucles grandes**: Prefiere tablas para datos tabulares
:::

### Estimación de Páginas

```kotlin
val rowsPerPage = (usableArea / rowHeight).toInt()
val totalPages = ceil(totalRows / rowsPerPage)
```

---

## Ejemplos Prácticos

### Reporte con Muchos Datos

```json
{
  "fixedHeader": {
    "height": 60,
    "elements": [
      {
        "type": "text",
        "value": "Sales Report - 2025"
      }
    ]
  },
  "fixedFooter": {
    "height": 30,
    "elements": [
      {
        "type": "text",
        "value": "{{pageNumber}}/{{totalPages}}"
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "dataBinding": "sales",
      "paginated": true,
      "columns": [
        { "header": "Date", "field": "$item.date | date:'dd/MM/yyyy'" },
        { "header": "Customer", "field": "$item.customer" },
        { "header": "Value", "field": "$item.value | currency:'BRL'" }
      ]
    }
  ]
}
```

### Factura con Ítems

```json
{
  "fixedHeader": {
    "height": 120,
    "elements": [...]
  },
  "fixedFooter": {
    "height": 80,
    "elements": [
      {
        "type": "text",
        "value": "Access key: {{invoice.key}}"
      },
      {
        "type": "barcode",
        "barcodeType": "qrcode",
        "dataBinding": "invoice.qrcode"
      },
      {
        "type": "text",
        "value": "Sheet {{pageNumber}} of {{totalPages}}"
      }
    ]
  },
  "elements": [
    {
      "type": "table",
      "dataBinding": "invoice.items",
      "paginated": true
    }
  ]
}
```

---

## Limitaciones

- ❌ No soporta salto de página forzado
- ❌ El loop no pagina automáticamente
- ❌ Los textos largos no se dividen entre páginas
- ❌ Las imágenes no se dividen entre páginas
- ❌ No soporta "keep together" (mantener elementos juntos)

---

## Próximos Pasos

- [Encabezado y Pie de Página](/es/lib/guide/advanced/header-footer) - Encabezados y pies de página fijos
- [Elemento Tabla](/es/lib/guide/elements/table) - Detalles de la tabla paginada
- [Rendimiento](/es/lib/guide/advanced/performance) - Optimización para grandes volúmenes
