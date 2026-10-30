# Transformações (Pipes)

As transformações permitem modificar valores antes de exibi-los no PDF, usando a sintaxe de pipe `|`.

## Sintaxe Básica

```json
{
  "type": "text",
  "dataBinding": "value | transformation"
}
```

Você pode encadear várias transformações:

```json
{
  "dataBinding": "name | trim | upperCase"
}
```

Com argumentos:

```json
{
  "dataBinding": "price | format:'#,##0.00'"
}
```

---

## Transformações de Texto

### upperCase / upper
Converte o texto para MAIÚSCULAS.

**Exemplo:**
```json
{
  "dataBinding": "customer.name | upperCase"
}
```

**Dados:**
```json
{ "customer": { "name": "John Smith" } }
```

**Resultado:** `JOHN SMITH`

---

### lowerCase / lower
Converte o texto para minúsculas.

**Exemplo:**
```json
{
  "dataBinding": "customer.email | lowerCase"
}
```

**Resultado:** `john.smith@email.com`

---

### capitalize / cap
Capitaliza a primeira letra de cada palavra.

**Exemplo:**
```json
{
  "dataBinding": "product.name | capitalize"
}
```

**Dados:**
```json
{ "product": { "name": "dell inspiron notebook" } }
```

**Resultado:** `Dell Inspiron Notebook`

---

### trim
Remove os espaços em branco do início e do fim.

**Exemplo:**
```json
{
  "dataBinding": "message | trim"
}
```

**Dados:**
```json
{ "message": "  text with spaces  " }
```

**Resultado:** `text with spaces`

---

### truncate:N[:sufixo]
Limita o texto a N caracteres, adicionando um sufixo (padrão: `...`).

**Exemplo:**
```json
{
  "dataBinding": "description | truncate:50"
}
```

**Dados:**
```json
{ "description": "This is a very long text that needs to be truncated to fit in the available space" }
```

**Resultado:** `This is a very long text that needs to be trunca...`

Com sufixo personalizado:
```json
{
  "dataBinding": "description | truncate:30:'…'"
}
```

---

### padLeft:N[:caractere] / lpad:N[:caractere]
Preenche à esquerda até N caracteres (padrão: espaço).

**Exemplo:**
```json
{
  "dataBinding": "code | padLeft:5:'0'"
}
```

**Dados:**
```json
{ "code": "123" }
```

**Resultado:** `00123`

---

### padRight:N[:caractere] / rpad:N[:caractere]
Preenche à direita até N caracteres.

**Exemplo:**
```json
{
  "dataBinding": "name | padRight:20:'.'"
}
```

**Dados:**
```json
{ "name": "John" }
```

**Resultado:** `John................`

---

### replace:'antigo':'novo'
Substitui todas as ocorrências de um texto.

**Exemplo:**
```json
{
  "dataBinding": "phone | replace:'-':''"
}
```

**Dados:**
```json
{ "phone": "11-9999-8888" }
```

**Resultado:** `1199998888`

---

### prefix:'texto'
Adiciona um prefixo ao valor.

**Exemplo:**
```json
{
  "dataBinding": "value | prefix:'$ '"
}
```

**Dados:**
```json
{ "value": "100" }
```

**Resultado:** `$ 100`

---

### suffix:'texto'
Adiciona um sufixo ao valor.

**Exemplo:**
```json
{
  "dataBinding": "quantity | suffix:' units'"
}
```

**Dados:**
```json
{ "quantity": "5" }
```

**Resultado:** `5 units`

---

### reverse
Inverte o texto.

**Exemplo:**
```json
{
  "dataBinding": "code | reverse"
}
```

**Dados:**
```json
{ "code": "ABC123" }
```

**Resultado:** `321CBA`

---

## Transformações Numéricas

### format:'padrão'
Formata números usando DecimalFormat.

**Padrões comuns:**
- `#,##0.00` → 1,234.56
- `#,##0` → 1,234
- `0.00` → 1234.56
- `#,##0.000` → 1,234.567

**Exemplo:**
```json
{
  "dataBinding": "price | format:'#,##0.00'"
}
```

**Dados:**
```json
{ "price": 1234.5678 }
```

**Resultado:** `1,234.57`

---

### currency:'CÓDIGO'
Formata como moeda usando o código ISO.

**Códigos suportados:**
- `USD` → $1,234.56
- `EUR` → €1,234.56
- `GBP` → £1,234.56
- `BRL` → R$ 1.234,56

**Exemplo:**
```json
{
  "dataBinding": "total | currency:'USD'"
}
```

**Dados:**
```json
{ "total": 1234.56 }
```

**Resultado:** `$1,234.56`

---

### numberFormat:'locale' / numfmt:'locale'
Formata o número usando um locale específico.

**Exemplo:**
```json
{
  "dataBinding": "value | numberFormat:'en-US'"
}
```

---

### abs
Retorna o valor absoluto.

**Exemplo:**
```json
{
  "dataBinding": "balance | abs"
}
```

**Dados:**
```json
{ "balance": -150.00 }
```

**Resultado:** `150.00`

---

### round:decimais
Arredonda para N casas decimais.

**Exemplo:**
```json
{
  "dataBinding": "value | round:2"
}
```

**Dados:**
```json
{ "value": 123.456789 }
```

**Resultado:** `123.46`

---

