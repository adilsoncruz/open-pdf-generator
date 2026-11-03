# Examples & Ready-to-Use Templates

Explore practical, battle-tested templates included with Open PDF Generator. You can test and modify them directly in your browser using the [Interactive Web Playground](/open-pdf-generator/playground/) or run them locally via CLI and Kotlin.

---

## 1. Commercial Invoice (`invoice.json`)

A full corporate invoice featuring company branding, customer billing block, dynamic line-item table, calculated totals, Code128 barcode, and payment QR code.

<div style="margin: 16px 0;">
  <a href="/open-pdf-generator/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Test Invoice in Web Playground →
  </a>
</div>

### Template Highlights

- **Table Data Binding**: Maps `items` array to structured columns with automatic widths and text alignment.
- **Barcode & QR Code**: Dynamic Code128 and 2D QR Code elements linked to `${fatura.codigoBarras}` and `${fatura.linkPagamento}`.
- **Expression Evaluation**: Formats currency and calculates totals dynamically.

```bash
# Generate via CLI
pdf-generator generate invoice.json -d data.json -o invoice.pdf
```

---

## 2. Product Inventory Catalog (`listing.json`)

A multi-page inventory catalog with fixed running headers and footers, confidential watermarks, and alternating tabular borders.

<div style="margin: 16px 0;">
  <a href="/open-pdf-generator/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #059669; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Test Catalog in Web Playground →
  </a>
</div>

### Template Highlights

- **Running Header & Footer**: Repeating header line and footer with dynamic page numbering (`pageNumber | prefix:'Page '`).
- **Tabular Formatting**: Currency formatting with pipes (`price | format:'#,##0.00' | prefix:'$'`).
- **High-Throughput Rendering**: Capable of generating hundreds of catalog pages in milliseconds.

```bash
# Generate via CLI
pdf-generator generate listing.json -d data_listing.json -o catalog.pdf
```

---

## 3. Certificate of Achievement (`certificate.json`)

A modern landscape certificate suitable for course completions, awards, and accreditations.

<div style="margin: 16px 0;">
  <a href="/open-pdf-generator/playground/" target="_blank" style="display: inline-block; padding: 10px 20px; background: #7c3aed; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
    🎮 Test Certificate in Web Playground →
  </a>
</div>

### Template Highlights

- **Landscape Orientation**: Configured via `"orientation": "landscape"` in `pageSettings`.
- **Centered Typography**: Highlights recipient name and course title with elegant sizing and contrast.
- **Verification Code**: Includes issuance date and unique authentication hash.

```bash
# Generate via CLI
pdf-generator generate certificate.json -d data_cert.json -o certificate.pdf
```
