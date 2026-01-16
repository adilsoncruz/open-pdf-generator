# Conditions

The library supports conditional rendering of elements through two approaches:
- **`printCondition`**: Property on any element
- **`ConditionalElement`**: Dedicated element to group conditions

---

## printCondition

The `printCondition` property can be added to any element to control its rendering.

### Basic Syntax

```json
{
  "type": "text",
  "id": "my-text",
  "value": "This text is conditional",
  "printCondition": "total > 1000"
}
```

If the condition is `true`, the element is rendered. Otherwise, it's ignored.

---

## Supported Operators

### Comparison

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equal | `status == 'approved'` |
| `!=` | Not equal | `type != 'cancelled'` |
| `>` | Greater than | `total > 1000` |
| `<` | Less than | `quantity < 10` |
| `>=` | Greater or equal | `age >= 18` |
| `<=` | Less or equal | `stock <= 5` |

### Inclusion

| Operator | Description | Example |
|----------|-------------|---------|
| `in` | Contained in list | `status in ['active', 'pending', 'approved']` |

### Logical

| Operator | Description | Example |
|----------|-------------|---------|
| `&&` | Logical AND | `total > 1000 && status == 'approved'` |
| `\|\|` | Logical OR | `type == 'A' \|\| type == 'B'` |

---

## Examples by Type

### Numeric Comparison

Show alert only if stock is low:

```json
{
  "type": "text",
  "id": "stock-alert",
  "value": "⚠️ Low stock!",
  "style": { "color": "#ff0000" },
  "printCondition": "product.stock < 10"
}
```

**Data:**
```json
{
  "product": {
    "name": "Notebook",
    "stock": 5
  }
}
```

**Result:** Text is displayed (5 < 10)

---

### String Comparison

Show badge only for VIP customers:

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

**Data:**
```json
{
  "customer": {
    "name": "John Smith",
    "type": "VIP"
  }
}
```

**Result:** Rectangle is displayed

---

### Boolean Check

Show logo only if configuration allows:

```json
{
  "type": "image",
  "id": "logo",
  "source": "https://example.com/logo.png",
  "printCondition": "config.showLogo"
}
```

**Data:**
```json
{
  "config": {
    "showLogo": true
  }
}
```

Or explicit comparison:

```json
{
  "printCondition": "document.confidential == true"
}
```

---

### Array/List Check

Show table only if there are items:

```json
{
  "type": "table",
  "id": "products-table",
  "printCondition": "order.items.length > 0"
}
```

**Data:**
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

**Result:** Table is displayed (2 > 0)

::: tip Tip
Use `length` or `size` to get the size of arrays/lists.
:::

---

### IN Operator

Show status only for specific states:

```json
{
  "type": "text",
  "id": "pending-status",
  "value": "⏳ Awaiting approval",
  "printCondition": "payment.status in ['pending', 'processing', 'under_review']"
}
```

**Data:**
```json
{
  "payment": {
    "status": "pending"
  }
}
```

**Result:** Text is displayed

---

### Logical Operators

#### Logical AND (&&)

Show discount only if VIP AND total > 1000:

```json
{
  "type": "text",
  "id": "vip-discount",
  "value": "🎁 Special 10% discount",
  "printCondition": "customer.type == 'VIP' && order.total > 1000"
}
```

#### Logical OR (||)

Show alert for types A or B:

```json
{
  "type": "text",
  "id": "type-alert",
  "value": "⚠️ Special attention required",
  "printCondition": "product.type == 'A' || product.type == 'B'"
}
```

---

### Nested Properties

Access deep properties:

```json
{
  "type": "text",
  "value": "Free shipping!",
  "printCondition": "order.address.state == 'CA'"
}
```

**Data:**
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

### Array Index Access

```json
{
  "type": "text",
  "value": "First item is special",
  "printCondition": "items.0.type == 'special'"
}
```

**Data:**
```json
{
  "items": [
    { "type": "special", "name": "Item A" },
    { "type": "normal", "name": "Item B" }
  ]
}
```

---

### System Variables in Conditions

You can use system variables like `_pageNumber` in conditions:

#### Show element only on first page:

```json
{
  "type": "text",
  "value": "Welcome message (first page only)",
  "printCondition": "_pageNumber == 1"
}
```

#### Show element starting from page 2:

```json
{
  "type": "text",
  "value": "Continued from previous page...",
  "printCondition": "_pageNumber > 1"
}
```

#### Header/Footer with page conditions:

```json
{
  "header": {
    "height": 60,
    "printCondition": "_pageNumber > 1",
    "elements": [...]
  }
}
```

**Available System Variables:**

| Variable | Description |
|----------|-------------|
| `_pageNumber` | Current page number (1, 2, 3...) |
| `_date` | Current date (YYYY-MM-DD) |
| `_dateTime` | Current date and time |

---

## Conditional Element

Use `ConditionalElement` to group multiple elements under a condition:

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

**Advantages:**
- ✅ Groups related elements
- ✅ Single condition controls multiple elements
- ✅ More efficient than multiple `printCondition`

---

## Practical Use Cases

### Invoice

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

### Report with Alerts

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

### Complete Conditional Section

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

## Conditions vs Transformations

Don't confuse conditions with transformations!

**❌ Wrong:**
```json
{
  "dataBinding": "name | if:status=='active'"
}
```

**✅ Correct:**
```json
{
  "dataBinding": "name",
  "printCondition": "status == 'active'"
}
```

::: tip Tip
- **Transformations** (`|`) modify values
- **Conditions** (`printCondition`) control rendering
:::

---

## Error Behavior

If condition evaluation fails (field doesn't exist, syntax error, etc.), the element **IS RENDERED** by default to prevent information loss.

For stricter behavior, validate your templates before using in production.

---

## Performance

::: tip Optimization
- Conditions are evaluated only once per element
- Use `ConditionalElement` to group elements (more efficient)
- Avoid complex conditions with many `&&` or `||`
- Prefer simple and direct conditions
:::

---

## Next Steps

- [Transformations](/guide/transformations) - Modify values
- [Conditional Elements](/guide/elements/conditional) - ConditionalElement details
- [Loops](/guide/elements/loop) - Combine loops with conditions
- [Examples](/examples/) - See conditions in action

