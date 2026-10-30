# Transformaciones (Pipes)

Las transformaciones permiten modificar los valores antes de mostrarlos en el PDF, usando la sintaxis de pipe `|`.

## Sintaxis Básica

```json
{
  "type": "text",
  "dataBinding": "value | transformation"
}
```

Puedes encadenar múltiples transformaciones:

```json
{
  "dataBinding": "name | trim | upperCase"
}
```

Con argumentos:

```json
{
  "dataBinding": "price | format:'#,##0.00'"
}
```

---

## Transformaciones de Texto

### upperCase / upper
Convierte el texto a MAYÚSCULAS.

**Ejemplo:**
```json
{
  "dataBinding": "customer.name | upperCase"
}
```

**Datos:**
```json
{ "customer": { "name": "John Smith" } }
```

**Resultado:** `JOHN SMITH`

---

### lowerCase / lower
Convierte el texto a minúsculas.

**Ejemplo:**
```json
{
  "dataBinding": "customer.email | lowerCase"
}
```

**Resultado:** `john.smith@email.com`

---

### capitalize / cap
Pone en mayúscula la primera letra de cada palabra.

**Ejemplo:**
```json
{
  "dataBinding": "product.name | capitalize"
}
```

**Datos:**
```json
{ "product": { "name": "dell inspiron notebook" } }
```

**Resultado:** `Dell Inspiron Notebook`

---

### trim
Elimina los espacios en blanco del inicio y del final.

**Ejemplo:**
```json
{
  "dataBinding": "message | trim"
}
```

**Datos:**
```json
{ "message": "  text with spaces  " }
```

**Resultado:** `text with spaces`

---

### truncate:N[:suffix]
Limita el texto a N caracteres, añadiendo un sufijo (predeterminado: `...`).

**Ejemplo:**
```json
{
  "dataBinding": "description | truncate:50"
}
```

**Datos:**
```json
{ "description": "This is a very long text that needs to be truncated to fit in the available space" }
```

**Resultado:** `This is a very long text that needs to be trunca...`

Con sufijo personalizado:
```json
{
  "dataBinding": "description | truncate:30:'…'"
}
```

---

### padLeft:N[:char] / lpad:N[:char]
Rellena por la izquierda hasta N caracteres (predeterminado: espacio).

**Ejemplo:**
```json
{
  "dataBinding": "code | padLeft:5:'0'"
}
```

**Datos:**
```json
{ "code": "123" }
```

**Resultado:** `00123`

---

### padRight:N[:char] / rpad:N[:char]
Rellena por la derecha hasta N caracteres.

**Ejemplo:**
```json
{
  "dataBinding": "name | padRight:20:'.'"
}
```

**Datos:**
```json
{ "name": "John" }
```

**Resultado:** `John................`

---

### replace:'old':'new'
Reemplaza todas las apariciones de un texto.

**Ejemplo:**
```json
{
  "dataBinding": "phone | replace:'-':''"
}
```

**Datos:**
```json
{ "phone": "11-9999-8888" }
```

**Resultado:** `1199998888`

---

### prefix:'text'
Añade un prefijo al valor.

**Ejemplo:**
```json
{
  "dataBinding": "value | prefix:'$ '"
}
```

**Datos:**
```json
{ "value": "100" }
```

**Resultado:** `$ 100`

---

### suffix:'text'
Añade un sufijo al valor.

**Ejemplo:**
```json
{
  "dataBinding": "quantity | suffix:' units'"
}
```

**Datos:**
```json
{ "quantity": "5" }
```

**Resultado:** `5 units`

---

### reverse
Invierte el texto.

**Ejemplo:**
```json
{
  "dataBinding": "code | reverse"
}
```

**Datos:**
```json
{ "code": "ABC123" }
```

**Resultado:** `321CBA`

---

## Transformaciones Numéricas

### format:'pattern'
Formatea números usando DecimalFormat.

**Patrones comunes:**
- `#,##0.00` → 1,234.56
- `#,##0` → 1,234
- `0.00` → 1234.56
- `#,##0.000` → 1,234.567

**Ejemplo:**
```json
{
  "dataBinding": "price | format:'#,##0.00'"
}
```

**Datos:**
```json
{ "price": 1234.5678 }
```

**Resultado:** `1,234.57`

---

### currency:'CODE'
Formatea como moneda usando el código ISO.

**Códigos soportados:**
- `USD` → $1,234.56
- `EUR` → €1,234.56
- `GBP` → £1,234.56
- `BRL` → R$ 1.234,56

**Ejemplo:**
```json
{
  "dataBinding": "total | currency:'USD'"
}
```

**Datos:**
```json
{ "total": 1234.56 }
```

**Resultado:** `$1,234.56`

---

### numberFormat:'locale' / numfmt:'locale'
Formatea un número usando un locale específico.

**Ejemplo:**
```json
{
  "dataBinding": "value | numberFormat:'en-US'"
}
```

---

### abs
Devuelve el valor absoluto.

**Ejemplo:**
```json
{
  "dataBinding": "balance | abs"
}
```

**Datos:**
```json
{ "balance": -150.00 }
```

**Resultado:** `150.00`