### floor
Arredonda para baixo.

**Exemplo:**
```json
{
  "dataBinding": "price | floor"
}
```

**Dados:**
```json
{ "price": 99.99 }
```

**Resultado:** `99`

---

### ceil
Arredonda para cima.

**Exemplo:**
```json
{
  "dataBinding": "price | ceil"
}
```

**Dados:**
```json
{ "price": 99.01 }
```

**Resultado:** `100`

---

## Transformações de Data

### date:'padrão'
Formata datas usando SimpleDateFormat.

**Padrões comuns:**
- `MM/dd/yyyy` → 12/25/2025
- `MM/dd/yyyy HH:mm` → 12/25/2025 14:30
- `yyyy-MM-dd` → 2025-12-25
- `EEEE, MMMM dd, yyyy` → Thursday, December 25, 2025

**Exemplo:**
```json
{
  "dataBinding": "invoice.date | date:'MM/dd/yyyy'"
}
```

**Dados:**
```json
{ "invoice": { "date": "2025-12-25T14:30:00" } }
```

**Resultado:** `12/25/2025`

---

## Transformações de Array

### join:'separador'
Junta os elementos do array com um separador.

**Exemplo:**
```json
{
  "dataBinding": "tags | join:', '"
}
```

**Dados:**
```json
{ "tags": ["kotlin", "pdf", "java"] }
```

**Resultado:** `kotlin, pdf, java`

---

### first
Retorna o primeiro elemento do array.

**Exemplo:**
```json
{
  "dataBinding": "items | first"
}
```

---

### last
Retorna o último elemento do array.

**Exemplo:**
```json
{
  "dataBinding": "items | last"
}
```

---

### length / len
Retorna o tamanho do array ou da string.

**Exemplo:**
```json
{
  "dataBinding": "items | length"
}
```

**Dados:**
```json
{ "items": ["A", "B", "C"] }
```

**Resultado:** `3`

---

## Transformações Utilitárias

### default:'valor'
Retorna o valor padrão se o original for nulo ou vazio.

**Exemplo:**
```json
{
  "dataBinding": "notes | default:'No notes provided'"
}
```

**Dados:**
```json
{ "notes": null }
```

**Resultado:** `No notes provided`

---

### template:'padrão'
Aplica um template com espaços reservados `${propriedade}`.

**Exemplo:**
```json
{
  "dataBinding": "address | template:'${street}, ${number} - ${city}, ${state}'"
}
```

**Dados:**
```json
{
  "address": {
    "street": "Main St",
    "number": "1000",
    "city": "New York",
    "state": "NY"
  }
}
```

**Resultado:** `Main St, 1000 - New York, NY`

Com pipes aninhados:
```json
{
  "dataBinding": "address | template:'${street | upperCase}, ${number}'"
}
```

---

### concat
Concatena vários valores.

**Exemplo:**
```json
{
  "dataBinding": "customer.name | concat:' - ':customer.id"
}
```

---

## Encadeamento de Transformações

Você pode aplicar várias transformações em sequência:

**Exemplo 1: Limpar e formatar**
```json
{
  "dataBinding": "name | trim | capitalize"
}
```

**Dados:**
```json
{ "name": "  jOHN sMITH  " }
```

**Resultado:** `John Smith`

---

**Exemplo 2: Formatar moeda**
```json
{
  "dataBinding": "price | round:2 | currency:'USD'"
}
```

**Dados:**
```json
{ "price": 1234.5678 }
```

**Resultado:** `$1,234.57`

---

**Exemplo 3: Truncar e adicionar reticências**
```json
{
  "dataBinding": "description | trim | truncate:100"
}
```

---

**Exemplo 4: Formatar código com zeros à esquerda**
```json
{
  "dataBinding": "order | padLeft:8:'0' | prefix:'#'"
}
```

**Dados:**
```json
{ "order": "1234" }
```

**Resultado:** `#00001234`

---

## Casos de Uso Práticos

### Fatura

```json
{
  "elements": [
    {
      "type": "text",
      "dataBinding": "invoice.number | padLeft:10:'0'",
      "value": "Invoice # {{invoice.number | padLeft:10:'0'}}"
    },
    {
      "type": "text",
      "dataBinding": "invoice.date | date:'MM/dd/yyyy HH:mm'"
    },
    {
      "type": "text",
      "dataBinding": "invoice.total | currency:'USD'"
    }
  ]
}
```

### Relatório com Descrições

```json
{
  "type": "text",
  "dataBinding": "product.description | truncate:200 | capitalize"
}
```

### Formatação de Telefone

```json
{
  "type": "text",
  "dataBinding": "contact | template:'(${areaCode}) ${number}'"
}
```

**Dados:**
```json
{
  "contact": {
    "areaCode": "212",
    "number": "555-1234"
  }
}
```

**Resultado:** `(212) 555-1234`

---

## Desempenho

::: tip Dica de Desempenho
- As transformações são armazenadas em cache por expressão
- Evite pipes complexos dentro de loops grandes
- Prefira pré-processar os dados quando possível
:::

---

## Próximos Passos

- [Condições](/pt/lib/guide/conditions) - Renderização condicional
- [Elementos](/pt/lib/guide/elements/text) - Tipos de elementos disponíveis
- [Exemplos](/pt/lib/examples/) - Veja as transformações em ação
