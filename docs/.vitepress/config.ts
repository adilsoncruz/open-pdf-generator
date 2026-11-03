import { defineConfig } from 'vitepress'

const githubLink = 'https://github.com/adilsoncruz/open-pdf-generator'

const shared = {
  description: 'Open source toolkit for generating PDFs from JSON templates',

  // Base path for GitHub Pages (repo name)
  base: '/open-pdf-generator/',

  head: [['link', { rel: 'icon', href: '/open-pdf-generator/icon.png' }]],

  appearance: 'dark',

  themeConfig: {
    logo: '/icon.png',

    socialLinks: [{ icon: 'github', link: githubLink }],

    search: {
      provider: 'local'
    }
  }
}

// English (root)
const en = {
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Library', link: '/lib/' },
      { text: 'CLI', link: '/cli/' },
      { text: 'Editor', link: '/editor/' },
      { text: '🎮 Playground', link: '/open-pdf-generator/playground/', target: '_blank' },
      {
        text: '⚡ Benchmark',
        items: [
          { text: 'vs JasperReports (JVM)', link: '/lib/benchmark' },
          { text: 'vs Go (Maroto) & Node (pdfmake)', link: '/lib/benchmark-multilang' }
        ]
      },
      {
        text: '💖 Donate',
        items: [
          { text: 'GitHub Sponsors', link: 'https://github.com/sponsors/adilsoncruz' },
          { text: 'Buy Me a Coffee', link: 'https://buymeacoffee.com/adilsoncruz' }
        ]
      },
      {
        text: 'GitHub',
        link: githubLink
      }
    ],

    sidebar: {
      '/lib/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'What is Open PDF Generator?', link: '/lib/guide/what-is' },
            { text: 'Installation', link: '/lib/guide/installation' },
            { text: 'First Steps', link: '/lib/guide/first-steps' },
            { text: 'Templates', link: '/lib/guide/templates' }
          ]
        },
        {
          text: 'Elements',
          items: [
            { text: 'Text', link: '/lib/guide/elements/text' },
            { text: 'Rich Text', link: '/lib/guide/elements/rich-text' },
            { text: 'Link', link: '/lib/guide/elements/link' },
            { text: 'Image', link: '/lib/guide/elements/image' },
            { text: 'Table', link: '/lib/guide/elements/table' },
            { text: 'Container', link: '/lib/guide/elements/container' },
            { text: 'Spacer', link: '/lib/guide/elements/spacer' },
            { text: 'Page Break', link: '/lib/guide/elements/page-break' },
            { text: 'Rectangle', link: '/lib/guide/elements/rectangle' },
            { text: 'Line', link: '/lib/guide/elements/line' },
            { text: 'Barcode', link: '/lib/guide/elements/barcode' },
            { text: 'Loop', link: '/lib/guide/elements/loop' },
            { text: 'Conditional', link: '/lib/guide/elements/conditional' },
            { text: 'List', link: '/lib/guide/elements/list' },
            { text: 'Checklist', link: '/lib/guide/elements/check-list' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Data Binding', link: '/lib/guide/data-binding' },
            { text: 'Conditions', link: '/lib/guide/conditions' },
            { text: 'Transformations', link: '/lib/guide/transformations' },
            { text: 'Schema Validation', link: '/lib/guide/schema-validation' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Header & Footer', link: '/lib/guide/advanced/header-footer' },
            { text: 'Watermark', link: '/lib/guide/advanced/watermark' },
            { text: 'Summary Page', link: '/lib/guide/advanced/summary-page' },
            { text: 'Groups', link: '/lib/guide/advanced/groups' },
            { text: 'Pagination', link: '/lib/guide/advanced/pagination' },
            { text: 'Positioning', link: '/lib/guide/advanced/positioning' },
            { text: 'Performance', link: '/lib/guide/advanced/performance' },
            { text: 'Benchmark (vs Jasper)', link: '/lib/benchmark' },
            { text: 'Benchmark (Go/Node/Docker)', link: '/lib/benchmark-multilang' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'PDFGenerator', link: '/lib/api/pdf-generator' },
            { text: 'Template', link: '/lib/api/template' },
            { text: 'TemplateBuilder', link: '/lib/api/template-builder' },
            { text: 'Elements', link: '/lib/api/elements' },
            { text: 'Configuration', link: '/lib/api/configuration' }
          ]
        }
      ],
      '/cli/': [
        {
          text: 'CLI',
          items: [
            { text: 'Overview', link: '/cli/' },
            { text: 'Installation', link: '/cli/installation' },
            { text: 'Commands', link: '/cli/commands' },
            { text: 'Examples', link: '/cli/examples' },
            { text: '⚡ Benchmark (Go / Node / Docker)', link: '/lib/benchmark-multilang' }
          ]
        }
      ],
      '/editor/': [
        {
          text: 'Editor',
          items: [{ text: 'Overview & Download', link: '/editor/' }]
        }
      ]
    },

    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Copyright © 2024 Adilson Cruz'
    },

    editLink: {
      pattern: 'https://github.com/adilsoncruz/open-pdf-generator/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
}

