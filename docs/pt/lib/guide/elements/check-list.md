# Elemento Checklist (Lista de Verificação)

O `CheckListElement` renderiza listas de tarefas com caixas de seleção interativas (retangulares, arredondadas ou circulares). Pode ser vinculado dinamicamente a objetos JSON ou mapas chave/valor.

## Recursos

- ✅ **Estilos de Caixa**: `RECTANGLE` (quadrado), `BORDERED` (quadrado com cantos arredondados), `CIRCLE` (circular)
- ✅ **Mapeamento Chave/Valor**: Extrai o rótulo da chave do mapa e o estado marcado/desmarcado a partir de booleanos
- ✅ **Tarefas Estáticas**: Defina itens e seu estado inicial diretamente no template
- ✅ **Data Binding Dinâmico**: Vinculação com objetos como `tasks: { "Tarefa A": true, "Tarefa B": false }`
- ✅ **Fidelidade Visual**: Itens concluídos exibem um ícone de marcação vetorial nítido
- ✅ **Quebra Multi-página**: Suporte a quebra automática entre páginas quando a lista excede o espaço útil

---

## Propriedades

| Propriedade | Tipo | Obrigatório | Descrição |
|-------------|------|-------------|-----------|
| `type` | string | ✅ | Deve ser `"check_list"` |
| `id` | string | ✅ | Identificador único do elemento |
| `x` | number | ✅ | Posição horizontal (pt) |
| `y` | number | ✅ | Posição vertical (pt) |
| `width` | number / string | ❌ | Largura em pontos ou `"100%"` (padrão: 400) |
| `height` | number | ❌ | Altura em pontos (padrão: 50) |
| `dataBinding` | string | ❌ | Caminho para o objeto no JSON de dados (ex: `"tarefas"` ou `"auditoria.checklist"`) |
| `items` | object | ❌ | Mapa estático de rótulos para valores booleanos `{ "Item": true }` |
| `checkStyle` | string | ❌ | `"RECTANGLE"` (padrão), `"BORDERED"` ou `"CIRCLE"` |
| `itemSpacing` | number | ❌ | Espaçamento vertical entre tarefas em pontos (padrão: 0) |
| `startY` | number | ❌ | Ponto vertical inicial customizado |
| `style` | object | ❌ | Estilos de texto e caixa (`fontSize`, `fontFamily`, `color`, `backgroundColor`) |
| `printCondition` | string | ❌ | Expressão condicional para renderização |

---

## Exemplos em JSON

### Checklist Dinâmica com Dados do Payload

```json
{
  "type": "check_list",
  "id": "auditoria-checklist",
  "x": 40,
  "y": 140,
  "width": 500,
  "dataBinding": "itensAuditoria",
  "checkStyle": "BORDERED",
  "itemSpacing": 6,
  "style": {
    "fontSize": 11,
    "fontFamily": "Helvetica",
    "color": "#1e293b"
  }
}
```

**Exemplo de Payload:**
```json
{
  "itensAuditoria": {
    "Documentação conferida e aprovada": true,
    "Protocolo de segurança validado": true,
    "Assinatura final registrada": false
  }
}
```

### Checklist Estática

```json
{
  "type": "check_list",
  "id": "checklist-entrega",
  "x": 40,
  "y": 280,
  "width": 450,
  "checkStyle": "CIRCLE",
  "items": {
    "Testes unitários do Core aprovados": true,
    "Build de distribuição da CLI verificado": true,
    "Editor canvas e propriedades atualizados": true,
    "Documentação publicada": false
  },
  "itemSpacing": 4,
  "style": {
    "fontSize": 10,
    "fontFamily": "Helvetica",
    "color": "#0f172a"
  }
}
```

---

## DSL Programática em Kotlin

```kotlin
val template = TemplateBuilder()
    .addCheckList {
        id = "checklist-inspecao"
        x = 40f
        y = 120f
        width = 515f
        dataBinding = "itensInspecao"
        checkStyle = CheckStyle.CIRCLE
        itemSpacing = 5f
        style = TextStyle(fontSize = 11f, color = "#0f172a")
    }
    .build()
```
