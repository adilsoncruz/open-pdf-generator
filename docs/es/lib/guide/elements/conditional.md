# Elemento Conditional

El `ConditionalElement` permite agrupar varios elementos bajo una misma condición, renderizándolos solo cuando la condición se cumple.

## Cuándo Usar

Usa `ConditionalElement` cuando:
- ✅ Varios elementos comparten la misma condición
- ✅ Quieres agrupar lógicamente elementos relacionados
- ✅ Necesitas mejor rendimiento (una condición frente a muchas)

Usa `printCondition` cuando:
- ✅ Solo un elemento necesita una condición
- ✅ Las condiciones son diferentes para cada elemento

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"conditional"` |
| `id` | string | ✅ | Identificador único |
| `condition` | string | ✅ | Expresión booleana |
| `elements` | array | ✅ | Lista de elementos hijos |
| `x` | number | ❌ | Posición X (predeterminado: 0) |
| `y` | number | ❌ | Posición Y (predeterminado: 0) |

---

## Ejemplo Básico

```json
{
  "type": "conditional",
  "id": "discount-section",
  "condition": "discount > 0",
  "elements": [
    {
      "type": "text",
      "id": "discount-title",
      "x": 50,
      "y": 200,
      "value": "💰 DISCOUNT APPLIED",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold",
        "color": "#00aa00"
      }
    },
    {
      "type": "text",
      "id": "discount-value",
      "x": 50,
      "y": 220,
      "dataBinding": "discount | currency:'BRL'",
      "style": {
        "fontSize": 12,
        "color": "#00aa00"
      }
    }
  ]
}
```

**Datos:**
```json
{
  "discount": 150.00
}
```

**Resultado:** Ambos textos se renderizan porque `discount > 0`.

---

## Ejemplo: Cliente VIP

Renderiza una sección especial solo para clientes VIP:

```json
{
  "type": "conditional",
  "id": "vip-benefits",
  "condition": "customer.type == 'VIP'",
  "elements": [
    {
      "type": "rectangle",
      "id": "vip-bg",
      "x": 50,
      "y": 100,
      "width": 500,
      "height": 120,
      "style": {
        "fillColor": "#fff3cd",
        "strokeColor": "#ffc107",
        "strokeWidth": 2
      }
    },
    {
      "type": "text",
      "id": "vip-title",
      "x": 70,
      "y": 125,
      "value": "🌟 VIP CUSTOMER 🌟",
      "style": {
        "fontSize": 18,
        "fontWeight": "bold",
        "color": "#856404"
      }
    },
    {
      "type": "text",
      "id": "benefit-1",
      "x": 70,
      "y": 155,
      "value": "✓ 15% discount on all products",
      "style": {
        "fontSize": 12,
        "color": "#856404"
      }
    },
    {
      "type": "text",
      "id": "benefit-2",
      "x": 70,
      "y": 175,
      "value": "✓ Free shipping nationwide",
      "style": {
        "fontSize": 12,
        "color": "#856404"
      }
    },
    {
      "type": "text",
      "id": "benefit-3",
      "x": 70,
      "y": 195,
      "value": "✓ Priority customer service",
      "style": {
        "fontSize": 12,
        "color": "#856404"
      }
    }
  ]
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

---

## Ejemplo: Tabla de Impuestos

Muestra la sección de impuestos solo si hay impuestos:

```json
{
  "type": "conditional",
  "id": "taxes-section",
  "condition": "taxes.length > 0",
  "elements": [
    {
      "type": "text",
      "id": "taxes-title",
      "x": 50,
      "y": 400,
      "value": "APPLICABLE TAXES",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold"
      }
    },
    {
      "type": "line",
      "id": "taxes-line",
      "x1": 50,
      "y1": 420,
      "width": 550,
      "height": 420,
      "style": {
        "strokeColor": "#000000",
        "strokeWidth": 1
      }
    },
    {
      "type": "table",
      "id": "taxes-table",
      "x": 50,
      "y": 430,
      "dataBinding": "taxes",
      "columns": [
        {
          "header": "Type",
          "dataBinding": "$item.type",
          "width": 100
        },
        {
          "header": "Base",
          "dataBinding": "$item.base | currency:'BRL'",
          "width": 120
        },
        {
          "header": "Rate",
          "dataBinding": "$item.rate | suffix:'%'",
          "width": 80
        },
        {
          "header": "Amount",
          "dataBinding": "$item.amount | currency:'BRL'",
          "width": 120
        }
      ]
    }
  ]
}
```

**Datos con impuestos:**
```json
{
  "taxes": [
    { "type": "VAT", "base": 1000.00, "rate": 18, "amount": 180.00 },
    { "type": "PIS", "base": 1000.00, "rate": 1.65, "amount": 16.50 },
    { "type": "COFINS", "base": 1000.00, "rate": 7.6, "amount": 76.00 }
  ]
}
```

**Resultado:** Toda la sección de impuestos (título, línea y tabla) se renderiza.

**Datos sin impuestos:**
```json
{
  "taxes": []
}
```

**Resultado:** No se renderiza nada (toda la sección se omite).

---

## Condiciones Complejas

### Operador AND (&&)

```json
{
  "type": "conditional",
  "id": "special-discount",
  "condition": "customer.type == 'VIP' && order.total > 1000",
  "elements": [
    {
      "type": "text",
      "value": "🎁 You won a special gift!"
    }
  ]
}
```

### Operador OR (||)

```json
{
  "type": "conditional",
  "id": "urgent-alert",
  "condition": "priority == 'high' || priority == 'urgent'",
  "elements": [
    {
      "type": "rectangle",
      "style": { "fillColor": "#ff0000" }
    },
    {
      "type": "text",
      "value": "⚠️ URGENT ATTENTION",
      "style": { "color": "#ffffff", "fontWeight": "bold" }
    }
  ]
}
```

### Operador IN

```json
{
  "type": "conditional",
  "id": "positive-status",
  "condition": "status in ['approved', 'confirmed', 'completed']",
  "elements": [
    {
      "type": "text",
      "value": "✅ Order completed successfully",
      "style": { "color": "#00aa00" }
    }
  ]
}
```

---

## Anidamiento

Puedes anidar `ConditionalElement` dentro de otros:

```json
{
  "type": "conditional",
  "id": "level-1",
  "condition": "user.active == true",
  "elements": [
    {
      "type": "text",
      "value": "Active user"
    },
    {
      "type": "conditional",
      "id": "level-2",
      "condition": "user.type == 'admin'",
      "elements": [
        {
          "type": "text",
          "value": "👑 ADMINISTRATOR",
          "style": { "fontWeight": "bold", "color": "#ff0000" }
        }
      ]
    }
  ]
}
```

::: warning Precaución
Evita anidamientos muy profundos, ya que pueden dificultar el mantenimiento de la plantilla.
:::

---

## Dentro de Bucles

`ConditionalElement` funciona perfectamente dentro de bucles:

```json
{
  "type": "loop",
  "id": "products-loop",
  "dataBinding": "products",
  "elements": [
    {
      "type": "conditional",
      "id": "stock-alert",
      "condition": "$item.stock < 10",
      "elements": [
        {
          "type": "text",
          "dataBinding": "$item.name | suffix:' - ⚠️ LOW STOCK'",
          "style": { "color": "#ff0000" }
        }
      ]
    }
  ]
}
```

---

## Rendimiento

**¿Por qué usar `ConditionalElement` en lugar de múltiples `printCondition`?**

### ❌ Menos eficiente:
```json
{
  "elements": [
    {
      "type": "rectangle",
      "printCondition": "customer.type == 'VIP'"
    },
    {
      "type": "text",
      "printCondition": "customer.type == 'VIP'"
    },
    {
      "type": "text",
      "printCondition": "customer.type == 'VIP'"
    }
  ]
}
```

**Problema:** La condición se evalúa 3 veces.

### ✅ Más eficiente:
```json
{
  "elements": [
    {
      "type": "conditional",
      "condition": "customer.type == 'VIP'",
      "elements": [
        { "type": "rectangle" },
        { "type": "text" },
        { "type": "text" }
      ]
    }
  ]
}
```

**Ventaja:** La condición se evalúa solo una vez.

---

## Manejo de Errores

Si la evaluación de la condición falla:
- ⚠️ El elemento y sus hijos **SE RENDERIZAN** por defecto
- 💡 Esto evita la pérdida de información en producción
- 🔍 Valida las plantillas antes de usarlas en producción

---

## Validación

El elemento valida automáticamente:
- ✅ `condition` no puede estar vacía
- ✅ `elements` debe tener al menos un elemento
- ✅ Los elementos hijos también se validan

---

## Próximos Pasos

- [Condiciones](/es/lib/guide/conditions) - Sintaxis completa de condiciones
- [Loop](/es/lib/guide/elements/loop) - Combínalos con bucles
- [printCondition](/es/lib/guide/elements/text#printcondition) - Condiciones en elementos individuales
- [Ejemplos](/es/lib/examples/) - Ve el Conditional en acción
