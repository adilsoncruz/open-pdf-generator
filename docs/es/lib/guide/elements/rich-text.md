# Elemento Rich Text

El `RichTextElement` (`"type": "rich_text"` o `"richText"`) renderiza texto con estilos inline y soporte ligero para formato Markdown, como negrita (`**negrita**`) e itálica (`*itálica*`) dentro del mismo bloque.

## Características

- ✅ **Formato Markdown inline**: soporta tokens `**negrita**` e `*itálica*` en el mismo párrafo de texto.
- ✅ **Expresiones de plantilla (template)**: soporta interpolación de cadenas `${variable}` y transformaciones de datos.
- ✅ **Alineación de párrafo**: soporta `left`, `center`, `right` y `justify`.
- ✅ **Texto dinámico o estático**: funciona con `value` estático o `dataBinding` dinámico.

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"rich_text"` o `"richText"` |
| `id` | string | ✅ | Identificador único del elemento |
| `x` | number | ✅ | Posición horizontal en puntos |
| `y` | number | ✅ | Posición vertical en puntos |
| `value` | string | ⚠️ | Texto estático con marcado Markdown (requerido si `dataBinding` no está definido) |
| `dataBinding` | string | ⚠️ | Expresión o ruta que resuelve a texto Markdown |
| `width` | number | ❌ | Ancho en puntos (por defecto ocupa toda el área imprimible) |
| `height` | number | ❌ | Alto en puntos (se usa con `overflow: "hidden"`) |
| `style` | object | ❌ | Opciones de estilo (`fontSize`, `fontFamily`, `color`, `alignment`, `overflow`) |
| `printCondition` | string | ❌ | Expresión de condición para renderizar el elemento |
| `positionMode` | string | ❌ | `"absolute"` o `"relative"` |
| `relativeOffsetY` | number | ❌ | Desplazamiento relativo al elemento anterior del flujo |

---

## Ejemplo: Párrafo Formateado con Markdown

```json
{
  "type": "rich_text",
  "id": "terms-and-conditions",
  "x": 50,
  "y": 600,
  "width": 500,
  "value": "Please note that all **payments** are due within *30 days* of invoice issuance. Late fees may apply.",
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#334155",
    "alignment": "justify"
  }
}
```

## Ejemplo: Texto Dinámico con Markdown

```json
{
  "type": "rich_text",
  "id": "dynamic-notes",
  "x": 50,
  "y": 680,
  "width": 500,
  "dataBinding": "Order status for **${order.id}** is currently *${order.status}*.",
  "style": {
    "fontSize": 10,
    "color": "#1E293B"
  }
}
```
