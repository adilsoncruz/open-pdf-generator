# Elemento Text

El `TextElement` renderiza texto estático o dinámico con soporte para enlace de datos (data binding), transformaciones y estilos avanzados.

## Características

- ✅ **Enlace de datos (data binding)**: vincula datos dinámicos
- ✅ **Transformaciones**: aplica pipes para formatear
- ✅ **Estilos avanzados**: fuente, color, alineación, padding
- ✅ **Multilínea**: texto con varias líneas
- ✅ **Sangría**: sangría en la primera línea
- ✅ **Interlineado**: control del espaciado entre líneas

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"text"` |
| `id` | string | ✅ | Identificador único |
| `x` | number | ✅ | Posición X |
| `y` | number | ✅ | Posición Y |
| `width` | number | ❌ | Ancho del contenedor |
| `height` | number | ❌ | Alto del contenedor |
| `value` | string | ❌ | Texto estático |
| `dataBinding` | string | ❌ | Ruta a los datos dinámicos |
| `style` | object | ❌ | Estilos del texto |
| `printCondition` | string | ❌ | Condición para renderizar |
| `positionMode` | string | ❌ | `ABSOLUTE` (predeterminado) o `RELATIVE` |
| `relativeOffsetY` | number | ❌ | Desplazamiento Y cuando es `RELATIVE` |

::: tip Consejo
Usa `value` para texto fijo o `dataBinding` para texto dinámico. Puedes usar ambos con interpolación `{{}}`.
:::

---

## Ejemplo Básico

### Texto Estático

```json
{
  "type": "text",
  "id": "title",
  "x": 50,
  "y": 100,
  "value": "Electronic Invoice",
  "style": {
    "fontSize": 18,
    "fontWeight": "bold",
    "color": "#1e40af"
  }
}
```

### Texto Dinámico

```json
{
  "type": "text",
  "id": "customer-name",
  "x": 50,
  "y": 150,
  "dataBinding": "customer.name",
  "style": {
    "fontSize": 14
  }
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

## Enlace de Datos con Interpolación

Mezcla texto estático con datos dinámicos:

```json
{
  "type": "text",
  "value": "Customer: {{customer.name}}",
  "style": {
    "fontSize": 12
  }
}
```

**Resultado:** `Customer: John Smith`

---

## Transformaciones (Pipes)

Aplica transformaciones a los datos:

```json
{
  "type": "text",
  "dataBinding": "customer.name | upperCase"
}
```

**Resultado:** `JOHN SMITH`

### Múltiples Transformaciones

```json
{
  "dataBinding": "description | trim | truncate:50 | capitalize"
}
```

Consulta [Transformaciones](/es/lib/guide/transformations) para ver la lista completa.

---

## Estilos

### Propiedades de Estilo

```json
{
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "fontWeight": "normal",
    "fontStyle": "normal",
    "color": "#000000",
    "backgroundColor": "#f3f4f6",
    "alignment": "left",
    "verticalAlignment": "center",
    "lineHeight": 1.5,
    "multiline": true,
    "firstLineIndent": 20,
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 10,
    "paddingRight": 10
  }
}
```

### Fuente

| Propiedad | Valores | Descripción |
|----------|--------|-------------|
| `fontSize` | number | Tamaño en puntos (predeterminado: `12`) |
| `fontFamily` | string | `Helvetica`, `Times`, `Courier` |
| `fontWeight` | string | `normal`, `bold` |
| `fontStyle` | string | `normal`, `italic` |

**Familias de fuentes:**
- `Helvetica` → Sans-serif, moderna (predeterminada)
- `Times` → Serif, formal
- `Courier` → Monoespaciada, código

---

### Colores

| Propiedad | Tipo | Descripción |
|----------|------|-------------|
| `color` | hex | Color del texto (predeterminado: `#000000`) |
| `backgroundColor` | hex | Color de fondo (opcional) |

```json
{
  "style": {
    "color": "#1e40af",
    "backgroundColor": "#dbeafe"
  }
}
```

---

### Alineación

#### Horizontal

| Valor | Descripción |
|-------|-------------|
| `left` | Alineado a la izquierda (predeterminado) |
| `center` | Centrado |
| `right` | Alineado a la derecha |
| `justify` | Justificado |

```json
{
  "style": {
    "alignment": "center"
  }
}
```

#### Vertical

| Valor | Descripción |
|-------|-------------|
| `top` | Parte superior del contenedor |
| `center` | Centro (predeterminado) |
| `bottom` | Parte inferior del contenedor |

```json
{
  "style": {
    "verticalAlignment": "top"
  }
}
```

---

### Texto Multilínea

Para texto con varias líneas:

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "width": 400,
  "height": 100,
  "value": "This is a long text that will be automatically wrapped into multiple lines within the specified container.",
  "style": {
    "multiline": true,
    "fontSize": 10,
    "lineHeight": 1.5,
    "alignment": "justify"
  }
}
```

**Comportamiento:**
- El texto se ajusta automáticamente al `width`
- `lineHeight` controla el espaciado entre líneas
- `height` define el alto máximo del contenedor

---

### Overflow (Control de Altura)

::: tip Novedad en v1.1
Controla cómo se comporta el texto multilínea cuando excede la altura definida.
:::

| Valor | Comportamiento |
|-------|----------|
| `visible` | El texto puede exceder la altura (predeterminado) |
| `hidden` | El texto se recorta en la altura definida |
| `auto` | La altura se ajusta al contenido real |

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "width": 400,
  "height": 50,
  "dataBinding": "description",
  "style": {
    "multiline": true,
    "overflow": "auto"
  }
}
```

