# Condiciones

La librería permite la renderización condicional de elementos mediante dos enfoques:
- **`printCondition`**: Propiedad de cualquier elemento
- **`ConditionalElement`**: Elemento dedicado a agrupar condiciones

---

## printCondition

La propiedad `printCondition` puede añadirse a cualquier elemento para controlar su renderización.

### Sintaxis básica

```json
{
  "type": "text",
  "id": "my-text",
  "value": "This text is conditional",
  "printCondition": "total > 1000"
}
```

Si la condición es `true`, el elemento se renderiza. En caso contrario, se ignora.

---

## Operadores Soportados

### Comparación

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `==` | Igual | `status == 'approved'` |
| `!=` | Diferente | `type != 'cancelled'` |
| `>` | Mayor que | `total > 1000` |
| `<` | Menor que | `quantity < 10` |
| `>=` | Mayor o igual | `age >= 18` |
| `<=` | Menor o igual | `stock <= 5` |

### Inclusión

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `in` | Contenido en una lista | `status in ['active', 'pending', 'approved']` |

### Lógicos

| Operador | Descripción | Ejemplo |
|----------|-------------|---------|
| `&&` | Y lógico (AND) | `total > 1000 && status == 'approved'` |
| `\|\|` | O lógico (OR) | `type == 'A' \|\| type == 'B'` |

---

## Ejemplos por Tipo

### Comparación Numérica

Mostrar una alerta solo si el stock está bajo:

```json
{
  "type": "text",
  "id": "stock-alert",
  "value": "⚠️ Low stock!",
  "style": { "color": "#ff0000" },
  "printCondition": "product.stock < 10"
}
```

**Datos:**
```json
{
  "product": {
    "name": "Notebook",
    "stock": 5
  }
}
```

**Resultado:** El texto se muestra (5 < 10)

---

### Comparación de Cadenas

Mostrar una insignia solo para clientes VIP:

```json
{
  "type": "rectangle",
  "id": "vip-badge",
  "x": 400,
  "y": 50,
  "width": 60,
  "height": 25,
  "style": {
    "fillColor": "#FFD700",
    "strokeColor": "#FFA500"
  },
  "printCondition": "customer.type == 'VIP'"
}
```

**Datos:**
```json
{
  "customer": {
    "name": "John Smith",
    "type": "VIP"
  }
}
```

**Resultado:** El rectángulo se muestra

---

### Verificación Booleana

Mostrar el logotipo solo si la configuración lo permite:

```json
{
  "type": "image",
  "id": "logo",
  "source": "https://example.com/logo.png",
  "printCondition": "config.showLogo"
}
```

**Datos:**
```json
{
  "config": {
    "showLogo": true
  }
}
```

O con comparación explícita:

```json
{
  "printCondition": "document.confidential == true"
}
```

---

### Verificación de Arreglos/Listas

Mostrar una tabla solo si hay elementos:

```json
{
  "type": "table",
  "id": "products-table",
  "printCondition": "order.items.length > 0"
}
```

**Datos:**
```json
{
  "order": {
    "items": [
      { "name": "Product A", "price": 100 },
      { "name": "Product B", "price": 200 }
    ]
  }
}
```

**Resultado:** La tabla se muestra (2 > 0)

::: tip Consejo
Usa `length` o `size` para obtener el tamaño de arreglos/listas.
:::

---

### Operador IN

Mostrar el estado solo para estados específicos:

```json
{
  "type": "text",
  "id": "pending-status",
  "value": "⏳ Awaiting approval",
  "printCondition": "payment.status in ['pending', 'processing', 'under_review']"
}
```

**Datos:**
```json
{
  "payment": {
    "status": "pending"
  }
}
```

**Resultado:** El texto se muestra

---

### Operadores Lógicos

#### Y lógico (&&)

Mostrar un descuento solo si es VIP Y el total > 1000:

```json
{
  "type": "text",
  "id": "vip-discount",
  "value": "🎁 Special 10% discount",
  "printCondition": "customer.type == 'VIP' && order.total > 1000"
}
```

#### O lógico (||)

Mostrar una alerta para los tipos A o B:

```json
{
  "type": "text",
  "id": "type-alert",
  "value": "⚠️ Special attention required",
  "printCondition": "product.type == 'A' || product.type == 'B'"
}
```

---

### Propiedades Anidadas

Acceder a propiedades profundas:

```json
{
  "type": "text",
  "value": "Free shipping!",
  "printCondition": "order.address.state == 'CA'"
}
```

**Datos:**
```json
{
  "order": {
    "address": {
      "state": "CA",
      "city": "Los Angeles"
    }
  }
}
```

---

### Acceso a Índices de Arreglos

```json
{
  "type": "text",
  "value": "First item is special",
  "printCondition": "items.0.type == 'special'"
}
```

**Datos:**
```json
{
  "items": [
    { "type": "special", "name": "Item A" },
    { "type": "normal", "name": "Item B" }
  ]
}
```

---

### Variables del Sistema en Condiciones

Puedes usar variables del sistema como `_pageNumber` en las condiciones:

#### Mostrar un elemento solo en la primera página:

```json
{
  "type": "text",
  "value": "Welcome message (first page only)",
  "printCondition": "_pageNumber == 1"
}
```

