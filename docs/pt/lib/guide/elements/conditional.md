# Elemento Conditional

O `ConditionalElement` permite agrupar múltiplos elementos sob uma única condição, renderizando-os apenas quando a condição for satisfeita.

## Quando Usar

Use o `ConditionalElement` quando:
- ✅ Vários elementos compartilham a mesma condição
- ✅ Você quer agrupar logicamente elementos relacionados
- ✅ Precisa de melhor performance (uma condição em vez de muitas)

Use `printCondition` quando:
- ✅ Apenas um elemento precisa de condição
- ✅ As condições são diferentes para cada elemento

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"conditional"` |
| `id` | string | ✅ | Identificador único |
| `condition` | string | ✅ | Expressão booleana |
| `elements` | array | ✅ | Lista de elementos filhos |
| `x` | number | ❌ | Posição X (padrão: 0) |
| `y` | number | ❌ | Posição Y (padrão: 0) |

---

## Exemplo Básico

```json
{
  "type": "conditional",
  "id": "discount-section",
  "condition": "discount > 0",
  "elements": [
    {
      "type": "text",
      "id": "discount-title",
      "x": 50,
      "y": 200,
      "value": "💰 DISCOUNT APPLIED",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold",
        "color": "#00aa00"
      }
    },
    {
      "type": "text",
      "id": "discount-value",
      "x": 50,
      "y": 220,
      "dataBinding": "discount | currency:'BRL'",
      "style": {
        "fontSize": 12,
        "color": "#00aa00"
      }
    }
  ]
}
```

**Dados:**
```json
{
  "discount": 150.00
}
```

**Resultado:** Ambos os textos são renderizados porque `discount > 0`.

---

## Exemplo: Cliente VIP

Renderize uma seção especial apenas para clientes VIP:

```json
{
  "type": "conditional",
  "id": "vip-benefits",
  "condition": "customer.type == 'VIP'",
  "elements": [
    {
      "type": "rectangle",
      "id": "vip-bg",
      "x": 50,
      "y": 100,
      "width": 500,
      "height": 120,
      "style": {
        "fillColor": "#fff3cd",
        "strokeColor": "#ffc107",
        "strokeWidth": 2
      }
    },
    {
      "type": "text",
      "id": "vip-title",
      "x": 70,
      "y": 125,
      "value": "🌟 VIP CUSTOMER 🌟",
      "style": {
        "fontSize": 18,
        "fontWeight": "bold",
        "color": "#856404"
      }
    },
    {
      "type": "text",
      "id": "benefit-1",
      "x": 70,
      "y": 155,
      "value": "✓ 15% discount on all products",
      "style": {
        "fontSize": 12,
        "color": "#856404"
      }
    },
    {
      "type": "text",
      "id": "benefit-2",
      "x": 70,
      "y": 175,
      "value": "✓ Free shipping nationwide",
      "style": {
        "fontSize": 12,
        "color": "#856404"
      }
    },
    {
      "type": "text",
      "id": "benefit-3",
      "x": 70,
      "y": 195,
      "value": "✓ Priority customer service",
      "style": {
        "fontSize": 12,
        "color": "#856404"
      }
    }
  ]
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

---

## Exemplo: Tabela de Impostos

Exiba a seção de impostos apenas se houver impostos:

```json
{
  "type": "conditional",
  "id": "taxes-section",
  "condition": "taxes.length > 0",
  "elements": [
    {
      "type": "text",
      "id": "taxes-title",
      "x": 50,
      "y": 400,
      "value": "APPLICABLE TAXES",
      "style": {
        "fontSize": 14,
        "fontWeight": "bold"
      }
    },
    {
      "type": "line",
      "id": "taxes-line",
      "x1": 50,
      "y1": 420,
      "width": 550,
      "height": 420,
      "style": {
        "strokeColor": "#000000",
        "strokeWidth": 1
      }
    },
    {
      "type": "table",
      "id": "taxes-table",
      "x": 50,
      "y": 430,
      "dataBinding": "taxes",
      "columns": [
        {
          "header": "Type",
          "dataBinding": "$item.type",
          "width": 100
        },
        {
          "header": "Base",
          "dataBinding": "$item.base | currency:'BRL'",
          "width": 120
        },
        {
          "header": "Rate",
          "dataBinding": "$item.rate | suffix:'%'",
          "width": 80
        },
        {
          "header": "Amount",
          "dataBinding": "$item.amount | currency:'BRL'",
          "width": 120
        }
      ]
    }
  ]
}
```

**Dados com impostos:**
```json
{
  "taxes": [
    { "type": "VAT", "base": 1000.00, "rate": 18, "amount": 180.00 },
    { "type": "PIS", "base": 1000.00, "rate": 1.65, "amount": 16.50 },
    { "type": "COFINS", "base": 1000.00, "rate": 7.6, "amount": 76.00 }
  ]
}
```

**Resultado:** Toda a seção de impostos (título, linha e tabela) é renderizada.

**Dados sem impostos:**
```json
{
  "taxes": []
}
```

**Resultado:** Nada é renderizado (a seção inteira é omitida).

---

## Condições Complexas

### Operador AND (&&)

```json
{
  "type": "conditional",
  "id": "special-discount",
  "condition": "customer.type == 'VIP' && order.total > 1000",
  "elements": [
    {
      "type": "text",
      "value": "🎁 You won a special gift!"
    }
  ]
}
```

### Operador OR (||)

```json
{
  "type": "conditional",
  "id": "urgent-alert",
  "condition": "priority == 'high' || priority == 'urgent'",
  "elements": [
    {
      "type": "rectangle",
      "style": { "fillColor": "#ff0000" }
    },
    {
      "type": "text",
      "value": "⚠️ URGENT ATTENTION",
      "style": { "color": "#ffffff", "fontWeight": "bold" }
    }
  ]
}
```

### Operador IN

```json
{
  "type": "conditional",
  "id": "positive-status",
  "condition": "status in ['approved', 'confirmed', 'completed']",
  "elements": [
    {
      "type": "text",
      "value": "✅ Order completed successfully",
      "style": { "color": "#00aa00" }
    }
  ]
}
```

---

## Aninhamento

Você pode aninhar `ConditionalElement` dentro de outros:

```json
{
  "type": "conditional",
  "id": "level-1",
  "condition": "user.active == true",
  "elements": [
    {
      "type": "text",
      "value": "Active user"
    },
    {
      "type": "conditional",
      "id": "level-2",
      "condition": "user.type == 'admin'",
      "elements": [
        {
          "type": "text",
          "value": "👑 ADMINISTRATOR",
          "style": { "fontWeight": "bold", "color": "#ff0000" }
        }
      ]
    }
  ]
}
```

::: warning Atenção
Evite aninhamentos muito profundos, pois podem dificultar a manutenção do template.
:::

---

## Dentro de Loops

O `ConditionalElement` funciona perfeitamente dentro de loops:

```json
{
  "type": "loop",
  "id": "products-loop",
  "dataBinding": "products",
  "elements": [
    {
      "type": "conditional",
      "id": "stock-alert",
      "condition": "$item.stock < 10",
      "elements": [
        {
          "type": "text",
          "dataBinding": "$item.name | suffix:' - ⚠️ LOW STOCK'",
          "style": { "color": "#ff0000" }
        }
      ]
    }
  ]
}
```

---

## Performance

**Por que usar `ConditionalElement` em vez de vários `printCondition`?**

### ❌ Menos eficiente:
```json
{
  "elements": [
    {
      "type": "rectangle",
      "printCondition": "customer.type == 'VIP'"
    },
    {
      "type": "text",
      "printCondition": "customer.type == 'VIP'"
    },
    {
      "type": "text",
      "printCondition": "customer.type == 'VIP'"
    }
  ]
}
```

**Problema:** A condição é avaliada 3 vezes.

### ✅ Mais eficiente:
```json
{
  "elements": [
    {
      "type": "conditional",
      "condition": "customer.type == 'VIP'",
      "elements": [
        { "type": "rectangle" },
        { "type": "text" },
        { "type": "text" }
      ]
    }
  ]
}
```

**Vantagem:** A condição é avaliada apenas uma vez.

---

## Tratamento de Erros

Se a avaliação da condição falhar:
- ⚠️ O elemento e seus filhos **SÃO RENDERIZADOS** por padrão
- 💡 Isso evita perda de informação em produção
- 🔍 Valide os templates antes de usar em produção

---

## Validação

O elemento valida automaticamente:
- ✅ `condition` não pode ser vazia
- ✅ `elements` precisa ter pelo menos um elemento
- ✅ Os elementos filhos também são validados

---

## Próximos Passos

- [Condições](/pt/lib/guide/conditions) - Sintaxe completa das condições
- [Loop](/pt/lib/guide/elements/loop) - Combine com loops
- [printCondition](/pt/lib/guide/elements/text#condições) - Condições em elementos individuais
- [Exemplos](/pt/lib/examples/) - Veja em ação
