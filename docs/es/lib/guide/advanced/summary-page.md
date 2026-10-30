# Página de Resumen

La configuración `summaryPage` permite generar una página de cierre o resumen dedicada que se añade al final del documento.

## Características

- ✅ **Página Final Dedicada**: Ideal para totales de cierre, firmas, términos de servicio o registros de auditoría.
- ✅ **Elementos y Grupos Separados**: Se definen de forma independiente a las páginas estándar del cuerpo.
- ✅ **Fondo Dedicado**: Soporta un contenedor/formas `background` personalizados específicamente para la página de resumen.
- ✅ **Generación Condicional**: Se renderiza solo cuando `printCondition` evalúa a `true`.

---

## Propiedades de Configuración

Se define en el nivel raíz de la plantilla (`template.summaryPage`):

| Propiedad | Tipo | Obligatorio | Descripción |
|----------|------|----------|-------------|
| `elements` | array | ✅ | Lista de elementos a renderizar en la página de resumen |
| `groups` | array | ❌ | Lista de grupos de elementos definidos en la página de resumen |
| `background` | object | ❌ | Configuración de `BodyBackground` dedicada a esta página |
| `printCondition` | string | ❌ | Expresión booleana para decidir si se añade la página de resumen |

---

## Ejemplo: Firmas y Resumen de Cierre

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    {
      "type": "text",
      "id": "intro",
      "x": 36,
      "y": 50,
      "text": "Contract Body..."
    }
  ],
  "summaryPage": {
    "printCondition": "requireSignatures == true",
    "elements": [
      {
        "type": "text",
        "id": "summary-title",
        "x": 36,
        "y": 60,
        "text": "Terms and Signatures",
        "font": { "size": 18, "style": "bold" }
      },
      {
        "type": "line",
        "id": "sig-line-1",
        "x1": 36,
        "y1": 300,
        "x2": 250,
        "y2": 300
      },
      {
        "type": "text",
        "id": "sig-label-1",
        "x": 36,
        "y": 310,
        "text": "Contractor Signature"
      }
    ]
  }
}
```
