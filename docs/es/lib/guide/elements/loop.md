# Elemento Loop

El `LoopElement` permite repetir un conjunto de elementos por cada ítem de un arreglo, facilitando la generación de listas y tablas dinámicas.

## Cuándo Usar

Usa `LoopElement` para:
- ✅ Renderizar listas de ítems
- ✅ Crear layouts personalizados (alternativa a las tablas)
- ✅ Repetir grupos de elementos con diferentes datos
- ✅ Construir reportes con secciones repetitivas

::: tip Consejo
Para datos tabulares simples, usa [`TableElement`](/es/lib/guide/elements/table). Para layouts más complejos, usa `LoopElement`.
:::

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"loop"` |
| `id` | string | ✅ | Identificador único |
| `dataBinding` | string | ✅ | Ruta al arreglo |
| `elements` | array | ✅ | Elementos a repetir |
| `x` | number | ❌ | Posición X inicial |
| `y` | number | ❌ | Posición Y inicial |
| `width` | number | ❌ | Ancho del contenedor (para `100%` en los hijos) |
| `height` | number | ❌ | Alto de cada ítem (para `100%` en los hijos) |
| `itemSpacing` | number | ❌ | Espaciado vertical entre ítems (predeterminado: 0) |

::: tip Nueva Funcionalidad
`width` y `height` permiten que los elementos hijos usen `"100%"` para ocupar todo el espacio disponible del bucle.
:::

---

## Variables Especiales y Enlace de Datos

Dentro de un bucle, puedes acceder a las propiedades del ítem de dos formas:

| Forma | Ejemplo | Descripción |
|------|---------|-------------|
| Directa | `name` | Acceso directo a la propiedad (recomendado) |
| Con prefijo | `$item.name` | Acceso explícito al ítem |
| Índice | `$index` | Índice del ítem (base 0) |

::: tip Recomendación
Usa el acceso **directo** a las propiedades (sin `$item.`), como en las columnas de las tablas. ¡Es más simple y limpio!
:::

---

## Ejemplo Básico

```json
{
  "type": "loop",
  "id": "product-list",
  "dataBinding": "products",
  "ySpacing": 25,
  "elements": [
    {
      "type": "text",
      "id": "product-name",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "product-price",
      "x": 300,
      "y": 0,
      "dataBinding": "$item.price | currency:'BRL'",
      "style": {
        "fontSize": 12
      }
    }
  ]
}
```

**Datos:**
```json
{
  "products": [
    { "name": "Notebook", "price": 3500.00 },
    { "name": "Mouse", "price": 50.00 },
    { "name": "Keyboard", "price": 150.00 }
  ]
}
```

**Resultado:**
```
Notebook                              R$ 3,500.00
Mouse                                 R$ 50.00
Keyboard                              R$ 150.00
```

---

## Ejemplo con Índice

Muesta la numeración de los ítems:

```json
{
  "type": "loop",
  "id": "numbered-list",
  "dataBinding": "items",
  "ySpacing": 30,
  "elements": [
    {
      "type": "text",
      "id": "number",
      "x": 50,
      "y": 0,
      "dataBinding": "$index | concat:'. '",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "description",
      "x": 80,
      "y": 0,
      "dataBinding": "$item.description",
      "style": {
        "fontSize": 12
      }
    }
  ]
}
```

**Datos:**
```json
{
  "items": [
    { "description": "Prepare documentation" },
    { "description": "Review code" },
    { "description": "Deploy" }
  ]
}
```

**Resultado:**
```
0. Prepare documentation
1. Review code
2. Deploy
```

::: tip Consejo
Para que el índice empiece en 1, usa la transformación: `$index | concat:1 | concat:'. '`
:::

---

## Ejemplo con Múltiples Elementos

Crea tarjetas para cada producto:

```json
{
  "type": "loop",
  "id": "product-cards",
  "dataBinding": "products",
  "ySpacing": 120,
  "elements": [
    {
      "type": "rectangle",
      "id": "card-bg",
      "x": 50,
      "y": 0,
      "width": 500,
      "height": 100,
      "style": {
        "fillColor": "#f8f9fa",
        "strokeColor": "#dee2e6",
        "strokeWidth": 1
      }
    },
    {
      "type": "image",
      "id": "product-image",
      "x": 60,
      "y": 10,
      "width": 80,
      "height": 80,
      "dataBinding": "$item.image"
    },
    {
      "type": "text",
      "id": "product-name",
      "x": 160,
      "y": 20,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "product-description",
      "x": 160,
      "y": 45,
      "dataBinding": "$item.description | truncate:60",
      "style": {
        "fontSize": 10,
        "color": "#6c757d"
      }
    },
    {
      "type": "text",
      "id": "product-price",
      "x": 160,
      "y": 70,
      "dataBinding": "$item.price | currency:'BRL'",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold",
        "color": "#28a745"
      }
    }
  ]
}
```

---

## Bucle con Condiciones

Filtra los ítems usando `printCondition`:

```json
{
  "type": "loop",
  "id": "in-stock-products",
  "dataBinding": "products",
  "ySpacing": 25,
  "elements": [
    {
      "type": "text",
      "id": "product-info",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "printCondition": "$item.stock > 0"
    }
  ]
}
```

::: tip Alternativa
Usa `ConditionalElement` dentro del bucle:

```json
{
  "type": "loop",
  "elements": [
    {
      "type": "conditional",
      "condition": "$item.stock > 0",
      "elements": [
        { "type": "text", "dataBinding": "$item.name" }
      ]
    }
  ]
}
```
:::

---

## Bucle Anidado

Bucles dentro de bucles:

```json
{
  "type": "loop",
  "id": "categories",
  "dataBinding": "categories",
  "ySpacing": 100,
  "elements": [
    {
      "type": "text",
      "id": "category-name",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold"
      }
    },
    {
      "type": "loop",
      "id": "category-products",
      "x": 70,
      "y": 25,
      "dataBinding": "$item.products",
      "ySpacing": 20,
      "elements": [
        {
          "type": "text",
          "id": "product-name",
          "x": 0,
          "y": 0,
          "dataBinding": "$item.name"
        }
      ]
    }
  ]
}
```

**Datos:**
```json
{
  "categories": [
    {
      "name": "Electronics",
      "products": [
        { "name": "Notebook" },
        { "name": "Mouse" }
      ]
    },
    {
      "name": "Books",
      "products": [
        { "name": "Clean Code" },
        { "name": "Design Patterns" }
      ]
    }
  ]
}
```

**Resultado:**
```
Electronics
  Notebook
  Mouse

