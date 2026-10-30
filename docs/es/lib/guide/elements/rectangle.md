# Elemento Rectangle

El `RectangleElement` dibuja rectángulos para fondos, bordes, divisores y decoraciones visuales.

## Características

- ✅ **Dimensiones flexibles**: valores absolutos o porcentuales
- ✅ **Colores personalizables**: relleno y borde
- ✅ **Esquinas redondeadas**: radio de esquina configurable
- ✅ **Estilos de borde**: sólido, discontinuo, punteado
- ✅ **Transparencia**: soporta relleno o borde transparentes

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"rectangle"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posición X |
| `y` | number | ✅ | Posición Y |
| `width` | number\|string | ✅ | Ancho (número o "100%") |
| `height` | number\|string | ✅ | Alto (número o "100%") |
| `style` | object | ❌ | Estilos del rectángulo |
| `printCondition` | string | ❌ | Condición para renderizar |

---

## Estilos

```json
{
  "style": {
    "fillColor": "#2563eb",
    "borderColor": "#1e40af",
    "borderWidth": 2,
    "cornerRadius": 8,
    "penStyle": "solid"
  }
}
```

| Propiedad | Tipo | Descripción | Predeterminado |
|----------|------|-------------|---------|
| `fillColor` | hex | Color de relleno | `null` (transparente) |
| `borderColor` | hex | Color del borde | `null` |
| `borderWidth` | number | Espesor del borde | `1` |
| `cornerRadius` | number | Radio de las esquinas | `0` (cuadradas) |
| `penStyle` | string | Estilo de línea | `solid` |

---

## Ejemplo Básico

### Rectángulo Simple

```json
{
  "type": "rectangle",
  "id": "box",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 100,
  "style": {
    "fillColor": "#dbeafe",
    "borderColor": "#2563eb",
    "borderWidth": 1
  }
}
```

---

## Dimensiones

### Valores Absolutos

```json
{
  "width": 200,
  "height": 100
}
```

Valores fijos en puntos (pt).

---

### Valores Porcentuales

```json
{
  "width": "100%",
  "height": "50%"
}
```

Porcentaje del contenedor (encabezado, cuerpo o pie de página).

**Ejemplo práctico:**
```json
{
  "type": "rectangle",
  "id": "header-background",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 100,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

Llena todo el ancho del encabezado con una altura de 100pt.

---

## Colores

### Relleno

```json
{
  "style": {
    "fillColor": "#3b82f6"
  }
}
```

Rectángulo con relleno, sin borde.

---

### Borde

```json
{
  "style": {
    "borderColor": "#ef4444",
    "borderWidth": 2
  }
}
```

Rectángulo transparente con borde rojo de 2pt.

---

### Ambos

```json
{
  "style": {
    "fillColor": "#fef3c7",
    "borderColor": "#f59e0b",
    "borderWidth": 1
  }
}
```

Rectángulo amarillo claro con borde naranja.

---

### Transparente

Para un rectángulo completamente transparente (marcador de posición):

```json
{
  "style": {
    "fillColor": null,
    "borderColor": null
  }
}
```

---

## Esquinas Redondeadas

### Radio de Esquina

```json
{
  "style": {
    "cornerRadius": 12
  }
}
```

| Valor | Resultado |
|-------|--------|
| `0` | Esquinas cuadradas (predeterminado) |
| `4-8` | Ligeramente redondeadas |
| `12-16` | Moderadamente redondeadas |
| `24+` | Muy redondeadas |
| `width/2` | Círculo perfecto (si width = height) |

**Ejemplos visuales:**

```json
// Esquinas cuadradas
{ "cornerRadius": 0 }
┌────────┐
│        │
└────────┘

// Ligeramente redondeadas
{ "cornerRadius": 8 }
╭────────╮
│        │
╰────────╯

// Muy redondeadas
{ "cornerRadius": 20 }
╭────────╮
│        │
╰────────╯

// Forma de píldora (height/2)
{ "cornerRadius": 25, "height": 50 }
╭───────╮
│       │
╰───────╯
```

---

## Estilos de Bordes

### Sólido (Predeterminado)

```json
{
  "style": {
    "penStyle": "solid"
  }
}
```

```
────────────────
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
─── ─── ─── ───
```

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
· · · · · · · ·
```

---

## Casos de Uso

### Fondo del Encabezado

```json
{
  "type": "rectangle",
  "id": "header-bg",
  "x": 0,
  "y": 0,
  "width": "100%",
  "height": 100,
  "style": {
    "fillColor": "#1e40af"
  }
}
```

---

### Cuadro de Información

```json
{
  "type": "rectangle",
  "id": "info-box",
  "x": 50,
  "y": 200,
  "width": 495,
  "height": 80,
  "style": {
    "fillColor": "#fef3c7",
    "borderColor": "#f59e0b",
    "borderWidth": 1,
    "cornerRadius": 8
  }
}
```

