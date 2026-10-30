# Elemento Table

El `TableElement` renderiza datos tabulares con soporte de paginación automática, encabezados fijos y estilos personalizables.

## Características

- ✅ **Paginación automática**: los encabezados se repiten en cada página
- ✅ **Ancho flexible**: soporta valores fijos, porcentuales o automáticos
- ✅ **Franjas cebra**: colores alternos entre filas
- ✅ **Estilos personalizables**: colores, bordes, fuentes, alineaciones
- ✅ **Transformaciones**: aplica pipes a los datos de las celdas
- ✅ **Responsive**: ajuste automático del ancho de las columnas

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"table"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posición X |
| `y` | number | ✅ | Posición Y (ignorada si `paginated=true`) |
| `dataBinding` | string | ✅ | Ruta al arreglo de datos |
| `columns` | array | ✅ | Definición de las columnas |
| `width` | number\|string | ❌ | Ancho (número, "100%", o auto) |
| `paginated` | boolean | ❌ | Paginación automática (predeterminado: `true`) |
| `style` | object | ❌ | Estilos de la tabla |
| `printCondition` | string | ❌ | Condición para renderizar |

---

## Columnas

Cada columna tiene las siguientes propiedades:

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `header` | string | ✅ | Texto del encabezado |
| `field` | string | ✅ | Campo de enlace de datos (data binding), puede usar `$item` |
| `width` | number | ❌ | Ancho de la columna |
| `alignment` | string | ❌ | Alineación horizontal (`left`, `center`, `right`) |
| `verticalAlignment` | string | ❌ | Alineación vertical (`top`, `middle`, `bottom`) |
| `headerAlignment` | string | ❌ | Alineación del encabezado (prevalece sobre `alignment`) |
| `format` | string | ❌ | Formato (`text`, `number`, `currency`) |

---

## Ejemplo Básico

```json
{
  "type": "table",
  "id": "products-table",
  "x": 30,
  "y": 150,
  "dataBinding": "products",
  "columns": [
    {
      "header": "Code",
      "field": "code",
      "width": 80,
      "alignment": "center"
    },
    {
      "header": "Product",
      "field": "name",
      "width": 200,
      "alignment": "left"
    },
    {
      "header": "Price",
      "field": "price",
      "width": 100,
      "alignment": "right"
    }
  ]
}
```

**Datos:**
```json
{
  "products": [
    { "code": "001", "name": "Notebook", "price": 3500.00 },
    { "code": "002", "name": "Mouse", "price": 50.00 },
    { "code": "003", "name": "Keyboard", "price": 150.00 }
  ]
}
```

---

## Transformaciones en Columnas

Usa pipes en `field` para transformar los datos:

```json
{
  "columns": [
    {
      "header": "Name",
      "field": "$item.name | upperCase"
    },
    {
      "header": "Price",
      "field": "$item.price | currency:'BRL'"
    },
    {
      "header": "Date",
      "field": "$item.date | date:'dd/MM/yyyy'"
    },
    {
      "header": "Code",
      "field": "$item.code | padLeft:6:'0'"
    }
  ]
}
```

---

## Ancho de la Tabla

### Valor Fijo

```json
{
  "width": 535
}
```

### Porcentaje

```json
{
  "width": "100%"
}
```

Usa el 100% del ancho disponible (la página menos los márgenes).

### Auto

```json
{
  "width": null
}
```

O simplemente omite la propiedad. Usa la suma de los anchos de las columnas.

---

## Paginación

### Automática (predeterminada)

```json
{
  "paginated": true
}
```

- ✅ La tabla se divide automáticamente entre páginas
- ✅ El encabezado se repite en cada nueva página
- ✅ Respeta los márgenes y el encabezado/pie de página fijos
- ✅ Recomendado para tablas largas

### Deshabilitada

```json
{
  "paginated": false
}
```

- ⚠️ Usa posicionamiento fijo (X, Y)
- ⚠️ No se divide entre páginas automáticamente
- ⚠️ Puede cortarse al final de la página
- ✅ Úsala para tablas pequeñas o resúmenes

---

## Estilos

### Propiedades de Estilo

```json
{
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontWeight": "bold",
    "headerAlignment": "center",
    
    "fontSize": 9,
    "cellColor": "#374151",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f3f4f6",
    
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellBorderType": "all",
    
    "cellPadding": 6,
    "rowHeight": 25
  }
}
```

