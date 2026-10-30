# Data Binding

El data binding permite vincular datos dinámicos a las plantillas.

## Sintaxis Básica

```json
{
  "type": "text",
  "id": "customer-name",
  "dataBinding": "customer.name"
}
```

**Datos:**
```json
{
  "customer": {
    "name": "John Smith"
  }
}
```

**Resultado:** `John Smith`

---

## Propiedades Anidadas

Accede a objetos anidados usando notación de punto:

```json
{
  "dataBinding": "order.customer.address.city"
}
```

**Datos:**
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

## Acceso a Arreglos

Accede a los elementos de un arreglo por índice:

```json
{
  "dataBinding": "items.0.name"
}
```

**Datos:**
```json
{
  "items": [
    { "name": "First Item" },
    { "name": "Second Item" }
  ]
}
```

**Resultado:** `First Item`

---

## Interpolación

Mezcla texto estático con datos dinámicos usando `{{}}`:

```json
{
  "type": "text",
  "value": "Customer: {{customer.name}} - Order #{{order.id}}"
}
```

**Resultado:** `Customer: John Smith - Order #12345`

---

## Transformaciones (Pipes)

Aplica transformaciones a los datos:

```json
{
  "dataBinding": "customer.name | upperCase"
}
```

**Resultado:** `JOHN SMITH`

### Múltiples Transformaciones

Encadena transformaciones:

```json
{
  "dataBinding": "price | round:2 | currency:'USD'"
}
```

Consulta [Transformaciones](/es/lib/guide/transformations) para ver todos los pipes disponibles.

---

## Variables Especiales

### Variables del Sistema

Estas variables están disponibles automáticamente en todos los contextos (elementos de página, encabezado, pie de página):

| Variable | Descripción | Formato |
|----------|-------------|--------|
| `_pageNumber` | Número de página actual | 1, 2, 3... |
| `_date` | Fecha actual | YYYY-MM-DD (ej.: 2026-01-16) |
| `_dateTime` | Fecha y hora actuales | YYYY-MM-DDTHH:mm:ss (ej.: 2026-01-16T14:30:45) |

### Variables de Bucle

| Variable | Descripción |
|----------|-------------|
| `$item` | Elemento actual del bucle |
| `$index` | Índice actual del bucle (base 0) |

### Ejemplo con Números de Página

```json
{
  "type": "text",
  "dataBinding": "_pageNumber"
}
```

O combinado con texto:

```json
{
  "type": "text",
  "value": "Page ${_pageNumber}"
}
```

### Ejemplo con Fechas

```json
{
  "type": "text",
  "value": "Generated on: ${_date}"
}
```

---

## En Bucles

Dentro de un bucle, usa `$item` para acceder al elemento actual:

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

## En Tablas

Las columnas de las tablas usan una sintaxis especial:

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

## Valores Predeterminados

Usa el pipe `default` para valores de respaldo:

```json
{
  "dataBinding": "notes | default:'No notes provided'"
}
```

---

## Próximos Pasos

- [Transformaciones](/es/lib/guide/transformations) - Formatear y transformar datos
- [Condiciones](/es/lib/guide/conditions) - Renderización condicional
- [Elementos](/es/lib/guide/elements/text) - Todos los elementos disponibles
