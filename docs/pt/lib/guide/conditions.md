# Condições

A biblioteca suporta renderização condicional de elementos por meio de duas abordagens:
- **`printCondition`**: Propriedade em qualquer elemento
- **`ConditionalElement`**: Elemento dedicado para agrupar condições

---

## printCondition

A propriedade `printCondition` pode ser adicionada a qualquer elemento para controlar sua renderização.

### Sintaxe Básica

```json
{
  "type": "text",
  "id": "my-text",
  "value": "This text is conditional",
  "printCondition": "total > 1000"
}
```

Se a condição for `true`, o elemento é renderizado. Caso contrário, ele é ignorado.

---

## Operadores Suportados

### Comparação

| Operador | Descrição | Exemplo |
|----------|-------------|---------|
| `==` | Igual | `status == 'approved'` |
| `!=` | Diferente | `type != 'cancelled'` |
| `>` | Maior que | `total > 1000` |
| `<` | Menor que | `quantity < 10` |
| `>=` | Maior ou igual | `age >= 18` |
| `<=` | Menor ou igual | `stock <= 5` |

### Inclusão

| Operador | Descrição | Exemplo |
|----------|-------------|---------|
| `in` | Contido em lista | `status in ['active', 'pending', 'approved']` |

### Lógicos

| Operador | Descrição | Exemplo |
|----------|-------------|---------|
| `&&` | E lógico | `total > 1000 && status == 'approved'` |
| `\|\|` | OU lógico | `type == 'A' \|\| type == 'B'` |

---

## Exemplos por Tipo

### Comparação Numérica

Mostrar alerta apenas se o estoque estiver baixo:

```json
{
  "type": "text",
  "id": "stock-alert",
  "value": "⚠️ Low stock!",
  "style": { "color": "#ff0000" },
  "printCondition": "product.stock < 10"
}
```

**Dados:**
```json
{
  "product": {
    "name": "Notebook",
    "stock": 5
  }
}
```

**Resultado:** O texto é exibido (5 < 10)

---

### Comparação de Texto

Mostrar selo apenas para clientes VIP:

```json
{
  "type": "rectangle",
  "id": "vip-badge",
  "x": 400,
  "y": 50,
  "width": 60,
  "height": 25,
  "style": {
    "fillColor": "#FFD700",
    "strokeColor": "#FFA500"
  },
  "printCondition": "customer.type == 'VIP'"
}
```

**Dados:**
```json
{
  "customer": {
    "name": "John Smith",
    "type": "VIP"
  }
}
```

**Resultado:** O retângulo é exibido

---

### Verificação Booleana

Mostrar o logotipo apenas se a configuração permitir:

```json
{
  "type": "image",
  "id": "logo",
  "source": "https://example.com/logo.png",
  "printCondition": "config.showLogo"
}
```

**Dados:**
```json
{
  "config": {
    "showLogo": true
  }
}
```

Ou com comparação explícita:

```json
{
  "printCondition": "document.confidential == true"
}
```

---

### Verificação de Array/Lista

Mostrar a tabela apenas se houver itens:

```json
{
  "type": "table",
  "id": "products-table",
  "printCondition": "order.items.length > 0"
}
```

**Dados:**
```json
{
  "order": {
    "items": [
      { "name": "Product A", "price": 100 },
      { "name": "Product B", "price": 200 }
    ]
  }
}
```

**Resultado:** A tabela é exibida (2 > 0)

::: tip Dica
Use `length` ou `size` para obter o tamanho de arrays/listas.
:::

---

### Operador IN

Mostrar o status apenas para situações específicas:

```json
{
  "type": "text",
  "id": "pending-status",
  "value": "⏳ Awaiting approval",
  "printCondition": "payment.status in ['pending', 'processing', 'under_review']"
}
```

**Dados:**
```json
{
  "payment": {
    "status": "pending"
  }
}
```

**Resultado:** O texto é exibido

---

### Operadores Lógicos

#### E lógico (&&)

Mostrar desconto apenas se for VIP **E** total > 1000:

```json
{
  "type": "text",
  "id": "vip-discount",
  "value": "🎁 Special 10% discount",
  "printCondition": "customer.type == 'VIP' && order.total > 1000"
}
```

#### OU lógico (||)

Mostrar alerta para os tipos A ou B:

```json
{
  "type": "text",
  "id": "type-alert",
  "value": "⚠️ Special attention required",
  "printCondition": "product.type == 'A' || product.type == 'B'"
}
```

---

### Propriedades Aninhadas

Acesso a propriedades em níveis mais profundos:

```json
{
  "type": "text",
  "value": "Free shipping!",
  "printCondition": "order.address.state == 'CA'"
}
```

**Dados:**
```json
{
  "order": {
    "address": {
      "state": "CA",
      "city": "Los Angeles"
    }
  }
}
```

---

### Acesso a Índices de Array

```json
{
  "type": "text",
  "value": "First item is special",
  "printCondition": "items.0.type == 'special'"
}
```

**Dados:**
```json
{
  "items": [
    { "type": "special", "name": "Item A" },
    { "type": "normal", "name": "Item B" }
  ]
}
```

---

### Variáveis de Sistema em Condições

Você pode usar variáveis de sistema como `_pageNumber` nas condições:

#### Mostrar elemento apenas na primeira página:

