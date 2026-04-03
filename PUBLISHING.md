# NIMGEN - Guia de Publicação

Este guia contém todos os passos necessários para publicar o NIMGEN.

## ✅ Checklist Pré-Publicação

- [x] Build TypeScript compilado (`dist/`)
- [x] package.json configurado corretamente
- [x] .gitignore configurado (sem ignorar `dist/`)
- [x] .npmignore configurado
- [x] LICENSE (Apache-2.0)
- [x] README.md com badges
- [x] CHANGELOG.md
- [x] CONTRIBUTING.md
- [x] CODE_OF_CONDUCT.md
- [x] SECURITY.md
- [x] GitHub issue templates
- [x] PR template
- [x] Commit inicial criado
- [x] npm audit limpo (0 vulnerabilidades)
- [x] Nome disponível no npm

## 📦 Passo 1: Criar Repositório GitHub

### Opção A: Via GitHub Web UI

1. Acesse https://github.com/new
2. Configure:
   - **Repository name**: `NIMGEN`
   - **Description**: `First MCP server for NVIDIA NIM FLUX — Generate and edit images using FLUX.1 models`
   - **Visibility**: Public
   - **NÃO inicializar** com README/gitignore/license (já temos)
3. Clique "Create repository"
4. Siga as instruções "push an existing repository"

### Opção B: Via GitHub CLI (se instalado)

```bash
gh repo create NIMGEN --public --description "First MCP server for NVIDIA NIM FLUX" --source=. --remote=origin --push
```

### Após criar o repositório:

```bash
# Adicionar remote (se não usado gh CLI)
git remote add origin https://github.com/gabriel-ferraresi/NIMGEN.git

# Push do código
git branch -M main
git push -u origin main

# Criar tag de release
git tag -a v1.0.0 -m "Release v1.0.0 - First MCP server for NVIDIA NIM FLUX"
git push origin v1.0.0
```

## 📤 Passo 2: Publicar no npm

### Pré-requisitos

Você já está autenticado: `npm whoami` retorna `gabrielferraresi` ✓

### Comandos de publicação

```bash
# Verificar o que será publicado
npm pack --dry-run

# Publicar (access=public porque é scoped ou nome simples)
npm publish --access public

# Verificar publicação
npm view nimgen
```

### Se o nome já existir (unlikely):

```bash
# Alternativa: usar scoped package
# Mudar name em package.json para: @gabrielferraresi/nimgen
npm publish --access public
```

## 🏷️ Passo 3: Criar Release no GitHub

1. Acesse https://github.com/gabriel-ferraresi/NIMGEN/releases/new
2. Selecione a tag `v1.0.0`
3. Título: `v1.0.0 - First MCP Server for NVIDIA NIM FLUX`
4. Descrição (copiar do CHANGELOG.md):
   ```markdown
   ## [1.0.0] - 2026-04-03

   ### Added
   - **First release of NIMGEN** - First MCP server for NVIDIA NIM FLUX models
   - `generate_image` tool for text-to-image generation
   - Support for FLUX.1-dev (high quality)
   - Support for FLUX.1-schnell (fast generation)
   - `edit_image` tool for image editing via FLUX.1-Kontext
   - `list_models` tool to display available FLUX models
   - Environment variable configuration
   - Self-hosted NIM support
   - Cross-platform support (Windows, Linux, macOS)
   ```
5. Marque "Set as the latest release"
6. Clique "Publish release"

## 📣 Passo 4: Divulgação

### 4.1 Awesome MCP Servers

Adicionar em: https://github.com/punkpeye/awesome-mcp-servers

Fazer PR adicionando:

```markdown
- [nimgen](https://github.com/gabriel-ferraresi/NIMGEN) - First MCP server for NVIDIA NIM FLUX image generation with support for FLUX.1-dev, FLUX.1-schnell, and FLUX.1-Kontext.
```

### 4.2 MCP Market

Submeter em: https://mcpmarket.com/submit

### 4.3 Model Context Protocol Discord

Compartilhar em: https://discord.gg/modelcontextprotocol

### 4.4 Reddit

Postar em:
- r/LocalLLaMA
- r/MachineLearning
- r/artificial

### 4.5 Twitter/X

Tweet template:

```
🎨 Excited to announce NIMGEN - the FIRST MCP server for NVIDIA NIM FLUX!

✅ Use your existing NVIDIA API key
✅ FLUX.1-dev, FLUX.1-schnell, FLUX.1-Kontext
✅ Works with Claude, Cursor, OpenCode

npm install -g nimgen

#MCP #NVIDIA #FLUX #AI
```

## 🔄 Atualizações Futuras

### Patch (1.0.1, 1.0.2)
```bash
npm version patch
git push --follow-tags
npm publish
```

### Minor (1.1.0)
```bash
npm version minor
git push --follow-tags
npm publish
```

### Major (2.0.0)
```bash
npm version major
git push --follow-tags
npm publish
```

## 📊 Badges para README

Após publicação, estes badges funcionarão:

```markdown
[![npm version](https://img.shields.io/npm/v/nimgen?color=blue&label=npm)](https://www.npmjs.com/package/nimgen)
[![GitHub stars](https://img.shields.io/github/stars/gabriel-ferraresi/NIMGEN?style=social)](https://github.com/gabriel-ferraresi/NIMGEN)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/gabriel-ferraresi/NIMGEN/blob/main/LICENSE)
```

## ✅ Validação Final

Após publicação, verificar:

```bash
# npm
npm view nimgen
npm info nimgen

# GitHub
gh repo view gabriel-ferraresi/NIMGEN

# Teste de instalação
npx nimgen --help
```

---

**Status atual**: Pronto para publicação ✅

**Próximo passo**: Criar repositório GitHub → Push → npm publish
