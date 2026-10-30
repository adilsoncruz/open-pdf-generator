# Página de Resumo

A configuração `summaryPage` permite gerar uma página de encerramento ou resumo dedicada, anexada ao final do documento.

## Recursos

- ✅ **Página Final Dedicada**: Perfeita para totais de encerramento, assinaturas, termos de uso ou trilhas de auditoria.
- ✅ **Elementos e Grupos Separados**: Definidos de forma independente das páginas padrão do corpo.
- ✅ **Segundo Plano Dedicado**: Suporta um contêiner/formas `background` personalizado especificamente para a página de resumo.
- ✅ **Geração Condicional**: Renderizada apenas quando `printCondition` avalia como `true`.

---

## Propriedades de Configuração

Definidas no nível raiz do template (`template.summaryPage`):

| Propriedade | Tipo | Obrigatório | Descrição |
|----------|------|----------|-------------|
| `elements` | array | ✅ | Lista de elementos a renderizar na página de resumo |
| `groups` | array | ❌ | Lista de grupos de elementos definidos na página de resumo |
| `background` | object | ❌ | Configurações `BodyBackground` dedicadas para esta página |
| `printCondition` | string | ❌ | Expressão booleana para decidir se a página de resumo é anexada |

---

## Exemplo: Assinaturas e Resumo de Encerramento

```json
{
  "version": "1.0",
  "pageSettings": {
    "size": "A4",
    "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 }
  },
  "page": [
    {
      "type": "text",
      "id": "intro",
      "x": 36,
      "y": 50,
      "text": "Contract Body..."
    }
  ],
  "summaryPage": {
    "printCondition": "requireSignatures == true",
    "elements": [
      {
        "type": "text",
        "id": "summary-title",
        "x": 36,
        "y": 60,
        "text": "Terms and Signatures",
        "font": { "size": 18, "style": "bold" }
      },
      {
        "type": "line",
        "id": "sig-line-1",
        "x1": 36,
        "y1": 300,
        "x2": 250,
        "y2": 300
      },
      {
        "type": "text",
        "id": "sig-label-1",
        "x": 36,
        "y": 310,
        "text": "Contractor Signature"
      }
    ]
  }
}
```