// Portuguese (pt-BR) — /pt/
const pt = {
  label: 'Português',
  lang: 'pt-BR',

  themeConfig: {
    nav: [
      { text: 'Início', link: '/pt/' },
      { text: 'Biblioteca', link: '/pt/lib/' },
      { text: 'CLI', link: '/pt/cli/' },
      { text: 'Editor', link: '/pt/editor/' },
      { text: '🎮 Playground Web', link: '/open-pdf-generator/playground/', target: '_blank' },
      {
        text: '⚡ Benchmark',
        items: [
          { text: 'vs JasperReports (JVM)', link: '/pt/lib/benchmark' },
          { text: 'vs Go (Maroto) & Node (pdfmake)', link: '/lib/benchmark-multilang' }
        ]
      },
      {
        text: '💖 Doe',
        items: [
          { text: 'GitHub Sponsors', link: 'https://github.com/sponsors/adilsoncruz' },
          { text: 'Buy Me a Coffee', link: 'https://buymeacoffee.com/adilsoncruz' }
        ]
      },
      {
        text: 'GitHub',
        link: githubLink
      }
    ],

    sidebar: {
      '/pt/lib/': [
        {
          text: 'Primeiros Passos',
          items: [
            { text: 'O que é o Open PDF Generator?', link: '/pt/lib/guide/what-is' },
            { text: 'Instalação', link: '/pt/lib/guide/installation' },
            { text: 'Primeiros Passos', link: '/pt/lib/guide/first-steps' },
            { text: 'Início rápido', link: '/pt/lib/guide/getting-started' },
            { text: 'Templates', link: '/pt/lib/guide/templates' }
          ]
        },
        {
          text: 'Elementos',
          items: [
            { text: 'Text', link: '/pt/lib/guide/elements/text' },
            { text: 'Rich Text', link: '/pt/lib/guide/elements/rich-text' },
            { text: 'Link', link: '/pt/lib/guide/elements/link' },
            { text: 'Image', link: '/pt/lib/guide/elements/image' },
            { text: 'Table', link: '/pt/lib/guide/elements/table' },
            { text: 'Container', link: '/pt/lib/guide/elements/container' },
            { text: 'Spacer', link: '/pt/lib/guide/elements/spacer' },
            { text: 'Page Break', link: '/pt/lib/guide/elements/page-break' },
            { text: 'Rectangle', link: '/pt/lib/guide/elements/rectangle' },
            { text: 'Line', link: '/pt/lib/guide/elements/line' },
            { text: 'Barcode', link: '/pt/lib/guide/elements/barcode' },
            { text: 'Loop', link: '/pt/lib/guide/elements/loop' },
            { text: 'Conditional', link: '/pt/lib/guide/elements/conditional' },
            { text: 'Lista', link: '/pt/lib/guide/elements/list' },
            { text: 'Checklist', link: '/pt/lib/guide/elements/check-list' }
          ]
        },
        {
          text: 'Recursos',
          items: [
            { text: 'Data Binding', link: '/pt/lib/guide/data-binding' },
            { text: 'Condições', link: '/pt/lib/guide/conditions' },
            { text: 'Transformações', link: '/pt/lib/guide/transformations' },
            { text: 'Validação de Schema', link: '/pt/lib/guide/schema-validation' }
          ]
        },
        {
          text: 'Avançado',
          items: [
            { text: 'Cabeçalho & Rodapé', link: '/pt/lib/guide/advanced/header-footer' },
            { text: 'Marca d\u2019Água', link: '/pt/lib/guide/advanced/watermark' },
            { text: 'Página de Resumo', link: '/pt/lib/guide/advanced/summary-page' },
            { text: 'Grupos', link: '/pt/lib/guide/advanced/groups' },
            { text: 'Paginação', link: '/pt/lib/guide/advanced/pagination' },
            { text: 'Posicionamento', link: '/pt/lib/guide/advanced/positioning' },
            { text: 'Desempenho', link: '/pt/lib/guide/advanced/performance' },
            { text: 'Benchmark (vs Jasper)', link: '/pt/lib/benchmark' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'PDFGenerator', link: '/pt/lib/api/pdf-generator' },
            { text: 'Template', link: '/pt/lib/api/template' },
            { text: 'TemplateBuilder', link: '/pt/lib/api/template-builder' },
            { text: 'Elements', link: '/pt/lib/api/elements' },
            { text: 'Configuration', link: '/pt/lib/api/configuration' }
          ]
        }
      ],
      '/pt/cli/': [
        {
          text: 'CLI',
          items: [
            { text: 'Visão Geral', link: '/pt/cli/' },
            { text: 'Instalação', link: '/pt/cli/installation' },
            { text: 'Comandos', link: '/pt/cli/commands' },
            { text: 'Exemplos', link: '/pt/cli/examples' },
            { text: '⚡ Benchmark (Go / Node / Docker)', link: '/lib/benchmark-multilang' }
          ]
        }
      ],
      '/pt/editor/': [
        {
          text: 'Editor',
          items: [{ text: 'Visão Geral & Download', link: '/pt/editor/' }]
        }
      ]
    },

    footer: {
      message: 'Publicado sob a licença AGPL-3.0.',
      copyright: 'Copyright © 2024 Adilson Cruz'
    },

    editLink: {
      pattern: 'https://github.com/adilsoncruz/open-pdf-generator/edit/main/docs/:path',
      text: 'Edite esta página no GitHub'
    },

    outline: [{ level: [2, 3], label: 'Nesta página' }],

    docFooter: {
      prev: 'Anterior',
      next: 'Próxima'
    }
  }
}

