# Elemento Page Break

El `PageBreakElement` obliga al motor de renderizado del PDF a terminar la página actual inmediatamente y continuar renderizando los elementos siguientes en una página nueva.

## Características

- ✅ **División explícita de páginas**: separación limpia entre secciones multipágina.
- ✅ **Salto condicional**: soporta `printCondition` para provocar saltos de página solo cuando se cumplen condiciones específicas de los datos.
- ✅ **Soporte de flujo dinámico**: se integra de forma natural con bucles, tablas y elementos de flujo automático.

---

## Propiedades

| Propiedad | Tipo | Requerido | Descripción |
|----------|------|----------|-------------|
| `type` | string | ✅ | Debe ser `"page_break"` |
| `id` | string | ✅ | Identificador único del elemento |
| `x` | number | ❌ | Posición X (predeterminado: `0`) |
| `y` | number | ❌ | Posición Y (predeterminado: `0`) |
| `positionMode` | string | ❌ | Generalmente `"relative"` (predeterminado) para saltar tras los elementos precedentes |
| `relativeOffsetY` | number | ❌ | Espaciado adicional antes del salto |
| `printCondition` | string | ❌ | Expresión booleana que decide si se provoca el salto |

---

## Ejemplo Básico

```json
{
  "type": "page_break",
  "id": "break-section-2",
  "positionMode": "relative"
}
```

---

## Ejemplo de Salto de Página Condicional

Solo divide a una página nueva si la factura tiene más de 5 ítems o si se solicitaron los términos y condiciones:

```json
{
  "type": "page_break",
  "id": "conditional-terms-break",
  "positionMode": "relative",
  "printCondition": "items.length > 5 || showTerms == true"
}
```
