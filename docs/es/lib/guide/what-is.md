# ¿Qué es Open PDF Generator?

**Open PDF Generator** es un motor moderno y de alto throughput en Kotlin/Java para renderizar documentos PDF de nivel empresarial a partir de plantillas JSON declarativas.

Diseñado como un reemplazo cloud-native para motores de reporting legados como JasperReports, combina un runtime ligero, arranques en frío de milisegundos, pipelines de streaming de bytes y un diseñador visual desktop.

## Visión General

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────────────┐
│  Plantilla JSON │  +   │   Datos JSON    │  →   │  Motor PDF de Alta Vel. │  →  Archivo / Stream PDF
└─────────────────┘      └─────────────────┘      └─────────────────────────┘
```

Definir la estructura, la geometría y el estilo del documento en un formato JSON limpio e inyectar datos dinámicos en tiempo de ejecución. El motor evalúa expresiones, vincula campos, maneja la paginación dinámica y genera PDFs vectoriales en streaming con un overhead de memoria mínimo.

---

## ¿Por qué Open PDF Generator?

### 🚀 Ultra-Ligero y Cloud Native
- **Huella total de dependencias de 4,0 MB** (3.4x más ligero que JasperReports).
- **Arranque en frío de 195 ms** en contenedores JVM estándar — ejecución instantánea en AWS Lambda, Google Cloud Run y Kubernetes.
- Cero dependencias de compilador externo en runtime o generación pesada dinámica de bytecode.

### ⚡ Throughput Extremo (8.650 docs/seg)
- Pipeline de generación totalmente no bloqueante, escalable a múltiples núcleos.
- Genera **100.000 facturas en ~12 segundos** dentro de un contenedor de 2 vCPU / 1 GB de RAM.
- Streaming zero-copy (`generateToStream`) directo a sockets de red y cuerpos de respuesta HTTP.

### 📄 Plantillas JSON Declarativas
- Sin ciclos de compilación XML ni artefactos binarios propietarios `.jasper`.
- Las plantillas son JSON puro: fácilmente versionadas en Git, generadas dinámicamente o almacenadas en bases de datos.
- Validación nativa con JSON Schema (Draft-07) incluida.

### 🔗 Data Binding y Expresiones Potentes
- Interpolación mustache (<code v-pre>{{customer.name}}</code>) y rutas de data binding.
- **Más de 30 pipes de transformación** (monedas, fechas, números, operaciones de string).
- Renderizado condicional booleano (`printCondition`) y loops de iteración (`loop`).

### 🎨 Studio Visual Desktop
- **Open PDF Studio** construido sobre el design system Studio Slate.
- Canvas con drag-and-drop, edición multi-pestaña, previsualización en vivo en tiempo real y exportación JSON directa.

---

## Comparación Cara a Cara: Open PDF Generator vs JasperReports

| Métrica / Característica | Open PDF Generator | JasperReports 6.21.4 | JasperReports 7.0.3 | Ventaja de Open PDF |
|:---|:---:|:---:|:---:|:---:|
| **Throughput (contenedor 2 vCPU)** | **8.650 docs/seg** | 3.338 docs/seg | 3.539 docs/seg | **2.4x - 2.6x más rápido** |
| **Arranque en Frío (latencia 1er doc)** | **195 ms** | 1.166 ms | 742 ms | **3.8x - 4.3x más rápido** |
| **Memoria RSS del Contenedor (100k docs)** | **128 MB** *(Cero pausas por GC)* | 164 MB *(Pausas de GC pesadas)* | 171 MB *(Baseline alto)* | **25% menos memoria** |
| **Huella de Dependencias en Runtime** | **4,0 MB** | 13,6 MB+ (hasta 50MB) | 25,2 MB (modular + JDT) | **6.3x más ligero** |
| **Formato de Plantilla** | **JSON** declarativo | **JRXML / XML** complejo | **Jackson XML** más estricto | Amigable con Git, sin compilación |
| **Diseñador Visual** | ✅ Open PDF Studio | ✅ Jaspersoft Studio | ✅ Jaspersoft Studio | UI moderna Electron/React |
| **API de Streaming** | ✅ `OutputStream` directo | ⚠️ Requiere buffer en memoria | ⚠️ Requiere buffer en memoria | Stream de bytes zero-copy |
| **Licencia** | **LGPL-3.0** *(Gratis, uso comercial OK)* | LGPL-3.0 / Comercial | LGPL-3.0 / Comercial | Misma libertad |

> 📊 **Explora Toda la Evidencia:** Ve los benchmarks JMH, los resultados de estrés en contenedores cgroup y el análisis de costos cloud FinOps en nuestro [Reporte de Benchmark](/lib/benchmark).

---

## Elementos Soportados

| Elemento | Descripción |
|:---|:---|
| **Texto** | Tipografía con familias de fuentes, tamaños, alineación, ajuste de línea y bindings dinámicos |
| **Tabla** | Layouts de grilla, definiciones multi-columna, salto de página automático y encabezados repetidos |
| **Imagen** | Incrustación vía URL, archivo local o Base64 preservando la relación de aspecto |
| **Contenedor** | Caja de agrupación de layout con bordes, paddings y rellenos de fondo |
| **Marca de Agua** | Marcas de agua de texto o imagen de fondo multi-página con opacidad y rotación configurables |
| **Código de Barra y QR** | Códigos de barra (Code 128, EAN, 39) y códigos QR renderizados directamente como gráficos vectoriales |
| **Salto de Página** | Control explícito de paginación programática |
| **Rectángulo y Línea** | Acentos geométricos, divisores y formas decorativas |
| **Loop** | Secciones repetidas sobre arrays JSON dinámicos |
| **Condicional** | Renderizado contextual según reglas de negocio booleanas |
| **Página de Resumen** | Página dedicada de cierre/apéndice para totales, términos y firmas |

---

## Arquitectura

```
┌────────────────────────────────────────────────────────┐
│            Your Application / Microservice             │
│        (Spring Boot, Quarkus, Micronaut, Ktor)         │
└────────────────────────────────────────────────────────┘
                           │
       generate(template, data) / generateToStream(...)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Open PDF Generator Engine                │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Template Parser & JSON Schema Draft-07         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Expression Evaluator & Data-Binding Pipeline   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Layout Planner & Dynamic Pagination Engine     │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   High-Efficiency Vector Renderer (OpenPDF 2.x)  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│        Vector PDF Output (Memory or Stream)            │