Books
  Clean Code
  Design Patterns
```

::: warning Atención
En bucles anidados, `$item` se refiere al ítem del bucle más interno. Para acceder al ítem del bucle externo, tendrás que usar un enlace de datos directo o reestructurar los datos.
:::

---

## Grid Layout

Para crear layouts de cuadrícula (múltiples columnas), calcula la posición X según el índice:

```json
{
  "type": "loop",
  "id": "product-grid",
  "dataBinding": "products",
  "elements": [
    {
      "type": "text",
      "x": "calc($index % 3 * 180 + 50)",
      "y": "calc(floor($index / 3) * 80 + 100)",
      "dataBinding": "$item.name"
    }
  ]
}
```

::: warning Limitación Actual
El cálculo dinámico de posiciones no tiene soporte nativo. Para layouts de cuadrícula, tendrás que:
- Preprocesar los datos en el backend
- O usar varios bucles con `slice` sobre los datos
:::

---

## Colores Alternos (Franjas Cebra)

Para alternar colores entre filas pares e impares:

**Plantilla:**
```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 30,
  "elements": [
    {
      "type": "rectangle",
      "printCondition": "$index % 2 == 0",
      "style": { "fillColor": "#f8f9fa" }
    },
    {
      "type": "rectangle",
      "printCondition": "$index % 2 != 0",
      "style": { "fillColor": "#ffffff" }
    },
    {
      "type": "text",
      "dataBinding": "$item.text"
    }
  ]
}
```

::: tip Alternativa Simple
¡Usa `TableElement`, que ya soporta franjas cebra nativamente!
:::

---

## Diferencia entre Loop y Table

| Aspecto | LoopElement | TableElement |
|--------|-------------|--------------|
| **Estructura** | Layout libre | Tabla estructurada |
| **Columnas** | Manuales | Automáticas |
| **Paginación** | ✅ Automática | ✅ Automática |
| **Flexibilidad** | Alta | Media |
| **Complejidad** | Alta | Baja |
| **Ideal para** | Layouts personalizados | Datos tabulares |

**Ejemplo comparativo:**

### Con Loop:
```json
{
  "type": "loop",
  "dataBinding": "products",
  "elements": [
    { "type": "text", "x": 50, "dataBinding": "$item.name" },
    { "type": "text", "x": 200, "dataBinding": "$item.price" }
  ]
}
```

### Con Table:
```json
{
  "type": "table",
  "dataBinding": "products",
  "columns": [
    { "header": "Name", "dataBinding": "$item.name" },
    { "header": "Price", "dataBinding": "$item.price" }
  ]
}
```

::: tip Recomendación
- Usa **Table** para datos tabulares simples
- Usa **Loop** para layouts complejos o personalizados
:::

---

## Rendimiento

::: tip Optimización
- Evita bucles muy largos (> 100 ítems)
- Para grandes volúmenes, considera paginar los datos
- Los bucles anidados multiplican el procesamiento
- Usa `printCondition` para filtrar ítems innecesarios
:::

---

## Paginación Automática

::: tip Novedad en v1.1
¡LoopElement ahora soporta **paginación automática**! Cuando los ítems del bucle exceden el espacio disponible en la página, se crea una nueva página automáticamente.
:::

### Cómo Funciona

1. El bucle calcula el alto de cada ítem en función de los elementos hijos
2. Verifica si el siguiente ítem cabe en la página actual
3. Si no cabe, crea una nueva página y continúa el bucle
4. El encabezado y el pie de página se repiten automáticamente en cada página

### Ejemplo con Muchos Ítems

```json
{
  "type": "loop",
  "id": "items-list",
  "dataBinding": "items",
  "x": 50,
  "y": 100,
  "width": 500,
  "height": 50,
  "itemSpacing": 10,
  "elements": [
    {
      "type": "rectangle",
      "x": 0,
      "y": 0,
      "width": "100%",
      "height": "100%",
      "style": { "fillColor": "#f3f4f6" }
    },
    {
      "type": "text",
      "x": 10,
      "y": 15,
      "dataBinding": "name"
    }
  ]
}
```

---

## Limitaciones

- ❌ Las posiciones son fijas (sin cálculo dinámico)
- ❌ El bucle anidado no accede directamente al ítem del bucle padre

---

## Casos de Uso

### Lista de Participantes

```json
{
  "type": "loop",
  "dataBinding": "participants",
  "ySpacing": 35,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name | capitalize",
      "style": { "fontSize": 12, "fontWeight": "bold" }
    },
    {
      "type": "text",
      "y": 15,
      "dataBinding": "$item.email | lowerCase",
      "style": { "fontSize": 10, "color": "#6c757d" }
    }
  ]
}
```

### Ítems de una Factura

```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 50,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.code | padLeft:6:'0' | prefix:'#'",
      "style": { "fontFamily": "monospace" }
    },
    {
      "type": "text",
      "x": 100,
      "dataBinding": "$item.description"
    },
    {
      "type": "text",
      "x": 350,
      "dataBinding": "$item.quantity | suffix:' un.'"
    },
    {
      "type": "text",
      "x": 450,
      "dataBinding": "$item.total | currency:'BRL'",
      "style": { "fontWeight": "bold" }
    }
  ]
}
```

---

## Próximos Pasos

- [TableElement](/es/lib/guide/elements/table) - Alternativa para datos tabulares
- [Conditional](/es/lib/guide/elements/conditional) - Combina bucles con condiciones
- [Transformaciones](/es/lib/guide/transformations) - Formatea datos en los bucles
- [Ejemplos](/es/lib/examples/) - Ve los bucles en acción
