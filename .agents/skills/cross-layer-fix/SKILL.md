---
name: cross-layer-fix
description: Procedimento estruturado para investigar, corrigir e validar bugs que afetam múltiplas camadas (core, cli, editor e docs) no Open PDF Generator.
---

# Workflow: Correção Transversal (Fix)

Utilize este workflow para correções de bugs ou melhorias que impactam motor, CLI ou editor.

## 1. Diagnóstico e Reprodução
- Identificar a camada raiz do problema (Engine Kotlin, CLI ou Editor React).
- Isolar o caso com um JSON template mínimo de reprodução.
- Confirmar se o erro ocorre na compilação do PDF pelo Core ou na interface do Editor.

## 2. Implementação do Fix
- **Core (`core/`):**
  - Ajustar lógica em `com.pdfgenerator...`.
  - Preservar integridade dos contratos e interfaces existentes.
- **CLI (`tools/cli/`):**
  - Garantir sincronia caso parâmetros ou flags tenham sido alterados.
- **Editor (`tools/editor/`):**
  - Respeitar padrões de Atomic Design e tokens de [DESIGN_SYSTEM_SPEC.md](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/DESIGN_SYSTEM_SPEC.md).
  - Nunca quebrar o layout das réguas, bandas ou inspetor de propriedades.

## 3. Teste de Regressão
- Adicionar teste unitário em `core/src/test/kotlin/...` cobrindo o caso do bug para evitar regressões futuras.

## 4. Atualização de Documentação
- Atualizar `CHANGELOG.md` ou notas técnicas em `docs/` caso haja alteração de comportamento ou depreciação de propriedades.

## 5. Validação
- Executar validação automatizada:
  ```bash
  .agents/skills/scripts/verify-all.sh
  ```