::: warning Importante
Usa `overflow: auto` cuando tengas un elemento con `positionMode: RELATIVE` justo debajo. Así el siguiente elemento se posicionará después del contenido real del texto.
:::

---

### Interlineado

```json
{
  "style": {
    "fontSize": 12,
    "lineHeight": 1.5
  }
}
```

- `lineHeight` es un multiplicador de `fontSize`
- `1.0` = sin espacio extra
- `1.5` = 50% de espacio extra (recomendado)
- `2.0` = doble interlineado

---

### Sangría de la Primera Línea

```json
{
  "style": {
    "firstLineIndent": 20,
    "multiline": true
  }
}
```

**Resultado:**
```
    This is the first paragraph with
indentation on the first line. The following
lines have no indentation.
```

---

### Padding

```json
{
  "style": {
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 10,
    "paddingRight": 10,
    "backgroundColor": "#f3f4f6"
  }
}
```

Útil cuando se combina con `backgroundColor` para crear "cajas" de texto.

---

## Ejemplos Prácticos

### Título de Sección

```json
{
  "type": "text",
  "x": 50,
  "y": 100,
  "value": "CUSTOMER DETAILS",
  "style": {
    "fontSize": 14,
    "fontWeight": "bold",
    "color": "#1e40af",
    "letterSpacing": 1
  }
}
```

### Etiqueta + Valor

```json
{
  "type": "text",
  "x": 50,
  "y": 150,
  "value": "Name: {{customer.name | upperCase}}",
  "style": {
    "fontSize": 10
  }
}
```

### Texto con Fondo

```json
{
  "type": "text",
  "x": 50,
  "y": 200,
  "value": "PAID",
  "style": {
    "fontSize": 12,
    "fontWeight": "bold",
    "color": "#ffffff",
    "backgroundColor": "#10b981",
    "paddingTop": 5,
    "paddingBottom": 5,
    "paddingLeft": 15,
    "paddingRight": 15
  }
}
```

### Párrafo Justificado

```json
{
  "type": "text",
  "x": 50,
  "y": 300,
  "width": 500,
  "height": 150,
  "dataBinding": "contract.text",
  "style": {
    "fontSize": 9,
    "multiline": true,
    "alignment": "justify",
    "lineHeight": 1.4,
    "firstLineIndent": 20
  }
}
```

### Valor Monetario

```json
{
  "type": "text",
  "x": 400,
  "y": 500,
  "dataBinding": "total | currency:'USD'",
  "style": {
    "fontSize": 16,
    "fontWeight": "bold",
    "color": "#059669",
    "alignment": "right"
  }
}
```

### Fecha Formateada

```json
{
  "type": "text",
  "x": 50,
  "y": 550,
  "dataBinding": "issueDate | date:'MM/dd/yyyy HH:mm'",
  "style": {
    "fontSize": 9,
    "color": "#6b7280"
  }
}
```

---

## Condiciones

Renderiza solo bajo condiciones:

```json
{
  "type": "text",
  "value": "⚠️ DISCOUNT APPLIED",
  "style": {
    "color": "#dc2626",
    "fontWeight": "bold"
  },
  "printCondition": "discount > 0"
}
```

Consulta [Condiciones](/es/lib/guide/conditions) para más detalles.

---

## Dentro de Bucles

```json
{
  "type": "loop",
  "dataBinding": "items",
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name | capitalize",
      "style": {
        "fontSize": 10
      }
    }
  ]
}
```

Consulta [Elemento Loop](/es/lib/guide/elements/loop) para más detalles.

---

## Posicionamiento Relativo

::: tip Novedad en v1.1
¡Posiciona elementos dinámicamente según el contenido anterior!
:::

### Modo de Posición

| Modo | Comportamiento |
|------|----------|
| `ABSOLUTE` | Posición fija en el lienzo (predeterminado) |
| `RELATIVE` | Posición basada en el elemento anterior |

### Ejemplo: Texto Después de un Bucle

Cuando tienes un bucle con una cantidad variable de ítems y quieres posicionar texto después de él:

```json
[
  {
    "type": "loop",
    "id": "items",
    "dataBinding": "items",
    "x": 50,
    "y": 100,
    "height": 30,
    "itemSpacing": 5,
    "elements": [...]
  },
  {
    "type": "text",
    "id": "total",
    "x": 50,
    "y": 0,
    "positionMode": "RELATIVE",
    "relativeOffsetY": 20,
    "value": "Total: {{total}}",
    "style": { "fontWeight": "bold" }
  }
]
```

**Comportamiento:**
- El texto "Total" se posicionará 20pt por debajo del último ítem del bucle
- No importa cuántos ítems tenga el bucle
- `y` en el lienzo se ignora cuando `positionMode: RELATIVE`
- `relativeOffsetY` define el espacio entre elementos

---

## Limitaciones

- ❌ No soporta texto rotado
- ❌ No soporta sombra en el texto
- ❌ No soporta degradados de color

---

## Rendimiento

::: tip Optimización
- Los textos cortos son más rápidos
- `multiline: false` es más eficiente
- Evita `backgroundColor` innecesarios
- El cache de fuentes es automático
:::

---

## Próximos Pasos

- [Transformaciones](/es/lib/guide/transformations) - Formatea datos
- [Condiciones](/es/lib/guide/conditions) - Renderizado condicional
- [Elemento Image](/es/lib/guide/elements/image) - Agrega imágenes
- [Ejemplos](/es/lib/examples/) - Ve el Text en acción
