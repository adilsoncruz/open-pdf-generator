---
name: design-system-audit
description: Auditoria de conformidade de UI/UX no editor contra DESIGN_SYSTEM_SPEC.md e atomic-design.mdc (tokens de cor Slate/Electric Indigo, hierarquia de componentes e uso de ícones).
---

# Workflow: Auditoria do Design System

Utilize este workflow sempre que criar, alterar ou refatorar componentes visuais no editor (`tools/editor`).

## 1. Regras de Arquitetura (Atomic Design)
Consulte [atomic-design.mdc](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/tools/editor/.agent/atomic-design.mdc):
- **Atoms (`components/atoms/`):** Botões, inputs, labels, divisores puros sem dependências de negócio ou estado global.
- **Molecules (`components/molecules/`):** Combinações simples (ex: `FormField`, `ColorField`, `IconButton`).
- **Organisms (`components/organisms/`):** Blocos complexos e auto-contidos (ex: `Modal`, `PropertiesPanel`).
- **Pages / Templates:** Montagem de layout e orquestração de stores.

## 2. Cores e Tokens Oficiais ([DESIGN_SYSTEM_SPEC.md](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/DESIGN_SYSTEM_SPEC.md))
- Canvas de edição: `#0B0F19` (Slate profundo)
- Superfícies/Painéis: `#111827` (Slate 900)
- Bordas estruturais: `#1F2937` (Slate 800)
- Hover / Seleção secundária: `#374151` (Slate 700)
- Destaque primário e Bounding Box: `#6366F1` (Electric Indigo)
- Linhas guia magnéticas: `#06B6D4` (Cyan)

## 3. Ícones e Tipografia
- Usar ícones da biblioteca `lucide-react` padronizados com tamanho `size={16}` ou `size={18}` em toolbars e botões de propriedades.
- Fontes: `font-sans` (`Outfit`) para títulos e labels; `font-mono` (`JetBrains Mono`) para coordenadas, dimensões e expressões.

## 4. Checklist de Auditoria
- [ ] Não há estilos hardcoded fora da escala de cores Slate/Indigo.
- [ ] Elementos novos possuem hover states e focus rings visíveis.
- [ ] Controles numéricos suportam unidades (mm / px).
- [ ] Build e checagem de tipos passam sem erros:
  ```bash
  cd tools/editor && npm run build
  ```
