# Exemplos

## Geração Básica de Fatura

### Template (`invoice-template.json`)

```json
{
  "page": {
    "format": "A4",
    "orientation": "portrait",
    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20 }
  },
  "body": {
    "elements": [
      {
        "type": "text",
        "x": 10,
        "y": 10,
        "text": "Invoice #{{invoiceNumber}}",
        "fontSize": 24,
        "fontWeight": "bold"
      },
      {
        "type": "text",
        "x": 10,
        "y": 40,
        "text": "Customer: {{customer.name}}"
      },
      {
        "type": "text",
        "x": 10,
        "y": 55,
        "text": "Date: {{date}}"
      }
    ]
  }
}
```

### Dados (`invoice-data.json`)

```json
{
  "invoiceNumber": "INV-2025-001",
  "customer": {
    "name": "Acme Corporation",
    "email": "billing@acme.com"
  },
  "date": "2025-01-07"
}
```

### Comando

```bash
pdf-generator generate invoice-template.json -d invoice-data.json -o invoice.pdf
```

## Processamento em Lote

Gere várias faturas a partir de uma lista:

```bash
#!/bin/bash

for i in {1..10}; do
  # Generate data file
  cat > /tmp/data-$i.json << EOF
{
  "invoiceNumber": "INV-2025-$(printf '%03d' $i)",
  "customer": { "name": "Customer $i" },
  "date": "$(date +%Y-%m-%d)"
}
EOF

  # Generate PDF
  pdf-generator generate invoice-template.json \
    -d /tmp/data-$i.json \
    -o invoices/invoice-$i.pdf
done
```

## Integração CI/CD

### GitHub Actions

```yaml
name: Generate Reports

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 8am

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Download CLI
        run: |
          curl -L https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar \
            -o pdf-generator-cli.jar
      
      - name: Generate Report
        run: |
          java -jar pdf-generator-cli.jar generate \
            templates/weekly-report.json \
            -d data/report-data.json \
            -o reports/weekly-report.pdf
      
      - name: Upload Artifact
        uses: actions/upload-artifact@v4
        with:
          name: weekly-report
          path: reports/weekly-report.pdf
```

### Docker

```dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Download CLI
RUN wget -O pdf-generator-cli.jar \
    https://github.com/adilsoncruz/open-pdf-generator/releases/latest/download/pdf-generator-cli.jar

# Copy templates
COPY templates/ /app/templates/

ENTRYPOINT ["java", "-jar", "pdf-generator-cli.jar"]
```

Uso:

```bash
docker build -t pdf-generator .
docker run -v $(pwd)/output:/app/output pdf-generator \
  generate templates/invoice.json -d data.json -o output/invoice.pdf
```

## Validação em Hook de Pre-commit

`.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Validate all template files before commit
for file in $(git diff --cached --name-only | grep '\.json$'); do
  if [[ $file == templates/* ]]; then
    echo "Validating $file..."
    java -jar ~/.pdf-generator/pdf-generator-cli.jar validate "$file"
    if [ $? -ne 0 ]; then
      echo "❌ Template validation failed: $file"
      exit 1
    fi
  fi
done

echo "✅ All templates valid"
```
