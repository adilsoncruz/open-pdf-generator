# Elemento List (Lista)

El `ListElement` renderiza listas con viñetas, numeradas o con estilos personalizados, con soporte para vinculación de datos dinámica, ajuste de línea automático (multilínea), espaciado personalizado y paginación automática entre páginas.

## Características

- ✅ **Estilos de Marcador**: `BULLETED` (•), `NUMBERED` (1, 2, 3), `START` (★), `DASH` (–), `DIAMOND` (◆)
- ✅ **Data Binding**: Vinculación a arreglos de cadenas u objetos (`dataBinding: "items"`)
- ✅ **Elementos Estáticos**: Definición directa de elementos estáticos en la plantilla (`items: ["Elemento 1", "Elemento 2"]`)
- ✅ **Control de Numeración**: Configuración de `startNumber` (inicio en 1, 5, 10, etc.)
- ✅ **Espaciado**: Ajuste fino del espaciado vertical entre elementos con `itemSpacing`
- ✅ **Ajuste Multilínea**: Texto largo ajusta automáticamente según el ancho
- ✅ **Flujo Multipágina**: Salto de página automático cuando el contenido supera la altura disponible

---

## Propiedades

| Propiedad | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `type` | string | ✅ | Debe ser `"list"` |
| `id` | string | ✅ | Identificador único del elemento |
| `x` | number | ✅ | Posición horizontal (pt) |
| `y` | number | ✅ | Posición vertical (pt) |
| `width` | number / string | ❌ | Ancho en puntos o `"100%"` (por defecto: 400) |
| `height` | number | ❌ | Alto en puntos (por defecto: 50) |
| `dataBinding` | string | ❌ | Ruta a la lista/arreglo en los datos (ej: `"items"` o `"pedido.articulos"`) |
| `items` | array | ❌ | Arreglo de cadenas estáticas (utilizado si no hay data binding) |
| `listStyle` | string | ❌ | `"BULLETED"` (por defecto), `"NUMBERED"`, `"START"`, `"DASH"` o `"DIAMOND"` |
| `startNumber` | number | ❌ | Número inicial para listas numeradas (por defecto: 1) |
| `itemSpacing` | number | ❌ | Espaciado vertical entre elementos en puntos (por defecto: 10) |
| `startY` | number | ❌ | Desplazamiento vertical inicial personalizado |
| `style` | object | ❌ | Estilos visuales (`fontSize`, `fontFamily`, `color`, `backgroundColor`) |
| `printCondition` | string | ❌ | Expresión condicional para renderizado |

---

## Ejemplos en JSON

### Lista Dinámica Numerada

```json
{
  "type": "list",
  "id": "pasos-pedido",
  "x": 40,
  "y": 120,
  "width": 500,
  "dataBinding": "pasos",
  "listStyle": "NUMBERED",
  "itemSpacing": 8,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

### Lista Estática con Viñetas

```json
{
  "type": "list",
  "id": "caracteristicas",
  "x": 40,
  "y": 250,
  "width": "100%",
  "listStyle": "BULLETED",
  "items": [
    "Alto rendimiento con OpenPDF",
    "Flujo y paginación automática entre páginas",
    "Editor visual de alta fidelidad y CLI integrada"
  ],
  "itemSpacing": 6,
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

---

## DSL Programática en Kotlin

```kotlin
val template = TemplateBuilder()
    .addList {
        id = "terminos-list"
        x = 40f
        y = 150f
        width = 515f
        dataBinding = "terminos"
        listStyle = ListMode.BULLETED
        itemSpacing = 8f
        style = TextStyle(fontSize = 10f, color = "#475569")
    }
    .build()
```
