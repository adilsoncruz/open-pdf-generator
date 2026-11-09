<script setup>
import { ref, onMounted } from 'vue'

const os = ref('macos')
const osName = ref('macOS')

onMounted(() => {
  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (platform.includes('win') || userAgent.includes('windows')) {
    os.value = 'windows'
    osName.value = 'Windows'
  } else if (platform.includes('linux') || userAgent.includes('linux')) {
    os.value = 'linux'
    osName.value = 'Linux'
  } else {
    os.value = 'macos'
    osName.value = 'macOS'
  }
})

const downloads = {
  macos: {
    url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/download/editor-v1.0.0/PDF.Template.Editor-1.0.0-arm64.dmg',
    label: 'Baixar para macOS',
    available: true
  },
  windows: {
    url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/download/editor-v1.0.0/PDF.Template.Editor.Setup.1.0.0.exe',
    label: 'Baixar para Windows',
    available: true
  },
  linux: {
    url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/download/editor-v1.0.0/PDF.Template.Editor-1.0.0.AppImage',
    label: 'Baixar para Linux',
    available: true
  }
}
</script>

# PDF Template Editor

Um aplicativo desktop poderoso para projetar e pré-visualizar templates de PDF com canvas visual de arrastar e soltar, data binding em tempo real e o design system **Studio Slate**.

<div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 24px 0;">
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem; font-weight: 600; color: var(--vp-c-brand-1);">v1.0.0</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">macOS · Windows · Linux</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">Studio Slate</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">Licença AGPL-3.0</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">Open Source</span>
</div>

<div style="text-align: center; margin: 32px 0;">
  <a 
    v-if="downloads[os].available"
    :href="downloads[os].url" 
    style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-3)); color: white; border-radius: 12px; font-weight: 600; font-size: 1.1rem; text-decoration: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);"
  >
    ⬇️ {{ downloads[os].label }}
  </a>
  <div v-else style="display: inline-block; padding: 16px 32px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); border-radius: 12px; font-weight: 600; font-size: 1.1rem; border: 1px solid var(--vp-c-divider);">
    {{ downloads[os].label }} - Em breve
  </div>
  
  <p style="margin-top: 16px; font-size: 0.9rem; color: var(--vp-c-text-3);">
    Versão 1.0.0 · {{ osName }} · Universal / x64
  </p>
  
  <p style="margin-top: 8px; font-size: 0.85rem; color: var(--vp-c-text-2);">
    Aplicativo desktop multiplataforma para macOS, Windows e Linux.
  </p>
  
  <p style="margin-top: 12px;">
    <a href="https://github.com/adilsoncruz/open-pdf-generator/releases" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">Todas as releases</a>
    ·
    <a href="https://github.com/adilsoncruz/open-pdf-generator" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">GitHub</a>
    ·
    <a href="https://github.com/sponsors/adilsoncruz" target="_blank" style="color: #ec4899; font-size: 0.85rem; font-weight: 500;">💖 Patrocinar</a>
    ·
    <a href="https://buymeacoffee.com/adilsoncruz" target="_blank" style="color: #f59e0b; font-size: 0.85rem; font-weight: 500;">☕ Buy Me a Coffee</a>
  </p>
</div>

## Capturas de Tela

### Workspace Studio Slate

A interface moderna e de alto contraste apresenta multi-abas, réguas de canvas interativas, seletor de seções e painel dinâmico de propriedades.

![Studio Slate Workspace](/images/editor/screenshots/main-editor.png)

### Tela Inicial & Hub de Projetos

Comece rapidamente templates do zero, retome documentos recentes ou navegue por arquivos diretamente no hub de inicialização animado.

![Home Screen](/images/editor/screenshots/home-screen.png)

### Painel de Propriedades

Ajuste com precisão dimensões de elementos, cores, fontes, bordas, data bindings, condições e parâmetros de grupo com feedback ao vivo.

![Properties Panel](/images/editor/screenshots/properties-panel.png)

### Editor de Dados de Teste & Schema

