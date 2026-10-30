# Marca de Agua

El PDF Generator soporta marcas de agua de texto e imagen configuradas dentro de `pageSettings`. Las marcas de agua pueden aplicarse a todas las páginas con opacidad, rotación y renderización condicional personalizadas.

## Características

- ✅ **Tipos Texto e Imagen**: Sellos de texto diagonales (por ejemplo, `CONFIDENTIAL`, `DRAFT`) o imágenes de logotipo de la empresa.
- ✅ **Data Binding Dinámico**: Vincula el texto de la marca de agua a variables de los datos de la plantilla.
- ✅ **Orden de Capas**: Elige si la marca de agua se imprime al fondo (`onTop: false`) o sobre el contenido (`onTop: true`).
- ✅ **Marcas de Agua Condicionales**: Usa `printCondition` para mostrarla solo bajo entornos específicos (por ejemplo, si el estado es `draft` o `preview`).

---

## Propiedades de Configuración

Se configura bajo `template.pageSettings.watermark`:

| Propiedad | Tipo | Predeterminado | Descripción |
|----------|------|---------|-------------|
| `type` | string | `"text"` | Tipo de marca de agua: `"text"` o `"image"` |
| `text` | string | `null` | Texto estático de la marca de agua |
| `dataBinding` | string | `null` | Ruta de la variable para texto dinámico (por ejemplo, `"docStatus"`) |
| `imageSource` | string | `null` | Ruta de la imagen o URL de datos base64 para marcas de agua de imagen |
| `fontName` | string | `"Helvetica"` | Familia de fuentes para marcas de agua de texto |
| `fontSize` | number | `60` | Tamaño de fuente en puntos |
| `fontStyle` | string | `"bold"` | `"normal"`, `"bold"` o `"italic"` |
| `color` | string | `"#CCCCCC"` | Código de color hexadecimal |
| `opacity` | number | `0.2` | Nivel de transparencia desde `0.0` (invisible) hasta `1.0` (opaco) |
| `rotation` | number | `45` | Ángulo de rotación en grados |
| `onTop` | boolean | `false` | Cuando es `true`, se renderiza sobre los elementos de la página; cuando es `false`, se renderiza detrás |
| `repeat` | boolean | `false` | Cuando es `true`, repite la marca de agua por toda la página en una cuadrícula alternada |
| `spacingX` | number | `null` | Espaciado horizontal entre marcas de agua repetidas, en puntos |
| `spacingY` | number | `null` | Espaciado vertical entre marcas de agua repetidas, en puntos |
| `printCondition` | string | `null` | Expresión booleana que decide si la marca de agua se renderiza |

---

## Ejemplo: Marca de Agua de Texto "Borrador"

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 },
    "watermark": {
      "type": "text",
      "text": "DRAFT",
      "fontSize": 72,
      "color": "#DC2626",
      "opacity": 0.15,
      "rotation": 45,
      "printCondition": "status == 'draft'"
    }
  },
  "page": []
}
```

---

## Ejemplo: Marca de Agua Dinámica con Data Binding

```json
{
  "watermark": {
    "type": "text",
    "dataBinding": "watermarkLabel",
    "fontSize": 54,
    "color": "#64748B",
    "opacity": 0.2,
    "rotation": -30
  }
}
```

---

## Ejemplo: Marca de Agua Repetida (Patrón Mosaico)

Para repetir un sello de seguridad en diagonal por toda la página:

```json
{
  "watermark": {
    "type": "text",
    "text": "CONFIDENTIAL",
    "fontSize": 32,
    "color": "#94A3B8",
    "opacity": 0.12,
    "rotation": 45,
    "repeat": true,
    "spacingX": 200,
    "spacingY": 140
  }
}
```