### Encabezado

| Propiedad | Descripción | Predeterminado |
|----------|-------------|---------|
| `headerBackground` | Color de fondo | `#f0f0f0` |
| `headerColor` | Color del texto | `#000000` |
| `headerFontSize` | Tamaño de fuente | `10` |
| `headerFontWeight` | Grosor de fuente | `bold` |
| `headerAlignment` | Alineación | `center` |
| `headerHeight` | Alto del encabezado | `30` |

### Celdas

| Propiedad | Descripción | Predeterminado |
|----------|-------------|---------|
| `fontSize` | Tamaño de fuente | `9` |
| `cellColor` | Color del texto | `#000000` |
| `cellBackground` | Color de fondo | `#ffffff` |
| `alternateRowBackground` | Color alternado (cebra) | `null` |
| `cellPadding` | Espaciado interno | `5` |
| `rowHeight` | Alto mínimo de fila | `auto` |

### Bordes

| Propiedad | Descripción | Predeterminado |
|----------|-------------|---------|
| `borderColor` | Color del borde | `#000000` |
| `borderWidth` | Espesor del borde | `1` |
| `cellBorderType` | Tipo de borde | `all` |

#### Tipos de Bordes

- `all`: bordes en todas las celdas
- `row`: solo bordes horizontales
- `cells`: bordes completos en cada celda
- `top-bottom`: solo bordes superior e inferior
- `left-right`: solo bordes izquierdo y derecho
- `none`: sin bordes

---

## Franjas Cebra (Colores Alternos)

```json
{
  "style": {
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f9fafb"
  }
}
```

Las filas pares e impares tendrán colores diferentes automáticamente.

---

## Alineación

### Por Columna

```json
{
  "columns": [
    {
      "header": "Code",
      "field": "code",
      "alignment": "center"
    },
    {
      "header": "Price",
      "field": "price",
      "alignment": "right"
    }
  ]
}
```

### Encabezado vs. Celdas

```json
{
  "header": "Quantity",
  "field": "qty",
  "alignment": "right",
  "headerAlignment": "center"
}
```

- Encabezado centrado
- Celdas alineadas a la derecha

---

## Ejemplo Completo: Factura

```json
{
  "type": "table",
  "id": "invoice-items",
  "x": 30,
  "y": 200,
  "width": "100%",
  "dataBinding": "items",
  "paginated": true,
  "columns": [
    {
      "header": "Code",
      "field": "$item.code | padLeft:6:'0'",
      "width": 60,
      "alignment": "center"
    },
    {
      "header": "Product Description",
      "field": "$item.description | capitalize",
      "width": 220,
      "alignment": "left"
    },
    {
      "header": "Qty.",
      "field": "$item.quantity",
      "width": 50,
      "alignment": "center"
    },
    {
      "header": "Unit",
      "field": "$item.unit | upperCase",
      "width": 50,
      "alignment": "center"
    },
    {
      "header": "Unit Price",
      "field": "$item.unitPrice | currency:'BRL'",
      "width": 80,
      "alignment": "right"
    },
    {
      "header": "Total",
      "field": "$item.total | currency:'BRL'",
      "width": 75,
      "alignment": "right"
    }
  ],
  "style": {
    "headerBackground": "#1e40af",
    "headerColor": "#ffffff",
    "headerFontSize": 9,
    "headerFontWeight": "bold",
    "headerAlignment": "center",
    "headerHeight": 25,
    
    "fontSize": 8,
    "cellColor": "#1f2937",
    "cellBackground": "#ffffff",
    "alternateRowBackground": "#f9fafb",
    
    "borderColor": "#d1d5db",
    "borderWidth": 0.5,
    "cellBorderType": "all",
    
    "cellPadding": 5
  },
  "printCondition": "items.length > 0"
}
```

---

## Anchos Responsive

Los anchos de las columnas se ajustan proporcionalmente si es necesario:

```json
{
  "width": 500,
  "columns": [
    { "header": "A", "field": "a", "width": 100 },
    { "header": "B", "field": "b", "width": 200 },
    { "header": "C", "field": "c", "width": 100 }
  ]
}
```