#### Mostrar un elemento a partir de la página 2:

```json
{
  "type": "text",
  "value": "Continued from previous page...",
  "printCondition": "_pageNumber > 1"
}
```

#### Encabezado/pie de página con condiciones de página:

```json
{
  "header": {
    "height": 60,
    "printCondition": "_pageNumber > 1",
    "elements": [...]
  }
}
```

**Variables del Sistema Disponibles:**

| Variable | Descripción |
|----------|-------------|
| `_pageNumber` | Número de página actual (1, 2, 3...) |
| `_date` | Fecha actual (YYYY-MM-DD) |
| `_dateTime` | Fecha y hora actuales |

---

## Elemento Condicional

Usa `ConditionalElement` para agrupar varios elementos bajo una condición:

```json
{
  "type": "conditional",
  "id": "vip-section",
  "condition": "customer.type == 'VIP'",
  "elements": [
    {
      "type": "rectangle",
      "id": "vip-bg",
      "x": 50,
      "y": 100,
      "width": 500,
      "height": 80,
      "style": { "fillColor": "#FFD700" }
    },
    {
      "type": "text",
      "id": "vip-title",
      "x": 60,
      "y": 120,
      "value": "🌟 VIP CUSTOMER 🌟",
      "style": { "fontSize": 18, "fontWeight": "bold" }
    },
    {
      "type": "text",
      "id": "vip-benefit",
      "x": 60,
      "y": 150,
      "value": "You have 15% discount on all products"
    }
  ]
}
```

**Ventajas:**
- ✅ Agrupa elementos relacionados
- ✅ Una sola condición controla múltiples elementos
- ✅ Más eficiente que varios `printCondition`

---

## Casos de Uso Prácticos

### Factura

```json
{
  "elements": [
    {
      "type": "text",
      "value": "🏷️ Discount applied: {{discount | currency:'USD'}}",
      "printCondition": "discount > 0"
    },
    {
      "type": "text",
      "value": "📦 Free shipping!",
      "style": { "color": "#00aa00" },
      "printCondition": "shipping == 0"
    },
    {
      "type": "text",
      "value": "⚠️ Payment pending",
      "style": { "color": "#ff0000" },
      "printCondition": "status != 'paid'"
    }
  ]
}
```

---

### Reporte con Alertas

```json
{
  "elements": [
    {
      "type": "rectangle",
      "style": { "fillColor": "#ffcccc" },
      "printCondition": "sales < goal"
    },
    {
      "type": "text",
      "value": "🚨 GOAL NOT ACHIEVED",
      "style": { "color": "#aa0000", "fontWeight": "bold" },
      "printCondition": "sales < goal"
    },
    {
      "type": "rectangle",
      "style": { "fillColor": "#ccffcc" },
      "printCondition": "sales >= goal"
    },
    {
      "type": "text",
      "value": "✅ GOAL ACHIEVED",
      "style": { "color": "#00aa00", "fontWeight": "bold" },
      "printCondition": "sales >= goal"
    }
  ]
}
```

---

### Sección Condicional Completa

```json
{
  "type": "conditional",
  "id": "taxes-section",
  "condition": "taxes.length > 0",
  "elements": [
    {
      "type": "text",
      "value": "APPLICABLE TAXES",
      "style": { "fontSize": 14, "fontWeight": "bold" }
    },
    {
      "type": "table",
      "id": "taxes-table",
      "dataBinding": "taxes",
      "columns": [
        { "header": "Type", "dataBinding": "$item.type" },
        { "header": "Tax Base", "dataBinding": "$item.base | currency:'USD'" },
        { "header": "Rate", "dataBinding": "$item.rate | suffix:'%'" },
        { "header": "Amount", "dataBinding": "$item.amount | currency:'USD'" }
      ]
    }
  ]
}
```

---

## Condiciones vs Transformaciones

¡No confundas las condiciones con las transformaciones!

**❌ Incorrecto:**
```json
{
  "dataBinding": "name | if:status=='active'"
}
```

**✅ Correcto:**
```json
{
  "dataBinding": "name",
  "printCondition": "status == 'active'"
}
```

::: tip Consejo
- **Transformaciones** (`|`): modifican valores
- **Condiciones** (`printCondition`): controlan la renderización
:::

---

## Comportamiento ante Errores

Si la evaluación de una condición falla (campo inexistente, error de sintaxis, etc.), el elemento **SE RENDERIZA** por defecto para evitar la pérdida de información.

Para un comportamiento más estricto, valida tus plantillas antes de usarlas en producción.

---

## Rendimiento

::: tip Optimización
- Las condiciones se evalúan una sola vez por elemento
- Usa `ConditionalElement` para agrupar elementos (más eficiente)
- Evita condiciones complejas con muchos `&&` o `||`
- Prefiere condiciones simples y directas
:::

---

## Próximos Pasos

- [Transformaciones](/es/lib/guide/transformations) - Modificar valores
- [Elementos Condicionales](/es/lib/guide/elements/conditional) - Detalles de ConditionalElement
- [Bucles](/es/lib/guide/elements/loop) - Combinar bucles con condiciones
- [Ejemplos](/es/lib/examples/) - Ver las condiciones en acción
