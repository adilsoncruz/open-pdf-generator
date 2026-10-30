# Elemento Link

El `LinkElement` (`"type": "link"`) renderiza un hipervínculo clicable en el documento PDF. Se comporta como un elemento de texto con una anotación de URL asociada que el lector puede clicar para abrirla en un navegador web externo.

## Características

- ✅ **Hipervínculos clicables**: incrusta anotaciones de enlace nativas del PDF que apuntan a una `url` de destino.
- ✅ **Texto dinámico o estático**: la etiqueta mostrada puede ser estática (`value`) o interpolada mediante `dataBinding`.
- ✅ **Estilo de texto**: soporte completo de estilos de fuente (`fontSize`, `color`, `fontFamily`, `fontWeight`, subrayado/estilo).
- ✅ **Renderizado condicional**: controlado con `printCondition`.

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"link"` |
| `id` | string | ✅ | Identificador único del elemento |
| `x` | number | ✅ | Posición horizontal en puntos |
| `y` | number | ✅ | Posición vertical en puntos |
| `url` | string | ✅ | La URL de destino (ej.: `https://example.com`) |
| `value` | string | ⚠️ | Etiqueta de texto estática (requerida si `dataBinding` no está definido) |
| `dataBinding` | string | ⚠️ | Ruta dinámica hacia los datos de la etiqueta (requerida si `value` no está definido) |
| `width` | number | ❌ | Ancho de la caja contenedora en puntos |
| `height` | number | ❌ | Alto de la caja contenedora en puntos |
| `style` | object | ❌ | Opciones de estilo de fuente y texto |
| `printCondition` | string | ❌ | Expresión de condición para renderizar el enlace |
| `positionMode` | string | ❌ | `"absolute"` o `"relative"` |
| `relativeOffsetY` | number | ❌ | Desplazamiento relativo al elemento anterior del flujo |

---

## Ejemplo: Enlace a un Sitio Externo

```json
{
  "type": "link",
  "id": "company-portal",
  "x": 50,
  "y": 700,
  "width": 200,
  "height": 20,
  "value": "Visit our Customer Portal",
  "url": "https://portal.example.com",
  "style": {
    "fontSize": 12,
    "fontFamily": "Helvetica",
    "color": "#2563EB",
    "fontWeight": "bold"
  }
}
```

## Ejemplo: Enlace Dinámico con Enlace de Datos

```json
{
  "type": "link",
  "id": "invoice-url",
  "x": 50,
  "y": 720,
  "dataBinding": "customer.website",
  "url": "https://company.org/invoices",
  "style": {
    "fontSize": 10,
    "color": "#4F46E5"
  }
}
```
