# Elemento Loop

O `LoopElement` permite repetir um conjunto de elementos para cada item de um array, facilitando a geração de listas e tabelas dinâmicas.

## Quando Usar

Use o `LoopElement` para:
- ✅ Renderizar listas de itens
- ✅ Criar layouts personalizados (alternativa às tabelas)
- ✅ Repetir grupos de elementos com dados diferentes
- ✅ Montar relatórios com seções repetitivas

::: tip Dica
Para dados tabulares simples, use o [`TableElement`](/pt/lib/guide/elements/table). Para layouts mais complexos, use o `LoopElement`.
:::

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"loop"` |
| `id` | string | ✅ | Identificador único |
| `dataBinding` | string | ✅ | Caminho para o array |
| `elements` | array | ✅ | Elementos a repetir |
| `x` | number | ❌ | Posição X inicial |
| `y` | number | ❌ | Posição Y inicial |
| `width` | number | ❌ | Largura do container (para `100%` nos filhos) |
| `height` | number | ❌ | Altura de cada item (para `100%` nos filhos) |
| `itemSpacing` | number | ❌ | Espaçamento vertical entre os itens (padrão: 0) |

::: tip Novo Recurso
`width` e `height` permitem que os elementos filhos usem `"100%"` para ocupar todo o espaço disponível do loop!
:::

---

## Variáveis Especiais e Data Binding

Dentro de um loop, você pode acessar as propriedades do item de duas formas:

| Forma | Exemplo | Descrição |
|-------|---------|-----------|
| Direta | `name` | Acesso direto à propriedade (recomendado) |
| Com prefixo | `$item.name` | Acesso explícito ao item |
| Índice | `$index` | Índice do item (começa em 0) |

::: tip Recomendação
Use o acesso **direto** às propriedades (sem `$item.`), como nas colunas de tabela. É mais simples e limpo!
:::

---

## Exemplo Básico

```json
{
  "type": "loop",
  "id": "product-list",
  "dataBinding": "products",
  "ySpacing": 25,
  "elements": [
    {
      "type": "text",
      "id": "product-name",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "product-price",
      "x": 300,
      "y": 0,
      "dataBinding": "$item.price | currency:'BRL'",
      "style": {
        "fontSize": 12
      }
    }
  ]
}
```

**Dados:**
```json
{
  "products": [
    { "name": "Notebook", "price": 3500.00 },
    { "name": "Mouse", "price": 50.00 },
    { "name": "Keyboard", "price": 150.00 }
  ]
}
```

**Resultado:**
```
Notebook                              R$ 3,500.00
Mouse                                 R$ 50.00
Keyboard                              R$ 150.00
```

---

## Exemplo com Índice

Exiba a numeração dos itens:

```json
{
  "type": "loop",
  "id": "numbered-list",
  "dataBinding": "items",
  "ySpacing": 30,
  "elements": [
    {
      "type": "text",
      "id": "number",
      "x": 50,
      "y": 0,
      "dataBinding": "$index | concat:'. '",
      "style": {
        "fontSize": 12,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "description",
      "x": 80,
      "y": 0,
      "dataBinding": "$item.description",
      "style": {
        "fontSize": 12
      }
    }
  ]
}
```

**Dados:**
```json
{
  "items": [
    { "description": "Prepare documentation" },
    { "description": "Review code" },
    { "description": "Deploy" }
  ]
}
```

**Resultado:**
```
0. Prepare documentation
1. Review code
2. Deploy
```

::: tip Dica
Para o índice começar em 1, use a transformação: `$index | concat:1 | concat:'. '`
:::

---

## Exemplo com Múltiplos Elementos

Crie cards para cada produto:

```json
{
  "type": "loop",
  "id": "product-cards",
  "dataBinding": "products",
  "ySpacing": 120,
  "elements": [
    {
      "type": "rectangle",
      "id": "card-bg",
      "x": 50,
      "y": 0,
      "width": 500,
      "height": 100,
      "style": {
        "fillColor": "#f8f9fa",
        "strokeColor": "#dee2e6",
        "strokeWidth": 1
      }
    },
    {
      "type": "image",
      "id": "product-image",
      "x": 60,
      "y": 10,
      "width": 80,
      "height": 80,
      "dataBinding": "$item.image"
    },
    {
      "type": "text",
      "id": "product-name",
      "x": 160,
      "y": 20,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold"
      }
    },
    {
      "type": "text",
      "id": "product-description",
      "x": 160,
      "y": 45,
      "dataBinding": "$item.description | truncate:60",
      "style": {
        "fontSize": 10,
        "color": "#6c757d"
      }
    },
    {
      "type": "text",
      "id": "product-price",
      "x": 160,
      "y": 70,
      "dataBinding": "$item.price | currency:'BRL'",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold",
        "color": "#28a745"
      }
    }
  ]
}
```

---

## Loop com Condições

Filtre itens usando `printCondition`:

```json
{
  "type": "loop",
  "id": "in-stock-products",
  "dataBinding": "products",
  "ySpacing": 25,
  "elements": [
    {
      "type": "text",
      "id": "product-info",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "printCondition": "$item.stock > 0"
    }
  ]
}
```

::: tip Alternativa
Use o `ConditionalElement` dentro do loop:

```json
{
  "type": "loop",
  "elements": [
    {
      "type": "conditional",
      "condition": "$item.stock > 0",
      "elements": [
        { "type": "text", "dataBinding": "$item.name" }
      ]
    }
  ]
}
```
:::

---

## Loop Aninhado

Loops dentro de loops:

```json
{
  "type": "loop",
  "id": "categories",
  "dataBinding": "categories",
  "ySpacing": 100,
  "elements": [
    {
      "type": "text",
      "id": "category-name",
      "x": 50,
      "y": 0,
      "dataBinding": "$item.name",
      "style": {
        "fontSize": 16,
        "fontWeight": "bold"
      }
    },
    {
      "type": "loop",
      "id": "category-products",
      "x": 70,
      "y": 25,
      "dataBinding": "$item.products",
      "ySpacing": 20,
      "elements": [
        {
          "type": "text",
          "id": "product-name",
          "x": 0,
          "y": 0,
          "dataBinding": "$item.name"
        }
      ]
    }
  ]
}
```

**Dados:**
```json
{
  "categories": [
    {
      "name": "Electronics",
      "products": [
        { "name": "Notebook" },
        { "name": "Mouse" }
      ]
    },
    {
      "name": "Books",
      "products": [
        { "name": "Clean Code" },
        { "name": "Design Patterns" }
      ]
    }
  ]
}
```

**Resultado:**
```
Electronics
  Notebook
  Mouse