- Suma de columnas: 400
- Ancho de la tabla: 500
- Factor: 500 / 400 = 1.25
- Anchos ajustados: 125, 250, 125

---

## Dentro de Bucles

Puedes anidar tablas dentro de bucles:

```json
{
  "type": "loop",
  "dataBinding": "orders",
  "ySpacing": 200,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.number | prefix:'Order: #'",
      "style": { "fontSize": 14, "fontWeight": "bold" }
    },
    {
      "type": "table",
      "y": 25,
      "dataBinding": "$item.items",
      "paginated": false,
      "columns": [
        { "header": "Product", "field": "$item.name" },
        { "header": "Quantity", "field": "$item.qty" },
        { "header": "Value", "field": "$item.value | currency:'BRL'" }
      ]
    }
  ]
}
```

::: warning Atención
Cuando esté dentro de un bucle, usa `paginated: false` para evitar comportamientos inesperados.
:::

---

## Tablas Vacías

Si `dataBinding` devuelve un arreglo vacío:
- ✅ El encabezado se renderiza
- ✅ No hay filas de datos
- 💡 Usa `printCondition` para ocultarla por completo

```json
{
  "type": "table",
  "dataBinding": "items",
  "printCondition": "items.length > 0",
  "columns": [...]
}
```

---

## Rendimiento

::: tip Optimización
- Las tablas paginadas son más eficientes
- Limita la cantidad de columnas (< 10 recomendado)
- Usa `truncate` en textos largos
- Evita transformaciones complejas en las celdas
:::

---

## Limitaciones

- ❌ No soporta celdas combinadas (colspan/rowspan)
- ❌ No soporta sub-encabezados
- ❌ El alto de las filas es uniforme
- ❌ No soporta imágenes dentro de las celdas (usa solo `text`)

Para layouts más complejos, usa [LoopElement](/es/lib/guide/elements/loop).

---

## Comparación: Table vs. Loop

| Aspecto | TableElement | LoopElement |
|--------|--------------|-------------|
| **Paginación** | Automática | Manual |
| **Encabezados** | Sí | No |
| **Franjas cebra** | Sí | Manual |
| **Columnas uniformes** | Sí | Manual |
| **Libre layout** | No | Sí |
| **Complejidad** | Baja | Alta |
| **Ideal para** | Datos tabulares | Layouts personalizados |

---

## Casos de Uso

### Reporte de Ventas

```json
{
  "type": "table",
  "dataBinding": "sales",
  "columns": [
    { "header": "Date", "field": "$item.date | date:'dd/MM/yyyy'" },
    { "header": "Salesperson", "field": "$item.salesperson | capitalize'" },
    { "header": "Customer", "field": "$item.customer" },
    { "header": "Amount", "field": "$item.amount | currency:'BRL'" },
    { "header": "Status", "field": "$item.status | upperCase" }
  ],
  "style": {
    "alternateRowBackground": "#f3f4f6"
  }
}
```

### Extracto Bancario

```json
{
  "type": "table",
  "dataBinding": "transactions",
  "columns": [
    { "header": "Date", "field": "$item.date | date:'dd/MM'" },
    { "header": "Description", "field": "$item.description | truncate:40" },
    { "header": "Debit", "field": "$item.debit | currency:'BRL'" },
    { "header": "Credit", "field": "$item.credit | currency:'BRL'" },
    { "header": "Balance", "field": "$item.balance | currency:'BRL'" }
  ],
  "style": {
    "fontSize": 8,
    "cellPadding": 4,
    "borderWidth": 0.3
  }
}
```

### Lista de Asistencia

```json
{
  "type": "table",
  "dataBinding": "participants",
  "columns": [
    { "header": "No.", "field": "$index | concat:1", "width": 40 },
    { "header": "Name", "field": "$item.name", "width": 200 },
    { "header": "ID", "field": "$item.id", "width": 120 },
    { "header": "Signature", "field": "", "width": 175 }
  ],
  "style": {
    "headerBackground": "#1f2937",
    "headerColor": "#ffffff",
    "rowHeight": 35
  }
}
```

---

## Próximos Pasos

- [LoopElement](/es/lib/guide/elements/loop) - Alternativa para layouts complejos
- [Transformaciones](/es/lib/guide/transformations) - Formatea los datos de las celdas
- [Ejemplos](/es/lib/examples/) - Ve las tablas en acción