Con texto superpuesto:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "box",
      "x": 50,
      "y": 200,
      "width": 495,
      "height": 80,
      "style": {
        "fillColor": "#fef3c7",
        "borderColor": "#f59e0b",
        "borderWidth": 1,
        "cornerRadius": 8
      }
    },
    {
      "type": "text",
      "id": "box-text",
      "x": 70,
      "y": 230,
      "value": "⚠️ Attention: Electronic fiscal document",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold",
        "color": "#92400e"
      }
    }
  ]
}
```

---

### Divisor Visual

```json
{
  "type": "rectangle",
  "id": "divider",
  "x": 50,
  "y": 300,
  "width": 495,
  "height": 2,
  "style": {
    "fillColor": "#e5e7eb"
  }
}
```

---

### Insignia/Etiqueta

```json
{
  "type": "rectangle",
  "id": "vip-badge",
  "x": 450,
  "y": 50,
  "width": 80,
  "height": 30,
  "style": {
    "fillColor": "#dc2626",
    "cornerRadius": 15
  }
}
```

Con texto:

```json
{
  "type": "text",
  "x": 465,
  "y": 60,
  "value": "VIP",
  "style": {
    "fontSize": 12,
    "fontWeight": "bold",
    "color": "#ffffff"
  }
}
```

---

### Borde Discontinuo (Línea de Corte)

```json
{
  "type": "rectangle",
  "id": "cut-line",
  "x": 20,
  "y": 750,
  "width": 555,
  "height": 1,
  "style": {
    "borderColor": "#9ca3af",
    "borderWidth": 1,
    "penStyle": "dashed"
  }
}
```

---

### Fondo con Degradado (Simulado)

Como no hay soporte nativo de degradados, simúlalo con varios rectángulos:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 0,
      "y": 0,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#1e40af"
      }
    },
    {
      "type": "rectangle",
      "x": 0,
      "y": 20,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#2563eb"
      }
    },
    {
      "type": "rectangle",
      "x": 0,
      "y": 40,
      "width": "100%",
      "height": 20,
      "style": {
        "fillColor": "#3b82f6"
      }
    }
  ]
}
```

---

## Ayudante de Grid/Layout

Usa rectángulos transparentes para depurar el layout:

```json
{
  "type": "rectangle",
  "id": "debug-area",
  "x": 50,
  "y": 100,
  "width": 200,
  "height": 300,
  "style": {
    "borderColor": "#ff0000",
    "borderWidth": 1,
    "penStyle": "dotted"
  }
}
```

::: tip Consejo de Depuración
Agrega rectángulos con borde rojo punteado para visualizar las áreas de los elementos durante el desarrollo. ¡Elimínalos antes de pasar a producción!
:::

---

## Condiciones

Muestra el rectángulo solo bajo condiciones:

```json
{
  "type": "rectangle",
  "style": {
    "fillColor": "#dcfce7",
    "borderColor": "#16a34a"
  },
  "printCondition": "status == 'approved'"
}
```

---

## Superposición (Z-index)

Los rectángulos se renderizan en el orden en que aparecen en la plantilla:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "background",
      "x": 50,
      "y": 100,
      "width": 200,
      "height": 100,
      "style": {
        "fillColor": "#dbeafe"
      }
    },
    {
      "type": "rectangle",
      "id": "foreground",
      "x": 100,
      "y": 150,
      "width": 100,
      "height": 50,
      "style": {
        "fillColor": "#fef3c7"
      }
    }
  ]
}
```

El segundo rectángulo aparece sobre el primero.

---

## Rendimiento

::: tip Optimización
- Los rectángulos son muy livianos
- Úsalos libremente para fondos y divisores
- Prefiere rectángulos sobre imágenes cuando sea posible
- El renderizado es instantáneo
:::

---

## Limitaciones

- ❌ No soporta degradados nativos
- ❌ No soporta sombras
- ❌ No soporta transformaciones (rotar, sesgar)
- ❌ `cornerRadius` es igual para todas las esquinas
- ❌ No soporta bordes múltiples (doble, relieve, etc.)

---

## Colores Hexadecimales

Usa siempre el formato de 6 dígitos:

```json
✅ "#2563eb"
✅ "#ff0000"
✅ "#f3f4f6"

❌ "#fff"  // No funciona
❌ "blue"  // No funciona
❌ "rgb(255,0,0)"  // No funciona
```

---

## Próximos Pasos

- [Elemento Line](/es/lib/guide/elements/line) - Líneas y divisores
- [Elemento Image](/es/lib/guide/elements/image) - Fondos con imágenes
- [Elemento Text](/es/lib/guide/elements/text) - Texto superpuesto
- [Ejemplos](/es/lib/examples/) - Ve el Rectangle en acción
