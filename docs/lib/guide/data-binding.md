# Data Binding

Data binding allows you to link dynamic data to templates.

## Basic Syntax

```json
{
  "type": "text",
  "id": "customer-name",
  "dataBinding": "customer.name"
}
```

**Data:**
```json
{
  "customer": {
    "name": "John Smith"
  }
}
```

**Result:** `John Smith`

---

## Nested Properties

Access nested objects using dot notation:

```json
{
  "dataBinding": "order.customer.address.city"
}
```

**Data:**
```json
{
  "order": {
    "customer": {
      "address": {
        "city": "New York"
      }
    }
  }
}
```

---

## Array Access

Access array items by index:

```json
{
  "dataBinding": "items.0.name"
}
```

**Data:**
```json
{
  "items": [
    { "name": "First Item" },
    { "name": "Second Item" }
  ]
}
```

**Result:** `First Item`

---

## Interpolation

Mix static text with dynamic data using `{{}}`:

```json
{
  "type": "text",
  "value": "Customer: {{customer.name}} - Order #{{order.id}}"
}
```

**Result:** `Customer: John Smith - Order #12345`

---

## Transformations (Pipes)

Apply transformations to data:

```json
{
  "dataBinding": "customer.name | upperCase"
}
```

**Result:** `JOHN SMITH`

### Multiple Transformations

Chain transformations:

```json
{
  "dataBinding": "price | round:2 | currency:'USD'"
}
```

See [Transformations](/guide/transformations) for all available pipes.

---

## Special Variables

| Variable | Description |
|----------|-------------|
| `$currentPage` | Current page number |
| `$totalPages` | Total number of pages |
| `$item` | Current item in loop |
| `$index` | Current index in loop (0-based) |
| `$itemNumber` | Current item number in loop (1-based) |

### Page Numbers Example

```json
{
  "type": "text",
  "value": "Page {{$currentPage}} of {{$totalPages}}"
}
```

---

## In Loops

Inside a loop, use `$item` to access the current item:

```json
{
  "type": "loop",
  "dataBinding": "products",
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name"
    },
    {
      "type": "text",
      "dataBinding": "$item.price | currency:'USD'"
    }
  ]
}
```

---

## In Tables

Table columns use special syntax:

```json
{
  "type": "table",
  "dataBinding": "items",
  "columns": [
    {
      "header": "Product",
      "field": "$item.name"
    },
    {
      "header": "Price",
      "field": "$item.price | currency:'USD'"
    }
  ]
}
```

---

## Default Values

Use the `default` pipe for fallback values:

```json
{
  "dataBinding": "notes | default:'No notes provided'"
}
```

---

## Next Steps

- [Transformations](/guide/transformations) - Format and transform data
- [Conditions](/guide/conditions) - Conditional rendering
- [Elements](/guide/elements/text) - All available elements

