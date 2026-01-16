# Transformations (Pipes)

Transformations allow you to modify values before displaying them in the PDF, using the pipe syntax `|`.

## Basic Syntax

```json
{
  "type": "text",
  "dataBinding": "value | transformation"
}
```

You can chain multiple transformations:

```json
{
  "dataBinding": "name | trim | upperCase"
}
```

With arguments:

```json
{
  "dataBinding": "price | format:'#,##0.00'"
}
```

---

## Text Transformations

### upperCase / upper
Converts text to UPPERCASE.

**Example:**
```json
{
  "dataBinding": "customer.name | upperCase"
}
```

**Data:**
```json
{ "customer": { "name": "John Smith" } }
```

**Result:** `JOHN SMITH`

---

### lowerCase / lower
Converts text to lowercase.

**Example:**
```json
{
  "dataBinding": "customer.email | lowerCase"
}
```

**Result:** `john.smith@email.com`

---

### capitalize / cap
Capitalizes the first letter of each word.

**Example:**
```json
{
  "dataBinding": "product.name | capitalize"
}
```

**Data:**
```json
{ "product": { "name": "dell inspiron notebook" } }
```

**Result:** `Dell Inspiron Notebook`

---

### trim
Removes whitespace from the beginning and end.

**Example:**
```json
{
  "dataBinding": "message | trim"
}
```

**Data:**
```json
{ "message": "  text with spaces  " }
```

**Result:** `text with spaces`

---

### truncate:N[:suffix]
Limits text to N characters, adding suffix (default: `...`).

**Example:**
```json
{
  "dataBinding": "description | truncate:50"
}
```

**Data:**
```json
{ "description": "This is a very long text that needs to be truncated to fit in the available space" }
```

**Result:** `This is a very long text that needs to be trunca...`

With custom suffix:
```json
{
  "dataBinding": "description | truncate:30:'…'"
}
```

---

### padLeft:N[:char] / lpad:N[:char]
Pads left to N characters (default: space).

**Example:**
```json
{
  "dataBinding": "code | padLeft:5:'0'"
}
```

**Data:**
```json
{ "code": "123" }
```

**Result:** `00123`

---

### padRight:N[:char] / rpad:N[:char]
Pads right to N characters.

**Example:**
```json
{
  "dataBinding": "name | padRight:20:'.'"
}
```

**Data:**
```json
{ "name": "John" }
```

**Result:** `John................`

---

### replace:'old':'new'
Replaces all occurrences of a text.

**Example:**
```json
{
  "dataBinding": "phone | replace:'-':''"
}
```

**Data:**
```json
{ "phone": "11-9999-8888" }
```

**Result:** `1199998888`

---

### prefix:'text'
Adds prefix to the value.

**Example:**
```json
{
  "dataBinding": "value | prefix:'$ '"
}
```

**Data:**
```json
{ "value": "100" }
```

**Result:** `$ 100`

---

### suffix:'text'
Adds suffix to the value.

**Example:**
```json
{
  "dataBinding": "quantity | suffix:' units'"
}
```

**Data:**
```json
{ "quantity": "5" }
```

**Result:** `5 units`

---

### reverse
Reverses the text.

**Example:**
```json
{
  "dataBinding": "code | reverse"
}
```

**Data:**
```json
{ "code": "ABC123" }
```

**Result:** `321CBA`

---

## Numeric Transformations

### format:'pattern'
Formats numbers using DecimalFormat.

**Common patterns:**
- `#,##0.00` → 1,234.56
- `#,##0` → 1,234
- `0.00` → 1234.56
- `#,##0.000` → 1,234.567

**Example:**
```json
{
  "dataBinding": "price | format:'#,##0.00'"
}
```

**Data:**
```json
{ "price": 1234.5678 }
```

**Result:** `1,234.57`

---

### currency:'CODE'
Formats as currency using ISO code.

**Supported codes:**
- `USD` → $1,234.56
- `EUR` → €1,234.56
- `GBP` → £1,234.56
- `BRL` → R$ 1.234,56

**Example:**
```json
{
  "dataBinding": "total | currency:'USD'"
}
```

**Data:**
```json
{ "total": 1234.56 }
```

**Result:** `$1,234.56`

---

### numberFormat:'locale' / numfmt:'locale'
Formats number using specific locale.

**Example:**
```json
{
  "dataBinding": "value | numberFormat:'en-US'"
}
```

---

### abs
Returns absolute value.

**Example:**
```json
{
  "dataBinding": "balance | abs"
}
```

**Data:**
```json
{ "balance": -150.00 }
```

**Result:** `150.00`

---

### round:decimals
Rounds to N decimal places.

**Example:**
```json
{
  "dataBinding": "value | round:2"
}
```

**Data:**
```json
{ "value": 123.456789 }
```

**Result:** `123.46`

---

