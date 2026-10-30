# Elemento Line

El `LineElement` dibuja líneas rectas (horizontales, verticales o diagonales) para divisores, subrayados y decoraciones.

## Características

- ✅ **Cualquier dirección**: horizontal, vertical o diagonal
- ✅ **Varios estilos**: sólido, discontinuo, punteado
- ✅ **Espesor personalizable**: desde líneas finísimas hasta líneas gruesas
- ✅ **Patrones personalizados**: patrones de trazos flexibles
- ✅ **Liviano y rápido**: renderizado instantáneo

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"line"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posición X inicial |
| `y` | number | ✅ | Posición Y inicial |
| `width` | number | ✅ | Posición X final |
| `height` | number | ✅ | Posición Y final |
| `style` | object | ❌ | Estilos de la línea |
| `printCondition` | string | ❌ | Condición para renderizar |

---

## Estilos

```json
{
  "style": {
    "color": "#9ca3af",
    "width": 1,
    "penStyle": "solid",
    "dashPattern": null
  }
}
```

| Propiedad | Tipo | Descripción | Predeterminado |
|----------|------|-------------|---------|
| `color` | hex | Color de la línea | `#000000` |
| `width` | number | Espesor en puntos | `1` |
| `penStyle` | string | Estilo: `solid`, `dashed`, `dotted` | `solid` |
| `dashPattern` | array | Patrón personalizado `[dash, gap]` | `null` |

::: tip Consejo
`penStyle` tiene prioridad sobre `dashPattern`. Usa uno u otro.
:::

---

## Ejemplo Básico

### Línea Horizontal

```json
{
  "type": "line",
  "id": "divider",
  "x": 50,
  "y": 300,
  "width": 545,
  "height": 300,
  "style": {
    "color": "#d1d5db",
    "width": 1
  }
}
```

### Línea Vertical

```json
{
  "type": "line",
  "id": "separator",
  "x": 300,
  "y": 100,
  "width": 300,
  "height": 700,
  "style": {
    "color": "#9ca3af",
    "width": 0.5
  }
}
```

### Línea Diagonal

```json
{
  "type": "line",
  "id": "diagonal",
  "x": 50,
  "y": 50,
  "width": 200,
  "height": 150,
  "style": {
    "color": "#ef4444",
    "width": 2
  }
}
```

---

## Direcciones

### Horizontal (→)

```json
{
  "x": 50,
  "y": 300,
  "width": 545,
  "height": 300
}
```

`y` igual, `width > x`

---

### Vertical (↓)

```json
{
  "x": 300,
  "y": 100,
  "width": 300,
  "height": 700
}
```

`x` igual, `height > y`

---

### Diagonal (↘)

```json
{
  "x": 50,
  "y": 50,
  "width": 200,
  "height": 200
}
```

`width > x` y `height > y`

---

### Diagonal Inversa (↙)

```json
{
  "x": 200,
  "y": 50,
  "width": 50,
  "height": 200
}
```

`width < x` y `height > y`

---

## Espesor

### Línea Fina

```json
{
  "style": {
    "width": 0.5
  }
}
```

```
────────────────
```

Ideal para: detalles delicados, líneas sutiles

---

### Normal

```json
{
  "style": {
    "width": 1
  }
}
```

```
────────────────
```

Ideal para: divisores estándar, bordes

---

### Media

```json
{
  "style": {
    "width": 2
  }
}
```

```
━━━━━━━━━━━━━━━━
```

Ideal para: títulos, secciones importantes

---

### Gruesa

```json
{
  "style": {
    "width": 4
  }
}
```

```
████████████████
```

Ideal para: divisiones principales, énfasis

---

## Estilos de Línea

### Sólido (Predeterminado)

```json
{
  "style": {
    "penStyle": "solid"
  }
}
```

```
────────────────────────
```

---

### Discontinuo (Dashed)

```json
{
  "style": {
    "penStyle": "dashed"
  }
}
```

```
─── ─── ─── ─── ─── ───
```

Patrón interno: `[6, 3]`

---

### Punteado (Dotted)

```json
{
  "style": {
    "penStyle": "dotted"
  }
}
```

```
· · · · · · · · · · · ·
```

Patrón interno: `[1, 2]`

---

## Patrones Personalizados (dashPattern)

### Formato

```json
{
  "style": {
    "dashPattern": [dash, gap]
  }
}
```

El arreglo define el patrón de trazos y espacios.

---

### Ejemplos de Patrones

#### Trazos Cortos

```json
{
  "dashPattern": [5, 3]
}
```

```
─── ─── ─── ─── ───
```

---

#### Trazos Largos

```json
{
  "dashPattern": [10, 5]
}
```

```
────── ────── ──────
```

---

#### Puntos

```json
{
  "dashPattern": [1, 3]
}
```

```
· · · · · · · · · ·
```

---

#### Trazo-Punto

```json
{
  "dashPattern": [10, 3, 2, 3]
}
```

```
────── · ────── · ──────
```

---

#### Trazo-Punto-Punto

```json
{
  "dashPattern": [10, 3, 2, 3, 2, 3]
}
```

```
────── · · ────── · · ──────
```

---

## Casos de Uso

### Divisor de Sección

```json
{
  "type": "line",
  "id": "section-divider",
  "x": 50,
  "y": 250,
  "width": 545,
  "height": 250,
  "style": {
    "color": "#e5e7eb",
    "width": 1
  }
}
```

---

### Línea de Corte

