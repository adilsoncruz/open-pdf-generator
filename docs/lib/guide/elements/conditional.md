# Conditional Element

The `ConditionalElement` allows grouping multiple elements under a single condition, rendering them only when the condition is satisfied.

## When to Use

Use `ConditionalElement` when:
- ✅ Multiple elements share the same condition
- ✅ You want to logically group related elements
- ✅ Need better performance (one condition vs many)

Use `printCondition` when:
- ✅ Only one element needs a condition
- ✅ Conditions are different for each element

---

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | Must be `"conditional"` |
| `id` | string | ✅ | Unique identifier |
| `condition` | string | ✅ | Boolean expression |
| `elements` | array | ✅ | List of child elements |
| `x` | number | ❌ | X position (default: 0) |
| `y` | number | ❌ | Y position (default: 0) |

---

## Basic Example

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

**Data:**
```json
{
  "discount": 150.00
}
```

**Result:** Both texts are rendered because `discount > 0`.

---

## Example: VIP Customer

Render special section only for VIP customers:

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

**Data:**
```json
{
  "customer": {
    "name": "John Smith",
    "type": "VIP"
  }
}
```

---

## Example: Tax Table

Show tax section only if there are taxes:

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

**Data with taxes:**
```json
{
  "taxes": [
    { "type": "VAT", "base": 1000.00, "rate": 18, "amount": 180.00 },
    { "type": "PIS", "base": 1000.00, "rate": 1.65, "amount": 16.50 },
    { "type": "COFINS", "base": 1000.00, "rate": 7.6, "amount": 76.00 }
  ]
}
```

**Result:** Entire tax section (title, line, and table) is rendered.

**Data without taxes:**
```json
{
  "taxes": []
}
```

**Result:** Nothing is rendered (entire section is omitted).

---

## Complex Conditions

### AND Operator (&&)

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

### OR Operator (||)

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

### IN Operator

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

## Nesting

You can nest `ConditionalElement` inside others:

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

::: warning Caution
Avoid very deep nesting, as it can make template maintenance difficult.
:::

---

## Inside Loops

`ConditionalElement` works perfectly inside loops:

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

## Performance

**Why use `ConditionalElement` instead of multiple `printCondition`?**

### ❌ Less efficient:
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

**Problem:** Condition evaluated 3 times.

### ✅ More efficient:
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

**Advantage:** Condition evaluated only once.

---

## Error Handling

If condition evaluation fails:
- ⚠️ The element and its children **ARE RENDERED** by default
- 💡 This prevents information loss in production
- 🔍 Validate templates before using in production

---

## Validation

The element automatically validates:
- ✅ `condition` cannot be empty
- ✅ `elements` must have at least one element
- ✅ Child elements are also validated

---

## Next Steps

- [Conditions](/lib/guide/conditions) - Complete condition syntax
- [Loop](/lib/guide/elements/loop) - Combine with loops
- [printCondition](/lib/guide/elements/text#printcondition) - Conditions on individual elements
- [Examples](/lib/examples/) - See in action

