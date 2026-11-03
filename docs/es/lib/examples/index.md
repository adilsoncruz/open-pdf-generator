# Ejemplos y Plantillas Listas

Explore plantillas prácticas listas para producción incluidas en Open PDF Generator. Puede probarlas y editarlas directamente en su navegador usando el [Playground Web Interactivo](/open-pdf-generator/playground/) o ejecutarlas localmente mediante la CLI y la biblioteca Kotlin.

---

## 1. Factura Comercial Corporativa (`invoice.json`)

Factura corporativa completa con marca de empresa, bloque de facturación del cliente, tabla dinámica de artículos, cálculo de totales, código de barras Code128 y código QR de pago.

<div style="margin: 16px 0;">
  <a href="/open-pdf-generator/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Probar Factura en el Playground Web →
  </a>
</div>

### Aspectos Destacados

- **Tabla con Data Binding**: Mapea el array `items` en columnas estructuradas con anchos y alineación automática.
- **Código de Barras y Código QR**: Elementos Code128 y QR 2D vinculados a `${fatura.codigoBarras}` y `${fatura.linkPagamento}`.
- **Evaluación de Expresiones**: Formatea monedas y calcula totales dinámicamente.

```bash
# Generar mediante CLI
pdf-generator generate invoice.json -d data.json -o factura.pdf
```

---

## 2. Catálogo de Productos e Inventario (`listing.json`)

Catálogo de inventario multipágina con encabezados y pies de página fijos, marcas de agua de confidencialidad y bordes tabulares claros.

<div style="margin: 16px 0;">
  <a href="/open-pdf-generator/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #059669; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Probar Catálogo en el Playground Web →
  </a>
</div>

### Aspectos Destacados

- **Encabezado y Pie de Página Fijos**: Repetición en todas las páginas con numeración dinámica (`pageNumber | prefix:'Página '`).
- **Formato Tabular**: Formato de moneda con pipes (`price | format:'#,##0.00' | prefix:'$ '`).
- **Alto Rendimiento**: Generación de cientos de páginas en milisegundos sin problemas de memoria.

```bash
# Generar mediante CLI
pdf-generator generate listing.json -d data_listing.json -o catalogo.pdf
```

---

## 3. Certificado de Logro (`certificate.json`)

Certificado en orientación horizontal (landscape) adecuado para cursos, premios y reconocimientos.

<div style="margin: 16px 0;">
  <a href="/open-pdf-generator/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #7c3aed; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Probar Certificado en el Playground Web →
  </a>
</div>

### Aspectos Destacados

- **Orientación Horizontal**: Configurada con `"orientation": "landscape"` en `pageSettings`.
- **Tipografía Centrada**: Destaca el nombre del estudiante y el curso con jerarquía visual elegante.
- **Código de Verificación**: Incluye fecha de emisión y código único de autenticación.

```bash
# Generar mediante CLI
pdf-generator generate certificate.json -d data_cert.json -o certificado.pdf
```