Editores de JSON e Schema integrados para testar os bindings do template com pré-visualização formatada, verificação de sintaxe em tempo real, validação de schema ao vivo contra os dados de teste ativos, inferência automática de schema e geração de dados simulados (mock) com um clique. Saiba mais no [Guia de Validação de Schema](/pt/lib/guide/schema-validation).

![Test Data Modal](/images/editor/screenshots/data-panel.png)

### Pré-visualização de PDF ao Vivo

Compilação instantânea do PDF com resolução completa de data binding, loops e quebras de página automáticas.

![Preview](/images/editor/screenshots/preview.png)

---

## Principais Recursos

- **Design Studio Slate**: Tema escuro moderno de alto contraste, além de um elegante modo claro com o logo Precision Fold.
- **Workspace Multi-Abas**: Abra, edite e compare vários templates de PDF simultaneamente com rastreamento de estado pendente (dirty-state).
- **Menu de Contexto (Clique Direito)**: Ações instantâneas nos elementos do canvas e nas camadas (Agrupar, Desagrupar, Duplicar, Excluir, Propriedades do Grupo).
- **Grupos de Elementos**: Agrupe vários elementos para compartilhar regras de visibilidade e lógica condicional (`printCondition`).
- **Contêineres & Layouts Aninhados**: Aninhe elementos filhos com altura automática e dimensionamento responsivo em porcentagem.
- **Réguas & Guias Interativas**: Réguas de precisão com guias arrastáveis e assistência de encaixe (snap-to-edge).
- **Importação de Templates JasperReports (6.x)**: Converta e abra relatórios legados `.jrxml` (JasperReports 6.x) diretamente em abas JSON pelo menu Arquivo ou Hub inicial.
- **Validação de JSON Schema & Gerador de Mock**: Inspecione os schemas dos templates e gere dados de teste realistas com um clique.
- **Suporte Multi-Idioma**: Localização completa para inglês, português (pt-BR) e espanhol (es).
- **Sem Necessidade de Nuvem**: App 100% offline, desktop, alimentado por compilação e renderização locais.

---

## Instalação

::: code-group

```bash [macOS]
# 1. Baixe o arquivo .dmg pelo botão acima
# 2. Abra a imagem de disco baixada
# 3. Arraste "PDF Template Editor" para a pasta Aplicativos
# 4. Inicie pelos Aplicativos ou pelo Spotlight
```

```bash [Windows]
# 1. Baixe o instalador .exe pelo botão acima
# 2. Execute o PDF.Template.Editor.Setup.1.0.0.exe
# 3. Siga o assistente de instalação
# 4. Inicie pelo Menu Iniciar ou pelo atalho na Área de Trabalho
```

```bash [Linux]
# Opção A: AppImage (Recomendado)
chmod +x PDF.Template.Editor-1.0.0.AppImage
./PDF.Template.Editor-1.0.0.AppImage

# Opção B: Pacote Debian / Ubuntu (.deb)
sudo dpkg -i pdf-template-editor_1.0.0_amd64.deb
```

:::

::: tip Primeira Inicialização
- **macOS**: Se aparecer o aviso de desenvolvedor não verificado, vá em **Preferências do Sistema → Privacidade e Segurança** e clique em **Abrir Mesmo Assim**.
- **Windows**: Se o Windows SmartScreen aparecer, clique em **Mais informações** → **Executar mesmo assim**.
- **Linux**: Verifique se o FUSE 2 está instalado ao executar AppImage em distribuições modernas (`sudo apt install libfuse2`).
:::

---

## Apoie o Projeto

Se o Open PDF Template Editor economiza seu tempo ou impulsiona o fluxo de trabalho do seu produto, considere apoiar o desenvolvimento via GitHub Sponsors ou Buy Me a Coffee:

<div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
  <a 
    href="https://github.com/sponsors/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.35);"
  >
    💖 Patrocine no GitHub
  </a>
  <a 
    href="https://buymeacoffee.com/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #FFDD00, #FBBF24); color: #000000; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(251, 191, 36, 0.35);"
  >
    ☕ Buy Me a Coffee
  </a>
</div>
