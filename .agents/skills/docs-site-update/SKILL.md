---
name: docs-site-update
description: Procedimento para atualizar o site de documentação VitePress em docs/ refletindo mudanças de API da biblioteca Core, comandos da CLI ou recursos do Editor Desktop.
---

# Workflow: Atualização do Site de Documentação

Utilize este workflow sempre que adicionar novos elementos, modificar parâmetros de schema JSON ou alterar recursos da interface.

## 1. Estrutura da Documentação (`docs/`)
- **Biblioteca Core:** [docs/lib/](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/docs/lib) (`guide/`, `api/`, `examples/`).
- **CLI:** [docs/cli/](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/docs/cli) (`commands.md`, `examples.md`, `installation.md`).
- **Editor Desktop:** [docs/editor/](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/docs/editor) (`index.md`, atalhos e interface).

## 2. Iniciar Servidor de Desenvolvimento Local
Para validar a documentação visualmente em tempo real:
```bash
make docs-dev
```
Acesse o endereço exibido no terminal (geralmente `http://localhost:5173`).

## 3. Diretrizes de Escrita
- Fornecer blocos de código com destaque de sintaxe (`json`, `kotlin`, `bash`).
- Incluir exemplos de payload válidos e visualmente representativos.
- Manter o sumário e menus de navegação atualizados no config do VitePress.

## 4. Validação de Build
Garantir que não há links quebrados nem erros de compilação:
```bash
make docs-build
```