└────────────────────────────────────────────────────────┘
```

---

## Casos de Uso Comunes

### Facturación y Cobranza de Alto Volumen
- Facturas electrónicas, boletas de servicios, recibos y confirmaciones de pedidos.
- Salto de página automático en tablas de productos multi-página, subtotales y códigos QR fiscales.

### Estados Financieros y Reportes
- Resúmenes de portafolio, estados de cuenta e historiales transaccionales tabulares.
- Encabezados y pies de página con numeración de páginas dinámica (<code v-pre>Página {{page}} de {{pages}}</code>).

### Etiquetas de Envío y Logística
- Guías de pallet, manifiestos de empaque y notas de despacho con códigos de barra Code 128.

### Contratos y Certificados
- Acuerdos formales con párrafos justificados, marcas de agua personalizadas y bloques de firma.

---

## Requisitos

- **Java 11+** o **Kotlin 1.8+**
- **Gradle** o **Maven**
- Se ejecuta nativamente en contenedores Linux, macOS y Windows (Alpine, Distroless, Debian).

---

## Próximos Pasos

- [Guía de Instalación](/es/lib/guide/installation) - Agrega la dependencia a Gradle/Maven
- [Tutorial de Primeros Pasos](/es/lib/guide/first-steps) - Genera tu primera factura en 5 minutos
- [Especificación de Plantillas](/es/lib/guide/templates) - Explora el formato de plantillas JSON
- [⚡ Caso de Estudio de Benchmark](/lib/benchmark) - Ve métricas detalladas de rendimiento y contenedores
