# Elemento Spacer

El `SpacerElement` (`"type": "spacer"`) define un espaciado vacío vertical u horizontal en layouts de flujo, especialmente dentro de contenedores o flujos de posicionamiento relativo donde se requiere una separación dinámica entre elementos.

## Características

- ✅ **Dimensiones flexibles**: soporta puntos fijos (`height: 20`) o anchos en porcentaje (`"100%"`).
- ✅ **Despeje en el layout**: empuja los siguientes elementos del flujo hacia abajo según la altura configurada.
- ✅ **Espaciado condicional**: puede activarse u ocultarse condicionalmente con `printCondition`.

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"spacer"` |
| `id` | string | ✅ | Identificador único del elemento |
| `x` | number | ❌ | Posición horizontal (predeterminado: `0`) |
| `y` | number | ❌ | Posición vertical (predeterminado: `0`) |
| `width` | number \| string | ❌ | Ancho en puntos o porcentaje (predeterminado: `"100%"`) |
| `height` | number | ❌ | Altura del espaciado vertical en puntos (predeterminado: `0`) |
| `printCondition` | string | ❌ | Expresión de condición para activar el espaciador |
| `positionMode` | string | ❌ | `"absolute"` o `"relative"` |
| `relativeOffsetY` | number | ❌ | Espaciado cuando se coloca debajo del contenido de flujo anterior |

---

## Ejemplo: Espaciado Vertical entre Secciones

```json
{
  "type": "spacer",
  "id": "section-gap",
  "height": 24,
  "width": "100%"
}
```
