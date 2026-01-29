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
    url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/download/v1.0.0/PDF-Template-Editor-1.0.0.dmg',
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

A powerful desktop application for creating and editing PDF templates with a drag-and-drop visual editor.

<div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 24px 0;">
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">v1.0.0</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">macOS</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">MIT License</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">Open Source</span>
</div>

<div style="text-align: center; margin: 32px 0;">
  <a 
    v-if="downloads[os].available"
    :href="downloads[os].url" 
    style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 32px; background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-3)); color: white; border-radius: 12px; font-weight: 600; font-size: 1.1rem; text-decoration: none; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);"
  >
    ⬇️ {{ downloads[os].label }}
  </a>
  <div v-else style="display: inline-block; padding: 16px 32px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); border-radius: 12px; font-weight: 600; font-size: 1.1rem; border: 1px solid var(--vp-c-divider);">
    {{ downloads[os].label }} - Coming soon
  </div>
  
  <p style="margin-top: 16px; font-size: 0.9rem; color: var(--vp-c-text-3);">
    Version 1.0.0 · {{ osName }} · ~117 MB
  </p>
  
  <p v-if="os !== 'macos'" style="margin-top: 8px; font-size: 0.85rem;">
    Available now for <a href="https://github.com/adilsoncruz/open-pdf-generator/releases/download/v1.0.0/PDF-Template-Editor-1.0.0.dmg">macOS</a>
  </p>
  
  <p style="margin-top: 12px;">
    <a href="https://github.com/adilsoncruz/open-pdf-generator/releases" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">All releases</a>
    ·
    <a href="https://github.com/adilsoncruz/open-pdf-generator" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">GitHub</a>
  </p>
</div>

## Screenshots

### Main Editor Interface

The complete workspace with sidebar, canvas, and properties panel.

![Main Editor](/images/editor/screenshots/main-editor.png)

### Data Panel

JSON editor with validation, search, and formatting.

![Data Panel](/images/editor/screenshots/data-panel.png)

### Properties Panel

Fine-tune element settings with precision.

![Properties Panel](/images/editor/screenshots/properties-panel.png)

### Live Preview

Real-time PDF preview with loop elements and data binding.

![Preview](/images/editor/screenshots/preview.png)

## Installation

1. Download the `.dmg` file from the button above
2. Open the downloaded file
3. Drag **PDF Template Editor** to Applications
4. Launch from Applications folder

::: tip First Launch
On first launch, you may need to allow the app in **System Preferences → Security & Privacy**.
:::

## What's included

- ✓ Visual template editor with dark/light themes
- ✓ Built-in PDF generation library
- ✓ Header and footer support
- ✓ Loop elements with auto-pagination
- ✓ Relative positioning for dynamic layouts
- ✓ Data binding with JSON
- ✓ No internet required
