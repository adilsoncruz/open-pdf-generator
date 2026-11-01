# Elemento Checklist (Lista de Verificación)

El `CheckListElement` renderiza listas de tareas interactivas con casillas de verificación (rectangulares, redondeadas o circulares). Puede vincularse dinámicamente a objetos JSON o mapas de clave/valor.

## Características

- ✅ **Estilos de Casilla**: `RECTANGLE` (cuadrada), `BORDERED` (cuadrada redondeada), `CIRCLE` (circular)
- ✅ **Mapeo Clave/Valor**: Extrae la etiqueta de la clave y el estado marcado/desmarcado a partir de booleanos
- ✅ **Tareas Estáticas**: Permite definir tareas y su estado inicial directamente en la plantilla
- ✅ **Data Binding Dinámico**: Vinculación a objetos como `tasks: { "Tarea A": true, "Tarea B": false }`
- ✅ **Fidelidad Visual**: Los elementos marcados muestran una marca de verificación vectorial nítida
- ✅ **Flujo Multipágina**: Salto de página automático cuando las tareas exceden el espacio útil

---

## Propiedades

| Propiedad | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `type` | string | ✅ | Debe ser `"check_list"` |
| `id` | string | ✅ | Identificador único del elemento |
| `x` | number | ✅ | Posición horizontal (pt) |
| `y` | number | ✅ | Posición vertical (pt) |
| `width` | number / string | ❌ | Ancho en puntos o `"100%"` (por defecto: 400) |
| `height` | number | ❌ | Alto en puntos (por defecto: 50) |
| `dataBinding` | string | ❌ | Ruta al objeto en los datos (ej: `"tareas"` o `"auditoria.checklist"`) |
| `items` | object | ❌ | Mapa estático de etiquetas a booleanos `{ "Elemento": true }` |
| `checkStyle` | string | ❌ | `"RECTANGLE"` (por defecto), `"BORDERED"` o `"CIRCLE"` |
| `itemSpacing` | number | ❌ | Espaciado vertical entre tareas en puntos (por defecto: 0) |
| `startY` | number | ❌ | Desplazamiento vertical inicial personalizado |
| `style` | object | ❌ | Estilos de texto y casilla (`fontSize`, `fontFamily`, `color`, `backgroundColor`) |
| `printCondition` | string | ❌ | Expresión condicional para renderizado |

---

## Ejemplos en JSON

### Checklist Dinámica desde Payload

```json
{
  "type": "check_list",
  "id": "auditoria-checklist",
  "x": 40,
  "y": 140,
  "width": 500,
  "dataBinding": "tareasAuditoria",
  "checkStyle": "BORDERED",
  "itemSpacing": 6,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

**Ejemplo de Payload:**
```json
{
  "tareasAuditoria": {
    "Documentación inspeccionada": true,
    "Protocolo de seguridad verificado": true,
    "Firma final aprobada": false
  }
}
```

### Checklist Estática

```json
{
  "type": "check_list",
  "id": "entrega-checklist",
  "x": 40,
  "y": 280,
  "width": 450,
  "checkStyle": "CIRCLE",
  "items": {
    "Pruebas unitarias de Core aprobadas": true,
    "Build de distribución de CLI verificado": true,
    "Editor visual y propiedades actualizados": true,
    "Documentación publicada": false
  },
  "itemSpacing": 4,
  "style": {
    "fontSize": 10,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

---

## DSL Programática en Kotlin

```kotlin
val template = TemplateBuilder()
    .addCheckList {
        id = "inspeccion-checklist"
        x = 40f
        y = 120f
        width = 515f
        dataBinding = "tareasInspeccion"
        checkStyle = CheckStyle.CIRCLE
        itemSpacing = 5f
        style = TextStyle(fontSize = 11f, color = "#0f172a")
    }
    .build()
```
