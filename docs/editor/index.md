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
    url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/download/v1.1.0/PDF-Template-Editor-1.1.0.dmg',
    label: 'Download for macOS',
    available: true
  },
  windows: {
    url: '#',
    label: 'Download for Windows',
    available: false
  },
  linux: {
    url: '#',
    label: 'Download for Linux',
    available: false
  }
}
</script>

# PDF Template Editor

A powerful desktop application for designing and previewing PDF templates with a drag-and-drop visual canvas, real-time data binding, and the **Studio Slate** design system.

<div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 24px 0;">
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem; font-weight: 600; color: var(--vp-c-brand-1);">v1.1.0</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">macOS</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">Studio Slate</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">MIT License</span>
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
    {{ downloads[os].label }} - Coming soon
  </div>
  
  <p style="margin-top: 16px; font-size: 0.9rem; color: var(--vp-c-text-3);">
    Version 1.1.0 · {{ osName }} · ~117 MB
  </p>
  
  <p v-if="os !== 'macos'" style="margin-top: 8px; font-size: 0.85rem;">
    Available now for <a href="https://github.com/adilsoncruz/open-pdf-generator/releases/download/v1.1.0/PDF-Template-Editor-1.1.0.dmg">macOS</a>
  </p>
  
  <p style="margin-top: 12px;">
    <a href="https://github.com/adilsoncruz/open-pdf-generator/releases" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">All releases</a>
    ·
    <a href="https://github.com/adilsoncruz/open-pdf-generator" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">GitHub</a>
    ·
    <a href="https://github.com/sponsors/adilsoncruz" target="_blank" style="color: #ec4899; font-size: 0.85rem; font-weight: 500;">💖 Sponsor</a>
    ·
    <a href="https://buymeacoffee.com/adilsoncruz" target="_blank" style="color: #f59e0b; font-size: 0.85rem; font-weight: 500;">☕ Buy Me a Coffee</a>
  </p>
</div>

## Screenshots

### Studio Slate Workspace

The modern high-contrast interface featuring multi-tabs, interactive canvas rulers, section switcher, and dynamic properties panel.

![Studio Slate Workspace](/images/editor/screenshots/main-editor.png)

### Home Screen & Project Hub

Quickly start fresh templates, resume recent documents, or browse files directly from the animated startup hub.

![Home Screen](/images/editor/screenshots/home-screen.png)

### Properties Panel

Fine-tune element dimensions, colors, fonts, borders, data bindings, conditions, and group parameters with live feedback.

![Properties Panel](/images/editor/screenshots/properties-panel.png)

### Test Data & Schema Editor

Built-in JSON editor to test template bindings with formatted preview, minify, and schema validation.

![Test Data Modal](/images/editor/screenshots/data-panel.png)

### Live PDF Preview

Instant PDF compilation with full data binding resolution, loops, and automatic page breaks.

![Preview](/images/editor/screenshots/preview.png)

---

## Key Features

- **Studio Slate Design**: Modern high-contrast dark theme alongside an elegant light mode with the Precision Fold logo.
- **Multi-Tab Workspace**: Open, edit, and compare multiple PDF templates concurrently with dirty-state tracking.
- **Right-Click Context Menu**: Instant actions on canvas elements and layers (Group, Ungroup, Duplicate, Delete, Group Properties).
- **Element Groups**: Bundle multiple elements to share visibility rules and conditional logic (`printCondition`).
- **Containers & Nested Layouts**: Nest child elements with auto-height and responsive percentage sizing.
- **Rulers & Interactive Guides**: Precision rulers with draggable guides and snap-to-edge assistance.
- **JSON Schema Validation & Mock Generator**: Inspect template schemas and generate realistic test data with one click.
- **Multi-Language Support**: Complete localization for English, Portuguese (pt-BR), and Spanish (es).
- **No Cloud Required**: 100% offline desktop app powered by local compilation and rendering.

---

## Installation

1. Download the `.dmg` file from the button above.
2. Open the downloaded disk image.
3. Drag **PDF Template Editor** into your Applications folder.
4. Launch from Applications or Spotlight.

::: tip First Launch
On macOS, if prompted with a security warning, go to **System Preferences → Privacy & Security** and click **Open Anyway**.
:::

---

## Support & Donate

If Open PDF Template Editor saves you time or empowers your product workflow, consider supporting development through GitHub Sponsors or Buy Me a Coffee:

<div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
  <a 
    href="https://github.com/sponsors/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.35);"
  >
    💖 Sponsor on GitHub
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
