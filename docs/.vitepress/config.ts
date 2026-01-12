import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Open PDF Generator',
  description: 'Open source toolkit for generating PDFs from JSON templates',
  
  head: [
    ['link', { rel: 'icon', href: '/icon.png' }]
  ],

  themeConfig: {
    logo: '/icon.png',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Library', link: '/lib/' },
      { text: 'CLI', link: '/cli/' },
      { text: 'Editor', link: '/editor-redirect' },
      {
        text: 'GitHub',
        link: 'https://github.com/adilsoncruz/open-pdf-generator'
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
            { text: 'Image', link: '/lib/guide/elements/image' },
            { text: 'Table', link: '/lib/guide/elements/table' },
            { text: 'Rectangle', link: '/lib/guide/elements/rectangle' },
            { text: 'Line', link: '/lib/guide/elements/line' },
            { text: 'Barcode', link: '/lib/guide/elements/barcode' },
            { text: 'Loop', link: '/lib/guide/elements/loop' },
            { text: 'Conditional', link: '/lib/guide/elements/conditional' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Data Binding', link: '/lib/guide/data-binding' },
            { text: 'Conditions', link: '/lib/guide/conditions' },
            { text: 'Transformations', link: '/lib/guide/transformations' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Header & Footer', link: '/lib/guide/advanced/header-footer' },
            { text: 'Pagination', link: '/lib/guide/advanced/pagination' },
            { text: 'Positioning', link: '/lib/guide/advanced/positioning' },
            { text: 'Performance', link: '/lib/guide/advanced/performance' }
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
            { text: 'Examples', link: '/cli/examples' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/adilsoncruz/open-pdf-generator' }
    ],

    footer: {
      message: 'Released under the LGPL-3.0 License.',
      copyright: 'Copyright © 2024 Adi Cruz'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/adilsoncruz/open-pdf-generator/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