Books
  Clean Code
  Design Patterns
```

::: warning Atenção
Em loops aninhados, o `$item` se refere ao item do loop mais interno. Para acessar o item do loop externo, você precisará usar data binding direto ou reestruturar os dados.
:::

---

## Layout em Grade

Para criar layouts em grade (múltiplas colunas), calcule a posição X com base no índice:

```json
{
  "type": "loop",
  "id": "product-grid",
  "dataBinding": "products",
  "elements": [
    {
      "type": "text",
      "x": "calc($index % 3 * 180 + 50)",
      "y": "calc(floor($index / 3) * 80 + 100)",
      "dataBinding": "$item.name"
    }
  ]
}
```

::: warning Limitação Atual
O cálculo dinâmico de posição não é suportado nativamente. Para layouts em grade, você precisará:
- Pré-processar os dados no backend
- Ou usar vários loops com `slice` nos dados
:::

---

## Cores Alternadas (Linhas Zebra)

Para alternar cores entre linhas pares e ímpares:

**Template:**
```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 30,
  "elements": [
    {
      "type": "rectangle",
      "printCondition": "$index % 2 == 0",
      "style": { "fillColor": "#f8f9fa" }
    },
    {
      "type": "rectangle",
      "printCondition": "$index % 2 != 0",
      "style": { "fillColor": "#ffffff" }
    },
    {
      "type": "text",
      "dataBinding": "$item.text"
    }
  ]
}
```

::: tip Alternativa Simples
Use o `TableElement`, que já suporta linhas zebra nativamente!
:::

---

## Diferença Entre Loop e Table

| Aspecto | LoopElement | TableElement |
|---------|-------------|--------------|
| **Estrutura** | Layout livre | Tabela estruturada |
| **Colunas** | Manuais | Automáticas |
| **Paginação** | ✅ Automática | ✅ Automática |
| **Flexibilidade** | Alta | Média |
| **Complexidade** | Alta | Baixa |
| **Melhor para** | Layouts personalizados | Dados tabulares |

**Exemplo comparativo:**

### Com Loop:
```json
{
  "type": "loop",
  "dataBinding": "products",
  "elements": [
    { "type": "text", "x": 50, "dataBinding": "$item.name" },
    { "type": "text", "x": 200, "dataBinding": "$item.price" }
  ]
}
```

### Com Table:
```json
{
  "type": "table",
  "dataBinding": "products",
  "columns": [
    { "header": "Name", "dataBinding": "$item.name" },
    { "header": "Price", "dataBinding": "$item.price" }
  ]
}
```

::: tip Recomendação
- Use **Table** para dados tabulares simples
- Use **Loop** para layouts complexos ou personalizados
:::

---

## Performance

::: tip Otimização
- Evite loops muito longos (> 100 itens)
- Para grandes volumes, considere paginar os dados
- Loops aninhados multiplicam o processamento
- Use `printCondition` para filtrar itens desnecessários
:::

---

## Paginação Automática

::: tip Novidade na v1.1
O LoopElement agora suporta **paginação automática**! Quando os itens do loop excedem o espaço disponível da página, uma nova página é criada automaticamente.
:::

### Como Funciona

1. O loop calcula a altura de cada item com base nos elementos filhos
2. Verifica se o próximo item cabe na página atual
3. Se não couber, cria uma nova página e continua o loop
4. Cabeçalho e rodapé são automaticamente repetidos em cada página

### Exemplo com Muitos Itens

```json
{
  "type": "loop",
  "id": "items-list",
  "dataBinding": "items",
  "x": 50,
  "y": 100,
  "width": 500,
  "height": 50,
  "itemSpacing": 10,
  "elements": [
    {
      "type": "rectangle",
      "x": 0,
      "y": 0,
      "width": "100%",
      "height": "100%",
      "style": { "fillColor": "#f3f4f6" }
    },
    {
      "type": "text",
      "x": 10,
      "y": 15,
      "dataBinding": "name"
    }
  ]
}
```

---

## Limitações

- ❌ As posições são fixas (sem cálculo dinâmico)
- ❌ O loop aninhado não acessa diretamente o item do loop pai

---

## Casos de Uso

### Lista de Participantes

```json
{
  "type": "loop",
  "dataBinding": "participants",
  "ySpacing": 35,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.name | capitalize",
      "style": { "fontSize": 12, "fontWeight": "bold" }
    },
    {
      "type": "text",
      "y": 15,
      "dataBinding": "$item.email | lowerCase",
      "style": { "fontSize": 10, "color": "#6c757d" }
    }
  ]
}
```

### Itens da Fatura

```json
{
  "type": "loop",
  "dataBinding": "items",
  "ySpacing": 50,
  "elements": [
    {
      "type": "text",
      "dataBinding": "$item.code | padLeft:6:'0' | prefix:'#'",
      "style": { "fontFamily": "monospace" }
    },
    {
      "type": "text",
      "x": 100,
      "dataBinding": "$item.description"
    },
    {
      "type": "text",
      "x": 350,
      "dataBinding": "$item.quantity | suffix:' un.'"
    },
    {
      "type": "text",
      "x": 450,
      "dataBinding": "$item.total | currency:'BRL'",
      "style": { "fontWeight": "bold" }
    }
  ]
}
```

---

## Próximos Passos

- [TableElement](/pt/lib/guide/elements/table) - Alternativa para dados tabulares
- [Conditional](/pt/lib/guide/elements/conditional) - Combine loops com condições
- [Transformações](/pt/lib/guide/transformations) - Formatar dados nos loops
- [Exemplos](/pt/lib/examples/) - Veja os loops em ação
