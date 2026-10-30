# Elemento Container

El `ContainerElement` actúa como una caja contenedora y contexto de layout relativo para varios elementos hijos. Permite anidar elementos, aplicar estilos de fondo y bordes, y estructurar layouts dinámicos de documentos.

## Características

- ✅ **Layouts anidados**: contiene una lista de elementos hijos (`text`, `image`, `shape`, etc.) posicionados relativos al contenedor.
- ✅ **Ancho y alto dinámicos**: soporta valores fijos (`400`), porcentajes (`"100%"`) y `autoHeight`.
- ✅ **Estilos**: color de fondo, bordes, radio de las esquinas y padding a través de `style`.
- ✅ **Renderizado condicional**: soporta `printCondition` para mostrar u ocultar todo el contenedor y sus hijos.
- ✅ **Cálculo de altura automático**: se expande automáticamente según su contenido interno cuando `autoHeight: true`.

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"container"` |
| `id` | string | ✅ | Identificador único del elemento |
| `x` | number | ❌ | Posición X (predeterminado: `0`) |
| `y` | number | ❌ | Posición Y (predeterminado: `0`) |
| `width` | number \| string | ❌ | Ancho en puntos o en porcentaje como `"100%"` (predeterminado: `400`) |
| `height` | number \| string | ❌ | Alto en puntos o porcentaje (predeterminado: `50`) |
| `autoHeight` | boolean | ❌ | Ajusta automáticamente el alto al contenido (predeterminado: `true`) |
| `heightMode` | string | ❌ | `"auto"` o `"fixed"` (predeterminado: `"auto"`) |
| `elements` | array | ✅ | Lista de elementos hijos dentro del contenedor |
| `style` | object | ❌ | Estilos: `backgroundColor`, `borderColor`, `borderWidth`, `borderRadius` |
| `printCondition` | string | ❌ | Expresión de condición para renderizar el contenedor |
| `positionMode` | string | ❌ | Modo de posición (`"absolute"` o `"relative"`) |
| `relativeOffsetY` | number | ❌ | Espaciado cuando se coloca debajo del contenido de flujo anterior |

---

## Ejemplo: Contenedor de Tarjeta con Elementos Anidados

```json
{
  "type": "container",
  "id": "customer-card",
  "x": 30,
  "y": 120,
  "width": "100%",
  "autoHeight": true,
  "style": {
    "backgroundColor": "#F8FAFC",
    "borderColor": "#E2E8F0",
    "borderWidth": 1,
    "borderRadius": 8
  },
  "elements": [
    {
      "type": "text",
      "id": "card-title",
      "x": 15,
      "y": 15,
      "text": "Customer Information",
      "font": { "size": 12, "style": "bold", "color": "#0F172A" }
    },
    {
      "type": "text",
      "id": "customer-name",
      "x": 15,
      "y": 35,
      "text": "Name: {{customer.name}}",
      "font": { "size": 10, "color": "#334155" }
    },
    {
      "type": "text",
      "id": "customer-email",
      "x": 15,
      "y": 50,
      "text": "Email: {{customer.email}}",
      "font": { "size": 10, "color": "#334155" }
    }
  ]
}
```

---

## Contenedores de Fondo a Todo el Ancho

Los contenedores también pueden abarcar un ancho del `100%` para crear encabezados de sección, banners o tarjetas destacadas:

```json
{
  "type": "container",
  "id": "header-banner",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 60,
  "autoHeight": false,
  "style": {
    "backgroundColor": "#0F172A"
  },
  "elements": [
    {
      "type": "text",
      "id": "banner-text",
      "x": 30,
      "y": 20,
      "text": "ORDER CONFIRMATION",
      "font": { "size": 16, "style": "bold", "color": "#FFFFFF" }
    }
  ]
}
```
