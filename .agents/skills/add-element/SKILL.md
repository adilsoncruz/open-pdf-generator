---
name: add-element
description: Procedimento passo a passo para adicionar um novo elemento visual ou de layout ao Open PDF Generator, abrangendo model/renderer em core (Kotlin), parser na CLI, componente/toolbar/properties no editor (React/Electron), design system e documentação.
---

# Workflow: Adição de Novo Elemento

Siga este procedimento para implementar novos elementos no Open PDF Generator mantendo coerência arquitetural e visual entre as camadas.

## 1. Núcleo (Core - Kotlin Engine)
- **Model:** Criar a data class em `core/src/main/kotlin/com/pdfgenerator/model/<Name>Element.kt` herdando de `Element`.
- **Renderer:** Implementar o renderizador correspondente em `core/src/main/kotlin/com/pdfgenerator/adapter/openpdf/<Name>Renderer.kt` implementando a interface `Renderer<T>`.
- **Registro no Engine:** Mapear o novo renderer em `core/src/main/kotlin/com/pdfgenerator/adapter/openpdf/OpenPdfEngine.kt`.
- **Testes Unitários:** Adicionar testes em `core/src/test/kotlin/.../<Name>RendererTest.kt` validando layout e paginação.

## 2. CLI (`tools/cli`)
- **JSON Mapping:** Garantir que a deserialização Jackson/Kotlin reconheça a tag `type: "<name>"` do elemento.
- **Teste com Template:** Criar ou atualizar template de teste em `tools/cli/teste-<name>.json` e verificar geração de PDF.

## 3. Editor Desktop (`tools/editor`)
- **Atomic Design:** Seguir as diretrizes de [atomic-design.mdc](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/tools/editor/.agent/atomic-design.mdc).
- **Design System:** Seguir os tokens estipulados em [DESIGN_SYSTEM_SPEC.md](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/DESIGN_SYSTEM_SPEC.md):
  - Fundo Canvas: `#0B0F19` (Slate)
  - Superfícies/Painéis: `#111827` (Slate 900)
  - Bordas: `#1F2937` (Slate 800)
  - Destaque/Seleção: `#6366F1` (Electric Indigo)
- **Toolbar & Biblioteca:** Adicionar o botão do elemento em `tools/editor/src/renderer/components/ElementsToolbar.tsx` com o respectivo ícone do Lucide.
- **Canvas:** Implementar a renderização do elemento no [Canvas.tsx](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/tools/editor/src/renderer/components/Canvas.tsx).
- **Propriedades:** Adicionar os campos de edição específicos em [PropertiesPanel.tsx](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/tools/editor/src/renderer/components/PropertiesPanel.tsx).

## 4. Documentação
- Atualizar referência de schema e exemplos em `docs/`.
- Adicionar exemplo mínimo do template JSON na documentação técnica.

## 5. Validação
- Executar o script de validação transversal:
  ```bash
  .agents/skills/scripts/verify-all.sh
  ```
