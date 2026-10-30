# Grupos de Elementos

Los Grupos de Elementos (`groups`) permiten agrupar varios elementos de la plantilla bajo un identificador común de grupo y controlar su impresión simultáneamente mediante un único `printCondition`.

## Características

- ✅ **Visibilidad Unificada**: Controla múltiples elementos con un solo `printCondition`.
- ✅ **Consciente de Secciones**: Los grupos pueden definirse en el cuerpo de la plantilla, el encabezado, el pie de página, el fondo o la página de resumen.
- ✅ **Integración con el Editor Visual**: Crea, nombra, inspecciona y desagrupa elementos mediante el menú contextual del clic derecho o el panel de capas en el Editor.

---

## Propiedades del Grupo

Cada objeto de grupo dentro de `template.groups` (o los grupos de una sección) contiene:

| Propiedad | Tipo | Obligatorio | Descripción |
|----------|------|----------|-------------|
| `id` | string | ✅ | Identificador único del grupo (por ejemplo, `"group-1"`) |
| `name` | string | ❌ | Nombre amigable para mostrar (por ejemplo, `"Tax Total Block"`) |
| `elementIds` | string[] | ✅ | Arreglo de IDs de elementos que pertenecen a este grupo |
| `printCondition` | string | ❌ | Expresión booleana evaluada para todos los elementos del grupo |

---

## Ejemplo: Grupo Condicional

```json
{
  "version": "1.0",
  "groups": [
    {
      "id": "discount-group",
      "name": "Discount Section",
      "printCondition": "order.discount > 0",
      "elementIds": ["discount-label", "discount-value", "discount-badge"]
    }
  ],
  "page": [
    { "type": "text", "id": "discount-label", "x": 350, "y": 400, "text": "Discount Applied:" },
    { "type": "text", "id": "discount-value", "x": 480, "y": 400, "text": "-{{order.discount | currency:'USD'}}" },
    { "type": "rectangle", "id": "discount-badge", "x": 340, "y": 395, "width": 200, "height": 24 }
  ]
}
```

Si `order.discount > 0` es falso, ninguno de los 3 elementos del grupo se renderizará en el PDF generado.
