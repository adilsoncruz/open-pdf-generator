# Validação de Schema

O Open PDF Generator oferece **validação por JSON Schema** integrada para garantir que os dados passados aos seus templates atendam aos contratos estruturais antes de qualquer renderização ocorrer.

---

## Por Que Validar os Dados?

Os templates dependem de modelos de dados específicos (ex.: objetos aninhados, strings obrigatórias, listas de itens). Sem validação, propriedades ausentes ou tipos incorretos podem causar blocos de texto vazios, cálculos quebrados ou distorções inesperadas no layout.

Com validação de schema:
- A estrutura dos dados é verificada antecipadamente, antes do início do layout do documento.
- Erros de validação detalhados indicam os caminhos exatos (ex.: `#/customer/email`).
- Payloads inválidos são rejeitados cedo, com uma `PDFSchemaValidationException` descritiva.

---

## Especificações Suportadas

O motor de validação suporta as especificações padrão do JSON Schema:
- **Draft-07** (padrão)
- **Draft 2020-12**

Você pode declarar explicitamente seu dialeto usando a palavra-chave `$schema` na definição do schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": { ... }
}
```

---

## Definindo um Schema em um Template

Adicione a propriedade `"schema"` no nível raiz do JSON do seu template:

```json
{
  "version": "1.0",
  "metadata": {
    "name": "Invoice Template"
  },
  "pageSettings": {
    "size": "A4",
    "orientation": "portrait"
  },
  "schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["invoiceNumber", "customer", "items"],
    "properties": {
      "invoiceNumber": {
        "type": "string",
        "pattern": "^INV-[0-9]{4,}$"
      },
      "issueDate": {
        "type": "string",
        "format": "date"
      },
      "customer": {
        "type": "object",
        "required": ["name", "email"],
        "properties": {
          "name": { "type": "string", "minLength": 1 },
          "email": { "type": "string", "format": "email" }
        }
      },
      "items": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["description", "quantity", "unitPrice"],
          "properties": {
            "description": { "type": "string" },
            "quantity": { "type": "integer", "minimum": 1 },
            "unitPrice": { "type": "number", "minimum": 0 }
          }
        }
      }
    }
  },
  "page": [
    {
      "type": "text",
      "id": "invoice-title",
      "text": "Invoice #{{invoiceNumber}}",
      "style": { "fontSize": 18, "bold": true }
    }
  ]
}
```

---

## Geração e Tratamento de Erros

Ao chamar `PDFGenerator.generate(...)`, se o template contiver um `schema`, os dados de entrada são validados automaticamente. Se a validação falhar, uma `PDFSchemaValidationException` é lançada:

```kotlin
import com.pdfgenerator.api.PDFGenerator
import com.pdfgenerator.api.PDFSchemaValidationException
import com.pdfgenerator.model.Template
import java.io.File

val template = Template.fromFile(File("invoice-template.json"))
val invalidData = mapOf("invoiceNumber" to "123") // Missing required customer and items

try {
    val pdfBytes = PDFGenerator.generate(template, invalidData)
} catch (e: PDFSchemaValidationException) {
    println("Schema validation failed with ${e.errors.size} error(s):")
    e.errors.forEach { err ->
        println(" - [${err.keyword}] at ${err.path}: ${err.message}")
    }
}
```

### Estrutura de SchemaValidationError

Cada erro em `e.errors` contém:

| Propriedade | Tipo | Descrição |
|---|---|---|
| `path` | `String` | JSON pointer / localização da instância do campo com problema (ex.: `#/customer/email` ou `$.customer.email`) |
| `message` | `String` | Explicação legível do erro de validação |
| `keyword` | `String?` | Palavra-chave da restrição do schema que falhou (ex.: `required`, `pattern`, `minimum`) |

---

## Validação Independente

Você também pode usar o `SchemaValidator` separadamente da geração de documentos:

```kotlin
import com.pdfgenerator.validator.SchemaValidator

val schema = mapOf(
    "type" to "object",
    "required" to listOf("name"),
    "properties" to mapOf(
        "name" to mapOf("type" to "string")
    )
)

val data = mapOf<String, Any>()

val errors = SchemaValidator.validate(schema, data)
if (errors.isNotEmpty()) {
    println("Invalid payload: ${errors.first().message}")
}
```

Para validar que o próprio schema está em conformidade com o meta-schema:

```kotlin
// Throws IllegalArgumentException if the schema definition is invalid
SchemaValidator.validateSchema(schema)
```

---

## Suporte no Editor de Templates

O **Editor Visual de Templates PDF** oferece suporte de primeira classe a schemas:

1. **Modal de Edição de Schema (`{ }`)**:
   - Clique no ícone `{ }` na barra de ferramentas superior para visualizar e editar o JSON Schema.
   - Com realce de sintaxe, numeração de linhas, diagnóstico de erros e formatador de JSON embutidos.
2. **Validação de Dados em Tempo Real**:
   - O editor valida continuamente o payload de Dados de Teste atual contra o schema ativo, sinalizando violações com destaques de erro linha a linha.
3. **Inferir Schema a Partir dos Dados de Teste**:
   - Começando pelo fim? Clique em **Infer from Test Data** para gerar automaticamente um schema em conformidade a partir de um JSON de exemplo existente.
4. **Gerar Dados de Teste (Mock)**:
   - Clique em **Generate Mock Data** para sintetizar valores de mock aleatórios e realistas que correspondem aos tipos, formatos, padrões de expressão regular e limites aninhados do seu schema, com um único clique.
