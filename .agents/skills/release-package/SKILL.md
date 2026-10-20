---
name: release-package
description: Fluxo de empacotamento e distribuição de artefatos (JAR da biblioteca Core, CLI executável e instalador Desktop do Editor via Electron Builder).
---

# Workflow: Empacotamento e Release

Utilize este workflow para gerar os artefatos de entrega e distribuição de cada camada.

## 1. Verificação Prévia de Saúde
Garantir que todas as dependências e ferramentas locais estão operacionais:
```bash
make check
```

## 2. Artefato do Core (Biblioteca JAR)
Gera o JAR do motor em `core/build/libs/`:
```bash
make core-jar
```

## 3. Artefato da CLI (Shadow JAR Executável)
Gera o binário executável CLI em `tools/cli/build/libs/`:
```bash
make cli-build
```

## 4. Artefato do Editor Desktop (Electron)
Empacota o aplicativo para o sistema operacional atual via [electron-builder.json](file:///Users/adilsoncruz/orca/workspaces/open-pdf-generator/feature-studio-slate-design-system-2/tools/editor/electron-builder.json):
```bash
make editor-package
```
Os arquivos gerados são salvos em `tools/editor/dist/`.

## 5. Checklist de Liberação
- [ ] Versão atualizada em `Makefile` e `package.json`.
- [ ] `CHANGELOG.md` atualizado com as novas features e fixes.
- [ ] Todos os testes unitários passando (`make test`).
