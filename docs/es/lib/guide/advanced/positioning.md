# Posicionamiento de Elementos

Por defecto, todos los elementos usan posicionamiento absoluto con coordenadas X e Y fijas. A partir de la versión 1.1, puedes usar el **posicionamiento relativo** para crear layouts dinámicos.

## Modo de Posición

| Modo | Comportamiento |
|------|----------|
| `ABSOLUTE` | Posición fija en el lienzo (predeterminado) |
| `RELATIVE` | Posición basada en el contenido anterior |

---

## Posicionamiento Absoluto

El modo predeterminado. Las coordenadas `x` e `y` definen la posición exacta del elemento en la página.

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "value": "This text is at position (50, 100)"
}
```

**Cuándo usarlo:**
- El layout es fijo y predecible
- Los elementos no dependen de contenido dinámico
- Encabezados, pies de página y etiquetas estáticas

---

## Posicionamiento Relativo

El elemento se posiciona en relación al elemento anterior. La `y` del lienzo se ignora y se usa `relativeOffsetY` para definir el espaciado.

```json
{
  "type": "text",
  "x": 50,
  "positionMode": "RELATIVE",
  "relativeOffsetY": 20,
  "value": "This text appears 20pt below the previous element"
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `positionMode` | string | `"ABSOLUTE"` o `"RELATIVE"` |
| `relativeOffsetY` | number | Espaciado vertical (predeterminado: 10) |

**Cuándo usarlo:**
- El layout depende de contenido dinámico
- Después de bucles con cantidad variable de elementos
- Después de textos multilínea con `overflow: auto`

---

## Ejemplo: Factura con Bucle

Un caso común es tener los elementos de un bucle seguidos de un total:

```json
{
  "elements": [
    {
      "type": "text",
      "id": "title",
      "x": 50,
      "y": 50,
      "value": "INVOICE ITEMS",
      "style": { "fontWeight": "bold" }
    },
    {
      "type": "loop",
      "id": "items",
      "dataBinding": "items",
      "x": 50,
      "y": 80,
      "width": 500,
      "height": 30,
      "itemSpacing": 5,
      "elements": [
        {
          "type": "text",
          "x": 0,
          "y": 5,
          "dataBinding": "name"
        },
        {
          "type": "text",
          "x": 400,
          "y": 5,
          "dataBinding": "price | currency:'BRL'"
        }
      ]
    },
    {
      "type": "line",
      "id": "separator",
      "x": 50,
      "y": 0,
      "width": 550,
      "height": 0,
      "positionMode": "RELATIVE",
      "relativeOffsetY": 10
    },
    {
      "type": "text",
      "id": "total",
      "x": 400,
      "y": 0,
      "positionMode": "RELATIVE",
      "relativeOffsetY": 15,
      "dataBinding": "total | currency:'BRL'",
      "style": { 
        "fontWeight": "bold",
        "fontSize": 14 
      }
    }
  ]
}
```

### Comportamiento

1. **Título** - Posición absoluta en (50, 50)
2. **Bucle (loop)** - Comienza en (50, 80), cada elemento tiene 30pt de altura + 5pt de espaciado
3. **Línea separadora** - Posicionada 10pt por debajo del último elemento del bucle
4. **Total** - Posicionado 15pt por debajo de la línea

Independientemente de cuántos elementos tenga el bucle, ¡el separador y el total siempre quedan posicionados correctamente!

---

## Combinación con Overflow Auto

Para textos multilínea que pueden tener tamaños variables:

```json
[
  {
    "type": "text",
    "id": "description",
    "x": 50,
    "y": 100,
    "width": 500,
    "height": 50,
    "dataBinding": "description",
    "style": {
      "multiline": true,
      "overflow": "auto"
    }
  },
  {
    "type": "text",
    "id": "signature",
    "x": 50,
    "positionMode": "RELATIVE",
    "relativeOffsetY": 30,
    "value": "_____________________\nSignature"
  }
]
```

El `overflow: auto` hace que la altura del texto se ajuste al contenido, y el elemento de la firma se posiciona después de todo el texto, independientemente de cuántas líneas tenga.

---

## Orden de los Elementos

::: warning Importante
El posicionamiento relativo depende del **orden de los elementos** en el arreglo. El cálculo de `currentY` se realiza de forma secuencial.
:::

Los elementos con `positionMode: RELATIVE` se posicionan en relación a la `currentY` acumulada, que se actualiza después de cada elemento renderizado.

---

## Limitaciones

- ❌ No funciona en el Encabezado ni en el Pie de página (usa un layout fijo)
- ❌ No afecta la posición X (solo la Y es relativa)
- ❌ Los elementos dentro de bucles usan un posicionamiento local al bucle

---

## Próximos Pasos

- [Elemento Loop](/es/lib/guide/elements/loop) - Bucles con paginación automática
- [Elemento Texto](/es/lib/guide/elements/text) - Texto multilínea con overflow
- [Paginación](/es/lib/guide/advanced/pagination) - Entender cómo funciona la paginación