```json
{
  "type": "text",
  "value": "Welcome message (first page only)",
  "printCondition": "_pageNumber == 1"
}
```

#### Mostrar elemento a partir da página 2:

```json
{
  "type": "text",
  "value": "Continued from previous page...",
  "printCondition": "_pageNumber > 1"
}
```

#### Cabeçalho/Rodapé com condições de página:

```json
{
  "header": {
    "height": 60,
    "printCondition": "_pageNumber > 1",
    "elements": [...]
  }
}
```

**Variáveis de Sistema Disponíveis:**

| Variável | Descrição |
|----------|-------------|
| `_pageNumber` | Número da página atual (1, 2, 3...) |
| `_date` | Data atual (YYYY-MM-DD) |
| `_dateTime` | Data e hora atuais |

---

## Elemento Condicional

Use `ConditionalElement` para agrupar vários elementos sob uma mesma condição:

```json
{
  "type": "conditional",
  "id": "vip-section",
  "condition": "customer.type == 'VIP'",
  "elements": [
    {
      "type": "rectangle",
      "id": "vip-bg",
      "x": 50,
      "y": 100,
      "width": 500,
      "height": 80,
      "style": { "fillColor": "#FFD700" }
    },
    {
      "type": "text",
      "id": "vip-title",
      "x": 60,
      "y": 120,
      "value": "🌟 VIP CUSTOMER 🌟",
      "style": { "fontSize": 18, "fontWeight": "bold" }
    },
    {
      "type": "text",
      "id": "vip-benefit",
      "x": 60,
      "y": 150,
      "value": "You have 15% discount on all products"
    }
  ]
}
```

**Vantagens:**
- ✅ Agrupa elementos relacionados
- ✅ Uma única condição controla vários elementos
- ✅ Mais eficiente do que múltiplos `printCondition`

---

## Casos de Uso Práticos

### Fatura

```json
{
  "elements": [
    {
      "type": "text",
      "value": "🏷️ Discount applied: {{discount | currency:'USD'}}",
      "printCondition": "discount > 0"
    },
    {
      "type": "text",
      "value": "📦 Free shipping!",
      "style": { "color": "#00aa00" },
      "printCondition": "shipping == 0"
    },
    {
      "type": "text",
      "value": "⚠️ Payment pending",
      "style": { "color": "#ff0000" },
      "printCondition": "status != 'paid'"
    }
  ]
}
```

---

### Relatório com Alertas

```json
{
  "elements": [
    {
      "type": "rectangle",
      "style": { "fillColor": "#ffcccc" },
      "printCondition": "sales < goal"
    },
    {
      "type": "text",
      "value": "🚨 GOAL NOT ACHIEVED",
      "style": { "color": "#aa0000", "fontWeight": "bold" },
      "printCondition": "sales < goal"
    },
    {
      "type": "rectangle",
      "style": { "fillColor": "#ccffcc" },
      "printCondition": "sales >= goal"
    },
    {
      "type": "text",
      "value": "✅ GOAL ACHIEVED",
      "style": { "color": "#00aa00", "fontWeight": "bold" },
      "printCondition": "sales >= goal"
    }
  ]
}
```

---

### Seção Condicional Completa

```json
{
  "type": "conditional",
  "id": "taxes-section",
  "condition": "taxes.length > 0",
  "elements": [
    {
      "type": "text",
      "value": "APPLICABLE TAXES",
      "style": { "fontSize": 14, "fontWeight": "bold" }
    },
    {
      "type": "table",
      "id": "taxes-table",
      "dataBinding": "taxes",
      "columns": [
        { "header": "Type", "dataBinding": "$item.type" },
        { "header": "Tax Base", "dataBinding": "$item.base | currency:'USD'" },
        { "header": "Rate", "dataBinding": "$item.rate | suffix:'%'" },
        { "header": "Amount", "dataBinding": "$item.amount | currency:'USD'" }
      ]
    }
  ]
}
```

---

## Condições vs Transformações

Não confunda condições com transformações!

**❌ Errado:**
```json
{
  "dataBinding": "name | if:status=='active'"
}
```

**✅ Correto:**
```json
{
  "dataBinding": "name",
  "printCondition": "status == 'active'"
}
```

::: tip Dica
- **Transformações** (`|`) modificam valores
- **Condições** (`printCondition`) controlam a renderização
:::

---

## Comportamento em Caso de Erro

Se a avaliação da condição falhar (campo inexistente, erro de sintaxe etc.), o elemento **É RENDERIZADO** por padrão, para evitar perda de informação.

Para um comportamento mais rigoroso, valide seus templates antes de usar em produção.

---

## Desempenho

::: tip Otimização
- As condições são avaliadas apenas uma vez por elemento
- Use `ConditionalElement` para agrupar elementos (mais eficiente)
- Evite condições complexas com muitos `&&` ou `||`
- Prefira condições simples e diretas
:::

---

## Próximos Passos

- [Transformações](/pt/lib/guide/transformations) - Modificar valores
- [Elementos Condicionais](/pt/lib/guide/elements/conditional) - Detalhes do ConditionalElement
- [Loops](/pt/lib/guide/elements/loop) - Combinar loops com condições
- [Exemplos](/pt/lib/examples/) - Veja as condições em ação