### floor
Rounds down.

**Example:**
```json
{
  "dataBinding": "price | floor"
}
```

**Data:**
```json
{ "price": 99.99 }
```

**Result:** `99`

---

### ceil
Rounds up.

**Example:**
```json
{
  "dataBinding": "price | ceil"
}
```

**Data:**
```json
{ "price": 99.01 }
```

**Result:** `100`

---

## Date Transformations

### date:'pattern'
Formats date using SimpleDateFormat.

**Common patterns:**
- `MM/dd/yyyy` → 12/25/2025
- `MM/dd/yyyy HH:mm` → 12/25/2025 14:30
- `yyyy-MM-dd` → 2025-12-25
- `EEEE, MMMM dd, yyyy` → Thursday, December 25, 2025

**Example:**
```json
{
  "dataBinding": "invoice.date | date:'MM/dd/yyyy'"
}
```

**Data:**
```json
{ "invoice": { "date": "2025-12-25T14:30:00" } }
```

**Result:** `12/25/2025`

---

## Array Transformations

### join:'separator'
Joins array elements with separator.

**Example:**
```json
{
  "dataBinding": "tags | join:', '"
}
```

**Data:**
```json
{ "tags": ["kotlin", "pdf", "java"] }
```

**Result:** `kotlin, pdf, java`

---

### first
Returns first element of array.

**Example:**
```json
{
  "dataBinding": "items | first"
}
```

---

### last
Returns last element of array.

**Example:**
```json
{
  "dataBinding": "items | last"
}
```

---

### length / len
Returns size of array or string.

**Example:**
```json
{
  "dataBinding": "items | length"
}
```

**Data:**
```json
{ "items": ["A", "B", "C"] }
```

**Result:** `3`

---

## Utility Transformations

### default:'value'
Returns default value if original is null or empty.

**Example:**
```json
{
  "dataBinding": "notes | default:'No notes provided'"
}
```

**Data:**
```json
{ "notes": null }
```

**Result:** `No notes provided`

---

### template:'pattern'
Applies template with `${property}` placeholders.

**Example:**
```json
{
  "dataBinding": "address | template:'${street}, ${number} - ${city}, ${state}'"
}
```

**Data:**
```json
{
  "address": {
    "street": "Main St",
    "number": "1000",
    "city": "New York",
    "state": "NY"
  }
}
```

**Result:** `Main St, 1000 - New York, NY`

With nested pipes:
```json
{
  "dataBinding": "address | template:'${street | upperCase}, ${number}'"
}
```

---

### concat
Concatenates multiple values.

**Example:**
```json
{
  "dataBinding": "customer.name | concat:' - ':customer.id"
}
```

---

## Chaining Transformations

You can apply multiple transformations in sequence:

**Example 1: Clean and format**
```json
{
  "dataBinding": "name | trim | capitalize"
}
```

**Data:**
```json
{ "name": "  jOHN sMITH  " }
```

**Result:** `John Smith`

---

**Example 2: Format currency**
```json
{
  "dataBinding": "price | round:2 | currency:'USD'"
}
```

**Data:**
```json
{ "price": 1234.5678 }
```

**Result:** `$1,234.57`

---

**Example 3: Truncate and add ellipsis**
```json
{
  "dataBinding": "description | trim | truncate:100"
}
```

---

**Example 4: Format code with leading zeros**
```json
{
  "dataBinding": "order | padLeft:8:'0' | prefix:'#'"
}
```

**Data:**
```json
{ "order": "1234" }
```

**Result:** `#00001234`

---

## Practical Use Cases

### Invoice

```json
{
  "elements": [
    {
      "type": "text",
      "dataBinding": "invoice.number | padLeft:10:'0'",
      "value": "Invoice # {{invoice.number | padLeft:10:'0'}}"
    },
    {
      "type": "text",
      "dataBinding": "invoice.date | date:'MM/dd/yyyy HH:mm'"
    },
    {
      "type": "text",
      "dataBinding": "invoice.total | currency:'USD'"
    }
  ]
}
```

### Report with Descriptions

```json
{
  "type": "text",
  "dataBinding": "product.description | truncate:200 | capitalize"
}
```

### Phone Formatting

```json
{
  "type": "text",
  "dataBinding": "contact | template:'(${areaCode}) ${number}'"
}
```

**Data:**
```json
{
  "contact": {
    "areaCode": "212",
    "number": "555-1234"
  }
}
```

**Result:** `(212) 555-1234`

---

## Performance

::: tip Performance Tip
- Transformations are cached by expression
- Avoid complex pipes inside large loops
- Prefer pre-processing data when possible
:::

---

## Next Steps

- [Conditions](/lib/guide/conditions) - Conditional rendering
- [Elements](/lib/guide/elements/text) - Available element types
- [Examples](/lib/examples/) - See transformations in action

