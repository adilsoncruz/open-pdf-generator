---
name: data-binding-expression
description: Procedimento para adicionar ou ajustar avaliação de expressões dinâmicas (${variavel}), condicionais de impressão e repetições de loop entre Core e Editor.
---

# Workflow: Expressões e Data Binding

Utilize este workflow para implementar ou corrigir mecanismos de interpolação de dados, expressões matemáticas ou condicionais.

## 1. Arquitetura no Core (Kotlin)
- **Avaliador de Expressões:** `core/src/main/kotlin/com/pdfgenerator/util/ExpressionEvaluator.kt`.
- **Processador de Contexto:** `core/src/main/kotlin/com/pdfgenerator/util/ExpressionProcessor.kt`.
- **Condicionais (`printCondition`):** `core/src/main/kotlin/com/pdfgenerator/util/ConditionEvaluator.kt` e `ConditionalRenderer.kt`.
- **Repetições em Lista:** `core/src/main/kotlin/com/pdfgenerator/adapter/openpdf/LoopRenderer.kt`.

## 2. Padrões de Expressão Suportados
- Variáveis simples: `${cliente.nome}`, `${fatura.numero}`.
- Propriedades aninhadas e índices: `${itens[0].descricao}`.
- Cálculos e formatações: `${total * 1.1}`, `${formatCurrency(valor)}`.

## 3. Integração com o Editor
- Permitir edição de campos dinâmicos no [PropertiesPanel.tsx](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/tools/editor/src/renderer/components/PropertiesPanel.tsx).
- Garantir injeção de dados de simulação via painel [DataPanel.tsx](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/tools/editor/src/renderer/components/DataPanel.tsx).

## 4. Validação
- Executar testes unitários específicos de expressões no Core:
  ```bash
  cd core && ./gradlew test --tests "*Expression*" --tests "*Condition*"
  ```
- Testar com template JSON de merge na CLI:
  ```bash
  .agents/skills/scripts/run-template-test.sh tools/cli/teste-merge.json tools/cli/data.json tools/cli/output-merge.pdf
  ```