// Spanish (es) — /es/
const es = {
  label: 'Español',
  lang: 'es',

  themeConfig: {
    nav: [
      { text: 'Inicio', link: '/es/' },
      { text: 'Biblioteca', link: '/es/lib/' },
      { text: 'CLI', link: '/es/cli/' },
      { text: 'Editor', link: '/es/editor/' },
      { text: '🎮 Playground Web', link: '/open-pdf-generator/playground/', target: '_blank' },
      {
        text: '⚡ Benchmark',
        items: [
          { text: 'vs JasperReports (JVM)', link: '/es/lib/benchmark' },
          { text: 'vs Go (Maroto) & Node (pdfmake)', link: '/lib/benchmark-multilang' }
        ]
      },
      {
        text: '💖 Donar',
        items: [
          { text: 'GitHub Sponsors', link: 'https://github.com/sponsors/adilsoncruz' },
          { text: 'Buy Me a Coffee', link: 'https://buymeacoffee.com/adilsoncruz' }
        ]
      },
      {
        text: 'GitHub',
        link: githubLink
      }
    ],

    sidebar: {
      '/es/lib/': [
        {
          text: 'Primeros Pasos',
          items: [
            { text: '¿Qué es Open PDF Generator?', link: '/es/lib/guide/what-is' },
            { text: 'Instalación', link: '/es/lib/guide/installation' },
            { text: 'Primeros Pasos', link: '/es/lib/guide/first-steps' },
            { text: 'Inicio rápido', link: '/es/lib/guide/getting-started' },
            { text: 'Plantillas', link: '/es/lib/guide/templates' }
          ]
        },
        {
          text: 'Elementos',
          items: [
            { text: 'Text', link: '/es/lib/guide/elements/text' },
            { text: 'Rich Text', link: '/es/lib/guide/elements/rich-text' },
            { text: 'Link', link: '/es/lib/guide/elements/link' },
            { text: 'Image', link: '/es/lib/guide/elements/image' },
            { text: 'Table', link: '/es/lib/guide/elements/table' },
            { text: 'Container', link: '/es/lib/guide/elements/container' },
            { text: 'Spacer', link: '/es/lib/guide/elements/spacer' },
            { text: 'Page Break', link: '/es/lib/guide/elements/page-break' },
            { text: 'Rectangle', link: '/es/lib/guide/elements/rectangle' },
            { text: 'Line', link: '/es/lib/guide/elements/line' },
            { text: 'Barcode', link: '/es/lib/guide/elements/barcode' },
            { text: 'Loop', link: '/es/lib/guide/elements/loop' },
            { text: 'Conditional', link: '/es/lib/guide/elements/conditional' },
            { text: 'Lista', link: '/es/lib/guide/elements/list' },
            { text: 'Checklist', link: '/es/lib/guide/elements/check-list' }
          ]
        },
        {
          text: 'Características',
          items: [
            { text: 'Data Binding', link: '/es/lib/guide/data-binding' },
            { text: 'Condiciones', link: '/es/lib/guide/conditions' },
            { text: 'Transformaciones', link: '/es/lib/guide/transformations' },
            { text: 'Validación de Esquema', link: '/es/lib/guide/schema-validation' }
          ]
        },
        {
          text: 'Avanzado',
          items: [
            { text: 'Encabezado y Pie de Página', link: '/es/lib/guide/advanced/header-footer' },
            { text: 'Marca de Agua', link: '/es/lib/guide/advanced/watermark' },
            { text: 'Página de Resumen', link: '/es/lib/guide/advanced/summary-page' },
            { text: 'Grupos', link: '/es/lib/guide/advanced/groups' },
            { text: 'Paginación', link: '/es/lib/guide/advanced/pagination' },
            { text: 'Posicionamiento', link: '/es/lib/guide/advanced/positioning' },
            { text: 'Rendimiento', link: '/es/lib/guide/advanced/performance' },
            { text: 'Benchmark (vs Jasper)', link: '/es/lib/benchmark' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'PDFGenerator', link: '/es/lib/api/pdf-generator' },
            { text: 'Template', link: '/es/lib/api/template' },
            { text: 'TemplateBuilder', link: '/es/lib/api/template-builder' },
            { text: 'Elements', link: '/es/lib/api/elements' },
            { text: 'Configuration', link: '/es/lib/api/configuration' }
          ]
        }
      ],
      '/es/cli/': [
        {
          text: 'CLI',
          items: [
            { text: 'Visión General', link: '/es/cli/' },
            { text: 'Instalación', link: '/es/cli/installation' },
            { text: 'Comandos', link: '/es/cli/commands' },
            { text: 'Ejemplos', link: '/es/cli/examples' },
            { text: '⚡ Benchmark (Go / Node / Docker)', link: '/lib/benchmark-multilang' }
          ]
        }
      ],
      '/es/editor/': [
        {
          text: 'Editor',
          items: [{ text: 'Visión General y Descarga', link: '/es/editor/' }]
        }
      ]
    },

    footer: {
      message: 'Publicado bajo la licencia AGPL-3.0.',
      copyright: 'Copyright © 2024 Adilson Cruz'
    },

    editLink: {
      pattern: 'https://github.com/adilsoncruz/open-pdf-generator/edit/main/docs/:path',
      text: 'Edita esta página en GitHub'
    },

    outline: [{ level: [2, 3], label: 'En esta página' }],

    docFooter: {
      prev: 'Anterior',
      next: 'Siguiente'
    }
  }
}

export default defineConfig({
  ...shared,
  title: 'Open PDF Generator',
  locales: {
    root: { label: 'English', lang: 'en', ...en },
    pt,
    es
  }
})
