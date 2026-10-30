# Grupos de Elementos

Os Grupos de Elementos (`groups`) permitem reunir vários elementos do template sob um identificador de grupo comum e controlar a impressão de todos eles ao mesmo tempo com um único `printCondition`.

## Recursos

- ✅ **Visibilidade Unificada**: Controle vários elementos com um único `printCondition`.
- ✅ **Consciente de Seções**: Grupos podem ser definidos no corpo do template, no cabeçalho, no rodapé, no background ou na página de resumo.
- ✅ **Integração com o Editor Visual**: Crie, nomeie, inspecione e desagrupe elementos pelo menu de contexto do botão direito ou pelo painel de camadas do Editor.

---

## Propriedades do Grupo

Cada objeto de grupo dentro de `template.groups` (ou grupos de seção) contém:

| Propriedade | Tipo | Obrigatório | Descrição |
|----------|------|----------|-------------|
| `id` | string | ✅ | Identificador único do grupo (ex.: `"group-1"`) |
| `name` | string | ❌ | Nome de exibição amigável (ex.: `"Tax Total Block"`) |
| `elementIds` | string[] | ✅ | Array de IDs de elementos pertencentes a este grupo |
| `printCondition` | string | ❌ | Expressão booleana avaliada para todos os elementos do grupo |

---

## Exemplo: Grupo Condicional

```json
{
  "version": "1.0",
  "groups": [
    {
      "id": "discount-group",
      "name": "Discount Section",
      "printCondition": "order.discount > 0",
      "elementIds": ["discount-label", "discount-value", "discount-badge"]
    }
  ],
  "page": [
    { "type": "text", "id": "discount-label", "x": 350, "y": 400, "text": "Discount Applied:" },
    { "type": "text", "id": "discount-value", "x": 480, "y": 400, "text": "-{{order.discount | currency:'USD'}}" },
    { "type": "rectangle", "id": "discount-badge", "x": 340, "y": 395, "width": 200, "height": 24 }
  ]
}
```

Se `order.discount > 0` for falso, nenhum dos 3 elementos do grupo será renderizado no PDF gerado.
