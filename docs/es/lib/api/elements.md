# Elements

Referencia completa de todos los elementos disponibles para las plantillas.

---

## Visión general

| Elemento | Descripción | Data Binding |
|---------|-------------|--------------|
| [TextElement](#textelement) | Texto estático o dinámico | ✅ |
| [RichTextElement](#richtextelement) | Texto en línea con formato Markdown | ✅ |
| [LinkElement](#linkelement) | Anotaciones de hipervínculo clicables | ✅ |
| [ImageElement](#imageelement) | Imágenes (URL, base64) | ✅ |
| [TableElement](#tableelement) | Tablas con paginación automática | ✅ |
| [ContainerElement](#containerelement) | Área delimitada para elementos hijos anidados | ❌ |
| [RectangleElement](#rectangleelement) | Rectángulos y fondos | ❌ |
| [LineElement](#lineelement) | Líneas y divisores | ❌ |
| [SpacerElement](#spacerelement) | Espaciado vertical/horizontal en el layout | ❌ |
| [BarcodeElement](#barcodeelement) | Códigos QR y códigos de barras | ✅ |
| [ConditionalElement](#conditionalelement) | Renderizado condicional | ✅ |
| [LoopElement](#loopelement) | Repetición de elementos | ✅ |
| [ListElement](#listelement) | Listas con viñetas o numeradas | ✅ |
| [CheckListElement](#checklistelement) | Listas de verificación con casillas | ✅ |

---

## Propiedades comunes

Todos los elementos comparten estas propiedades:

```json
{
  "type": "text",
  "id": "unique-element",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 50,
  "printCondition": "data.active == true"
}
```

| Propiedad | Tipo | Requerida | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Tipo de elemento |
| `id` | string | ⚠️ Recomendada | Identificador único |
| `x` | number | ✅ | Posición horizontal (pt) |
| `y` | number | ✅ | Posición vertical (pt) |
| `width` | number | ⚠️ Depende | Ancho |
| `height` | number | ⚠️ Depende | Alto |
| `printCondition` | string | ❌ | Condición para renderizar |

---

## TextElement

Renderiza texto estático o con data binding.

### Propiedades

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "width": 400,
  "value": "Static Text",
  "dataBinding": "customer.name | uppercase",
  "fontSize": 14,
  "fontFamily": "Helvetica",
  "fontWeight": "bold",
  "fontStyle": "normal",
  "color": "#2563eb",
  "alignment": "left",
  "lineHeight": 1.5
}
```

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `value` | string | - | Texto estático |
| `dataBinding` | string | - | Ruta de datos + pipes |
| `fontSize` | number | 12 | Tamaño de la fuente (pt) |
| `fontFamily` | string | Helvetica | Familia de la fuente |
| `fontWeight` | string | normal | `normal` o `bold` |
| `fontStyle` | string | normal | `normal` o `italic` |
| `color` | string | #000000 | Color en hexadecimal |
| `alignment` | string | left | `left`, `center`, `right`, `justify` |
| `lineHeight` | number | 1.2 | Altura de línea |

### Ejemplos

```json
// Static text
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 50,
  "value": "MONTHLY REPORT",
  "fontSize": 24,
  "fontWeight": "bold"
}

// Data binding with transformation
{
  "type": "text",
  "id": "customer",
  "x": 50,
  "y": 100,
  "dataBinding": "order.customer.name | uppercase",
  "fontSize": 14
}

// Inline date
{
  "type": "text",
  "id": "date",
  "x": 50,
  "y": 130,
  "dataBinding": "order.date | date:'MM/dd/yyyy'"
}
```

---

## ImageElement

Renderiza imágenes desde URL o base64.

### Propiedades

```json
{
  "type": "image",
  "id": "logo",
  "x": 50,
  "y": 50,
  "width": 150,
  "height": 80,
  "source": "https://example.com/logo.png",
  "dataBinding": "company.logo",
  "fit": "contain",
  "alignment": "center"
}
```

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `source` | string | - | URL estática o base64 |
| `dataBinding` | string | - | Ruta de datos hacia la URL |
| `fit` | string | contain | Modo de ajuste |
| `alignment` | string | center | Alineación |

### Modos de ajuste

| Modo | Comportamiento |
|------|----------|
| `contain` | Mantiene la proporción, cabe por completo |
| `cover` | Mantiene la proporción, llena el área |
| `fill` | Se estira para llenar |
| `scale-down` | Se reduce si es necesario |

---

## TableElement

Renderiza tablas con paginación automática.

### Propiedades

```json
{
  "type": "table",
  "id": "items",
  "x": 30,
  "y": 200,
  "width": 535,
  "dataBinding": "order.items",
  "columns": [
    {
      "header": "Code",
      "dataBinding": "$item.code",
      "width": 80,
      "alignment": "center"
    },
    {
      "header": "Description",
      "dataBinding": "$item.description",
      "width": 300
    },
    {
      "header": "Value",
      "dataBinding": "$item.value | currency:'USD'",
      "width": 155,
      "alignment": "right"
    }
  ],
  "style": {
    "headerBackground": "#2563eb",
    "headerColor": "#ffffff",
    "headerFontSize": 10,
    "headerFontWeight": "bold",
    "rowFontSize": 9,
    "alternateRowBackground": "#f3f4f6",
    "borderWidth": 0.5,
    "borderColor": "#d1d5db",
    "cellPadding": 5
  }
}
```

### Columna

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `header` | string | Texto del encabezado |
| `dataBinding` | string | `$item.field` para los datos |
| `width` | number | Ancho de la columna |
| `alignment` | string | `left`, `center`, `right` |

### Estilo

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `headerBackground` | string | Color de fondo del encabezado |
| `headerColor` | string | Color del texto del encabezado |
| `alternateRowBackground` | string | Color de las filas alternas |
| `borderWidth` | number | Grosor del borde |
| `borderColor` | string | Color del borde |
| `cellPadding` | number | Espaciado interno de la celda |

---

## RectangleElement

Renderiza rectángulos para fondos, bordes y decoraciones.

### Propiedades

```json
{
  "type": "rectangle",
  "id": "background",
  "x": 0,
  "y": 0,
  "width": 595,
  "height": 100,
  "fillColor": "#2563eb",
  "borderColor": "#1e40af",
  "borderWidth": 2,
  "cornerRadius": 8
}
```

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `fillColor` | string | - | Color de relleno |
| `borderColor` | string | - | Color del borde |
| `borderWidth` | number | 0 | Grosor del borde |
| `cornerRadius` | number | 0 | Radio de las esquinas |

---

## LineElement

Renderiza líneas horizontales, verticales o diagonales.

### Propiedades

```json
{
  "type": "line",
  "id": "divider",
  "x": 50,
  "y": 200,
  "width": 545,
  "height": 200,
  "color": "#d1d5db",
  "width": 1,
  "dashPattern": [5, 3]
}
```

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `width` | number | - | X final |
| `height` | number | - | Y final |
| `color` | string | #000000 | Color de la línea |
| `width` | number | 1 | Grosor |
| `dashPattern` | array | - | Patrón de guiones [guion, espacio] |

---

## BarcodeElement

Renderiza códigos QR y códigos de barras.

### Propiedades

```json
{
  "type": "barcode",
  "id": "qrcode",
  "x": 400,
  "y": 650,
  "width": 100,
  "height": 100,
  "barcodeType": "qrcode",
  "dataBinding": "payment.pixCode",
  "errorCorrection": "M"
}
```

| Propiedad | Tipo | Valores | Descripción |
|----------|------|--------|-------------|
| `barcodeType` | string | `qrcode`, `barcode` | Tipo |
| `dataBinding` | string | - | Datos a codificar |
| `value` | string | - | Valor estático |
| `errorCorrection` | string | `L`, `M`, `Q`, `H` | Nivel de corrección (QR) |

---

## ConditionalElement

Renderiza elementos hijos de forma condicional.

### Propiedades

```json
{
  "type": "conditional",
  "id": "stock-alert",
  "condition": "product.stock < 10",
  "elements": [
    {
      "type": "rectangle",
      "x": 400,
      "y": 100,
      "width": 120,
      "height": 25,
      "fillColor": "#fef2f2",
      "borderColor": "#f87171"
    },
    {
      "type": "text",
      "x": 410,
      "y": 107,
      "value": "⚠️ Low stock",
      "color": "#dc2626",
      "fontSize": 10
    }
  ]
}
```

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `condition` | string | Expresión booleana |
| `elements` | array | Elementos a renderizar |

### Operadores

- `==`, `!=` - Igualdad
- `>`, `<`, `>=`, `<=` - Comparación
- `&&`, `||` - Lógicos
- `in` - Pertenencia

---

## LoopElement

Repite elementos para cada ítem de una lista.

### Propiedades

```json
{
  "type": "loop",
  "id": "product-list",
  "dataBinding": "order.products",
  "x": 50,
  "y": 200,
  "itemHeight": 30,
  "elements": [
    {
      "type": "text",
      "x": 0,
      "y": 0,
      "dataBinding": "$item.name"
    },
    {
      "type": "text",
      "x": 300,
      "y": 0,
      "dataBinding": "$item.value | currency:'USD'"
    }
  ]
}
```

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `dataBinding` | string | Ruta hacia el array |
| `itemHeight` | number | Alto de cada ítem |
| `elements` | array | Plantilla para cada ítem |

### Variables especiales

- `$item` - Ítem de la iteración actual
- `$index` - Índice (base 0)

---

## ContainerElement

Actúa como un contenedor de layout que agrupa elementos hijos, con estilos de fondo y borde.

### Propiedades

```json
{
  "type": "container",
  "id": "card-box",
  "x": 50,
  "y": 100,
  "width": "100%",
  "autoHeight": true,
  "style": {
    "backgroundColor": "#F8FAFC",
    "borderColor": "#CBD5E1",
    "borderWidth": 1,
    "borderRadius": 6
  },
  "elements": []
}
```

| Propriedade | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `elements` | array | `[]` | Lista de elementos hijos anidados |
| `autoHeight` | boolean | `true` | Ajusta automáticamente el alto del contenedor al contenido |
| `heightMode` | string | `auto` | Modo de dimensionamiento del alto (`auto` o `fixed`) |
| `pageBreakBefore` | boolean | `false` | Cuando es true, renderiza el contenedor en una página nueva |
| `pageBreakCondition` | string | `null` | Expresión opcional para evaluar condicionalmente el salto |
| `style` | object | - | Estilos (`backgroundColor`, `borderColor`, `borderWidth`, `borderRadius`) |

---

## RichTextElement

Renderiza texto en línea con formato, con soporte de Markdown (`**negrita**`, `*cursiva*`).

### Propiedades

```json
{
  "type": "rich_text",
  "id": "notice",
  "x": 50,
  "y": 200,
  "width": 500,
  "value": "Total amount due is **${order.total}**. Please pay before *${order.dueDate}*.",
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#1E293B",
    "alignment": "left"
  }
}
```

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `value` | string | String con formato Markdown y expresiones opcionales `${expression}` |
| `dataBinding` | string | Fuente dinámica que contiene texto Markdown |
| `style` | object | Configuración de tipografía y alineación |

---

## LinkElement

Renderiza una anotación de hipervínculo PDF clicable.

### Propiedades

```json
{
  "type": "link",
  "id": "website-link",
  "x": 50,
  "y": 300,
  "url": "https://example.com",
  "value": "Visit our website",
  "style": {
    "fontSize": 12,
    "color": "#2563EB"
  }
}
```

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `url` | string | URL de destino del hipervínculo |
| `value` | string | Etiqueta de texto estática |
| `dataBinding` | string | Etiqueta de texto dinámica |
| `style` | object | Estilos de fuente y color |

---

## SpacerElement

Inserta un espacio vacío vertical u horizontal en layouts de flujo relativo.

### Propiedades

```json
{
  "type": "spacer",
  "id": "spacer-1",
  "height": 20,
  "width": "100%"
}
```

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `height` | number | `0` | Alto del espaciado en puntos |
| `width` | number \| string | `"100%"` | Ancho del espaciado en puntos o porcentaje |

---

## ListElement

Renderiza listas con viñetas, numeradas o personalizadas con soporte para flujo multipágina y ajuste automático.

### Propiedades

```json
{
  "type": "list",
  "id": "caracteristicas-list",
  "x": 40,
  "y": 150,
  "width": 500,
  "dataBinding": "caracteristicas",
  "listStyle": "BULLETED",
  "itemSpacing": 8,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

| Propiedad | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `dataBinding` | string | `""` | Ruta al arreglo en los datos |
| `items` | array | `[]` | Arreglo de cadenas estáticas (fallback) |
| `listStyle` | string | `"BULLETED"` | `"BULLETED"`, `"NUMBERED"`, `"START"`, `"DASH"`, `"DIAMOND"` |
| `startNumber` | number | `1` | Número inicial para listas numeradas |
| `itemSpacing` | number | `10` | Espacio vertical entre elementos en puntos |
| `startY` | number | `null` | Desplazamiento vertical inicial opcional |

---

## CheckListElement

Renderiza listas de tareas con casillas de verificación configurables (`RECTANGLE`, `BORDERED`, `CIRCLE`).

### Propiedades

```json
{
  "type": "check_list",
  "id": "tareas-checklist",
  "x": 40,
  "y": 280,
  "width": 500,
  "dataBinding": "tareas",
  "checkStyle": "BORDERED",
  "itemSpacing": 4,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

| Propiedad | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `dataBinding` | string | `""` | Ruta al mapa `{ "Etiqueta": boolean }` |
| `items` | object | `{}` | Mapa estático de tareas `{ "Tarea": true }` |
| `checkStyle` | string | `"RECTANGLE"` | `"RECTANGLE"`, `"BORDERED"`, `"CIRCLE"` |
| `itemSpacing` | number | `0` | Espacio vertical entre tareas en puntos |
| `startY` | number | `null` | Desplazamiento vertical inicial opcional |

---

## Próximos pasos

- [Plantillas JSON](/es/lib/guide/templates) - Estructura completa
- [Data Binding](/es/lib/guide/data-binding) - Data binding
- [Transformaciones](/es/lib/guide/transformations) - Pipes disponibles
