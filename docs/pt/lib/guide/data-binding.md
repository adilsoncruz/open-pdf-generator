# Data Binding

O data binding permite vincular dados dinâmicos aos templates.

## Sintaxe Básica

```json
{
  "type": "text",
  "id": "customer-name",
  "dataBinding": "customer.name"
}
```

**Dados:**
```json
{
  "customer": {
    "name": "John Smith"
  }
}
```

**Resultado:** `John Smith`

---

## Propriedades Aninhadas

Acesso a objetos aninhados usando notação de ponto:

```json
{
  "dataBinding": "order.customer.address.city"
}
```

**Dados:**
```json
{
  "order": {
    "customer": {
      "address": {
        "city": "New York"
      }
    }
  }
}
```

---

## Acesso a Arrays

Acesso a itens de array por índice:

```json
{
  "dataBinding": "items.0.name"
}
```

**Dados:**
```json
{
  "items": [
    { "name": "First Item" },
    { "name": "Second Item" }
  ]
}
```

**Resultado:** `First Item`

---

## Interpolação

Misture texto estático com dados dinâmicos usando `{{}}`:

```json
{
  "type": "text",
  "value": "Customer: {{customer.name}} - Order #{{order.id}}"
}
```

**Resultado:** `Customer: John Smith - Order #12345`

---

## Transformações (Pipes)

Aplique transformações aos dados:

```json
{
  "dataBinding": "customer.name | upperCase"
}
```

**Resultado:** `JOHN SMITH`

### Múltiplas Transformações

Encadeie transformações:

```json
{
  "dataBinding": "price | round:2 | currency:'USD'"
}
```

Consulte [Transformações](/pt/lib/guide/transformations) para ver todos os pipes disponíveis.

---

## Variáveis Especiais

### Variáveis de Sistema

Estas variáveis estão disponíveis automaticamente em todos os contextos (elementos da página, cabeçalho, rodapé):

| Variável | Descrição | Formato |
|----------|-------------|--------|
| `_pageNumber` | Número da página atual | 1, 2, 3... |
| `_date` | Data atual | YYYY-MM-DD (ex.: 2026-01-16) |
| `_dateTime` | Data e hora atuais | YYYY-MM-DDTHH:mm:ss (ex.: 2026-01-16T14:30:45) |

### Variáveis de Loop

| Variável | Descrição |
|----------|-------------|
| `$item` | Item atual do loop |
| `$index` | Índice atual do loop (começa em 0) |

### Exemplo de Números de Página

```json
{
  "type": "text",
  "dataBinding": "_pageNumber"
}
```

Ou combinado com texto:

```json
{
  "type": "text",
  "value": "Page ${_pageNumber}"
}
```

### Exemplo de Data

```json
{
  "type": "text",
  "value": "Generated on: ${_date}"
}
```

---

## Em Loops

Dentro de um loop, use `$item` para acessar o item atual:

```json
{
  "type": "loop",
  "dataBinding": "products",
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name"
    },
    {
      "type": "text",
      "dataBinding": "$item.price | currency:'USD'"
    }
  ]
}
```

---

## Em Tabelas

As colunas de tabela usam uma sintaxe especial:

```json
{
  "type": "table",
  "dataBinding": "items",
  "columns": [
    {
      "header": "Product",
      "field": "$item.name"
    },
    {
      "header": "Price",
      "field": "$item.price | currency:'USD'"
    }
  ]
}
```

---

## Valores Padrão

Use o pipe `default` para valores alternativos:

```json
{
  "dataBinding": "notes | default:'No notes provided'"
}
```

---

## Próximos Passos

- [Transformações](/pt/lib/guide/transformations) - Formatar e transformar dados
- [Condições](/pt/lib/guide/conditions) - Renderização condicional
- [Elementos](/pt/lib/guide/elements/text) - Todos os elementos disponíveis