```json
{
  "type": "line",
  "id": "cut-line",
  "x": 20,
  "y": 750,
  "width": 575,
  "height": 750,
  "style": {
    "color": "#9ca3af",
    "width": 0.5,
    "dashPattern": [10, 5]
  }
}
```

Con texto:

```json
{
  "type": "text",
  "x": 10,
  "y": 745,
  "value": "✂",
  "style": {
    "fontSize": 12,
    "color": "#9ca3af"
  }
}
```

---

### Subrayado

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "value": "ANNUAL REPORT 2025",
  "style": {
    "fontSize": 18,
    "fontWeight": "bold"
  }
}
{
  "type": "line",
  "id": "underline",
  "x": 50,
  "y": 122,
  "width": 250,
  "height": 122,
  "style": {
    "color": "#2563eb",
    "width": 2
  }
}
```

---

### Cuadrícula / Tabla Manual

```json
{
  "elements": [
    {
      "type": "line",
      "id": "line-h1",
      "x": 50,
      "y": 200,
      "width": 545,
      "height": 200
    },
    {
      "type": "line",
      "id": "line-h2",
      "x": 50,
      "y": 230,
      "width": 545,
      "height": 230
    },
    {
      "type": "line",
      "id": "line-v1",
      "x": 50,
      "y": 200,
      "width": 50,
      "height": 230
    },
    {
      "type": "line",
      "id": "line-v2",
      "x": 250,
      "y": 200,
      "width": 250,
      "height": 230
    },
    {
      "type": "line",
      "id": "line-v3",
      "x": 545,
      "y": 200,
      "width": 545,
      "height": 230
    }
  ]
}
```

::: tip Consejo
Para tablas, usa [`TableElement`](/es/lib/guide/elements/table), ¡que es más fácil!
:::

---

### Borde de un Cuadro

```json
{
  "elements": [
    {
      "type": "line",
      "id": "top",
      "x": 50,
      "y": 100,
      "width": 250,
      "height": 100
    },
    {
      "type": "line",
      "id": "bottom",
      "x": 50,
      "y": 200,
      "width": 250,
      "height": 200
    },
    {
      "type": "line",
      "id": "left",
      "x": 50,
      "y": 100,
      "width": 50,
      "height": 200
    },
    {
      "type": "line",
      "id": "right",
      "x": 250,
      "y": 100,
      "width": 250,
      "height": 200
    }
  ]
}
```

::: tip Consejo
Para rectángulos, usa [`RectangleElement`](/es/lib/guide/elements/rectangle), ¡que es más simple!
:::

---

### Flecha (Simulada)

```json
{
  "elements": [
    {
      "type": "line",
      "id": "arrow-body",
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 200,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    },
    {
      "type": "line",
      "id": "arrow-tip-1",
      "x": 300,
      "y": 200,
      "width": 285,
      "height": 190,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    },
    {
      "type": "line",
      "id": "arrow-tip-2",
      "x": 300,
      "y": 200,
      "width": 285,
      "height": 210,
      "style": {
        "color": "#2563eb",
        "width": 2
      }
    }
  ]
}
```

---

## Condiciones

Muestra la línea solo bajo condiciones:

```json
{
  "type": "line",
  "x": 50,
  "y": 500,
  "width": 545,
  "height": 500,
  "printCondition": "showDivider == true"
}
```

---

## Dentro de Bucles

```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 40,
  "elements": [
    {
      "type": "text",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name"
    },
    {
      "type": "line",
      "x": 50,
      "y": 25,
      "width": 545,
      "height": 25,
      "style": {
        "color": "#e5e7eb",
        "width": 0.5
      }
    }
  ]
}
```

Crea una línea divisoria después de cada ítem.

---

## Rendimiento

::: tip Optimización
- Las líneas son extremadamente livianas
- Úsalas libremente para divisores y decoraciones
- El renderizado es instantáneo
- Sin impacto en el tamaño del PDF
:::

---

## Limitaciones

- ❌ No soporta curvas (solo líneas rectas)
- ❌ No soporta flechas nativas
- ❌ No soporta degradados
- ❌ No soporta sombras
- ❌ Los patrones discontinuos muy complejos pueden no renderizarse bien

---

## Cálculo de Coordenadas

### Línea Horizontal a Todo el Ancho

```json
{
  "x": 30,
  "y": 300,
  "width": 565,  // 595 (A4) - 30 (margin)
  "height": 300
}
```

### Línea Vertical a Toda la Altura

```json
{
  "x": 300,
  "y": 30,
  "width": 300,
  "height": 812  // 842 (A4) - 30 (margin)
}
```

---

## Colores

Usa siempre el formato hexadecimal de 6 dígitos:

```json
✅ "#9ca3af"
✅ "#000000"
✅ "#ff0000"

❌ "#aaa"  // No funciona
❌ "gray"  // No funciona
❌ "rgb(156,163,175)"  // No funciona
```

---

## Consejos de Diseño

### Divisores Sutiles

```json
{
  "style": {
    "color": "#e5e7eb",
    "width": 0.5
  }
}
```

### Divisores Medios

```json
{
  "style": {
    "color": "#d1d5db",
    "width": 1
  }
}
```

### Divisores Fuertes

```json
{
  "style": {
    "color": "#9ca3af",
    "width": 2
  }
}
```

---

## Próximos Pasos

- [Elemento Rectangle](/es/lib/guide/elements/rectangle) - Alternativa para bordes completos
- [Elemento Text](/es/lib/guide/elements/text) - Combínalo con subrayados
- [Elemento Table](/es/lib/guide/elements/table) - Alternativa para cuadrículas
- [Ejemplos](/es/lib/examples/) - Ve el Line en acción
