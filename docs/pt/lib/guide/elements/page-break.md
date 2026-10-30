# Elemento Page Break

O `PageBreakElement` força o motor de renderização do PDF a encerrar imediatamente a página atual e continuar renderizando os elementos seguintes em uma página nova.

## Funcionalidades

- ✅ **Divisão de página explícita**: Separação limpa entre seções de múltiplas páginas.
- ✅ **Quebra condicional**: Suporta `printCondition` para disparar quebras de página apenas quando condições específicas dos dados forem atendidas.
- ✅ **Suporte a fluxo dinâmico**: Integra-se perfeitamente com loops, tabelas e elementos de fluxo automático.

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"page_break"` |
| `id` | string | ✅ | Identificador único do elemento |
| `x` | number | ❌ | Posição X (padrão: `0`) |
| `y` | number | ❌ | Posição Y (padrão: `0`) |
| `positionMode` | string | ❌ | Normalmente `"relative"` (padrão), para quebrar após os elementos precedentes |
| `relativeOffsetY` | number | ❌ | Espaçamento extra antes da quebra |
| `printCondition` | string | ❌ | Expressão booleana que decide se a quebra é disparada |

---

## Exemplo Básico

```json
{
  "type": "page_break",
  "id": "break-section-2",
  "positionMode": "relative"
}
```

---

## Exemplo de Quebra de Página Condicional

Quebre para uma nova página apenas se a fatura tiver mais de 5 itens ou se os termos e condições forem solicitados:

```json
{
  "type": "page_break",
  "id": "conditional-terms-break",
  "positionMode": "relative",
  "printCondition": "items.length > 5 || showTerms == true"
}
```