---

### round:decimals
Redondea a N decimales.

**Ejemplo:**
```json
{
  "dataBinding": "value | round:2"
}
```

**Datos:**
```json
{ "value": 123.456789 }
```

**Resultado:** `123.46`

---

### floor
Redondea hacia abajo.

**Ejemplo:**
```json
{
  "dataBinding": "price | floor"
}
```

**Datos:**
```json
{ "price": 99.99 }
```

**Resultado:** `99`

---

### ceil
Redondea hacia arriba.

**Ejemplo:**
```json
{
  "dataBinding": "price | ceil"
}
```

**Datos:**
```json
{ "price": 99.01 }
```

**Resultado:** `100`

---

## Transformaciones de Fechas

### date:'pattern'
Formatea fechas usando SimpleDateFormat.

**Patrones comunes:**
- `MM/dd/yyyy` → 12/25/2025
- `MM/dd/yyyy HH:mm` → 12/25/2025 14:30
- `yyyy-MM-dd` → 2025-12-25
- `EEEE, MMMM dd, yyyy` → Thursday, December 25, 2025

**Ejemplo:**
```json
{
  "dataBinding": "invoice.date | date:'MM/dd/yyyy'"
}
```

**Datos:**
```json
{ "invoice": { "date": "2025-12-25T14:30:00" } }
```

**Resultado:** `12/25/2025`

---

## Transformaciones de Arreglos

### join:'separator'
Une los elementos de un arreglo con un separador.

**Ejemplo:**
```json
{
  "dataBinding": "tags | join:', '"
}
```

**Datos:**
```json
{ "tags": ["kotlin", "pdf", "java"] }
```

**Resultado:** `kotlin, pdf, java`

---

### first
Devuelve el primer elemento del arreglo.

**Ejemplo:**
```json
{
  "dataBinding": "items | first"
}
```

---

### last
Devuelve el último elemento del arreglo.

**Ejemplo:**
```json
{
  "dataBinding": "items | last"
}
```

---

### length / len
Devuelve el tamaño de un arreglo o cadena.

**Ejemplo:**
```json
{
  "dataBinding": "items | length"
}
```

**Datos:**
```json
{ "items": ["A", "B", "C"] }
```

**Resultado:** `3`

---

## Transformaciones de Utilidad

### default:'value'
Devuelve un valor predeterminado si el original es nulo o está vacío.

**Ejemplo:**
```json
{
  "dataBinding": "notes | default:'No notes provided'"
}
```

**Datos:**
```json
{ "notes": null }
```

**Resultado:** `No notes provided`

---

### template:'pattern'
Aplica una plantilla con placeholders `${property}`.

**Ejemplo:**
```json
{
  "dataBinding": "address | template:'${street}, ${number} - ${city}, ${state}'"
}
```

**Datos:**
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

**Resultado:** `Main St, 1000 - New York, NY`

Con pipes anidados:
```json
{
  "dataBinding": "address | template:'${street | upperCase}, ${number}'"
}
```

---

### concat
Concatena múltiples valores.

**Ejemplo:**
```json
{
  "dataBinding": "customer.name | concat:' - ':customer.id"
}
```

---

## Encadenamiento de Transformaciones

Puedes aplicar múltiples transformaciones en secuencia:

**Ejemplo 1: Limpiar y formatear**
```json
{
  "dataBinding": "name | trim | capitalize"
}
```

**Datos:**
```json
{ "name": "  jOHN sMITH  " }
```

**Resultado:** `John Smith`

---

**Ejemplo 2: Formatear moneda**
```json
{
  "dataBinding": "price | round:2 | currency:'USD'"
}
```

**Datos:**
```json
{ "price": 1234.5678 }
```

**Resultado:** `$1,234.57`

---

**Ejemplo 3: Truncar y añadir puntos suspensivos**
```json
{
  "dataBinding": "description | trim | truncate:100"
}
```

---

**Ejemplo 4: Formatear código con ceros a la izquierda**
```json
{
  "dataBinding": "order | padLeft:8:'0' | prefix:'#'"
}
```

**Datos:**
```json
{ "order": "1234" }
```

**Resultado:** `#00001234`

---

## Casos de Uso Prácticos

### Factura

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

### Reporte con Descripciones

```json
{
  "type": "text",
  "dataBinding": "product.description | truncate:200 | capitalize"
}
```

### Formato de Teléfonos

```json
{
  "type": "text",
  "dataBinding": "contact | template:'(${areaCode}) ${number}'"
}
```

**Datos:**
```json
{
  "contact": {
    "areaCode": "212",
    "number": "555-1234"
  }
}
```

**Resultado:** `(212) 555-1234`

---

## Rendimiento

::: tip Consejo de Rendimiento
- Las transformaciones se cachean por expresión
- Evita pipes complejos dentro de bucles grandes
- Prefiere preprocesar los datos cuando sea posible
:::

---

## Próximos Pasos

- [Condiciones](/es/lib/guide/conditions) - Renderización condicional
- [Elementos](/es/lib/guide/elements/text) - Tipos de elementos disponibles
- [Ejemplos](/es/lib/examples/) - Ver las transformaciones en acción
