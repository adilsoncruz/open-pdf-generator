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
    label: 'Descargar para macOS',
    available: true
  },
  windows: {
    url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/download/editor-v1.0.0/PDF.Template.Editor.Setup.1.0.0.exe',
    label: 'Descargar para Windows',
    available: true
  },
  linux: {
    url: 'https://github.com/adilsoncruz/open-pdf-generator/releases/download/editor-v1.0.0/PDF.Template.Editor-1.0.0.AppImage',
    label: 'Descargar para Linux',
    available: true
  }
}
</script>

# PDF Template Editor

Una potente aplicación de escritorio para diseñar y previsualizar plantillas PDF con un lienzo visual drag-and-drop, data binding en tiempo real y el sistema de diseño **Studio Slate**.

<div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 24px 0;">
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem; font-weight: 600; color: var(--vp-c-brand-1);">v1.0.0</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">macOS · Windows · Linux</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">Studio Slate</span>
  <span style="padding: 6px 14px; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 20px; font-size: 0.875rem;">Licencia AGPL-3.0</span>
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
  <div v-else style="display: inline-block; padding: 16px 32px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-3); border-radius: 12px; font-weight: 600; font-size: 1.1rem; border: 1px solid var(--vp-c-divider); border-radius: 12px;">
    {{ downloads[os].label }} - Próximamente
  </div>
  
  <p style="margin-top: 16px; font-size: 0.9rem; color: var(--vp-c-text-3);">
    Versión 1.0.0 · {{ osName }} · Universal / x64
  </p>
  
  <p style="margin-top: 8px; font-size: 0.85rem; color: var(--vp-c-text-2);">
    Aplicación de escritorio multiplataforma para macOS, Windows y Linux.
  </p>
  
  <p style="margin-top: 12px;">
    <a href="https://github.com/adilsoncruz/open-pdf-generator/releases" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">Todas las versiones</a>
    ·
    <a href="https://github.com/adilsoncruz/open-pdf-generator" target="_blank" style="color: var(--vp-c-text-2); font-size: 0.85rem;">GitHub</a>
    ·
    <a href="https://github.com/sponsors/adilsoncruz" target="_blank" style="color: #ec4899; font-size: 0.85rem; font-weight: 500;">💖 Patrocinar</a>
    ·
    <a href="https://buymeacoffee.com/adilsoncruz" target="_blank" style="color: #f59e0b; font-size: 0.85rem; font-weight: 500;">☕ Buy Me a Coffee</a>
  </p>
</div>

## Capturas de pantalla

### Espacio de trabajo Studio Slate

La interfaz moderna de alto contraste con múltiples pestañas, reglas interactivas del lienzo, selector de secciones y panel de propiedades dinámico.

![Espacio de trabajo Studio Slate](/images/editor/screenshots/main-editor.png)

### Pantalla de inicio & hub de proyectos

Inicia rápidamente plantillas nuevas, retoma documentos recientes o explora archivos directamente desde el hub animado de arranque.

![Pantalla de inicio](/images/editor/screenshots/home-screen.png)

### Panel de propiedades

Ajusta con precisión dimensiones, colores, fuentes, bordes, data bindings, condiciones y parámetros de grupo de cada elemento, con feedback en vivo.

![Panel de propiedades](/images/editor/screenshots/properties-panel.png)

### Datos de prueba & editor de Schema

Editores de JSON y Schema integrados para probar los bindings de la plantilla con vista previa formateada, verificación de sintaxis en tiempo real, validación de schema en vivo contra los datos de prueba activos, inferencia automática de schema y generación de datos mock con un clic. Aprende más en la [Guía de Validación de Schema](/es/lib/guide/schema-validation).

![Modal de datos de prueba](/images/editor/screenshots/data-panel.png)

### Vista previa de PDF en vivo

Compilación instantánea del PDF con resolución completa de data binding, loops y saltos de página automáticos.

![Vista previa](/images/editor/screenshots/preview.png)

---

## Características principales

- **Diseño Studio Slate**: Tema oscuro moderno de alto contraste junto a un elegante modo claro con el logo Precision Fold.
- **Espacio de trabajo multi-pestaña**: Abre, edita y compara múltiples plantillas PDF simultáneamente con seguimiento de cambios sin guardar.
- **Menú contextual con clic derecho**: Acciones instantáneas sobre los elementos y capas del lienzo (Agrupar, Desagrupar, Duplicar, Eliminar, Propiedades del grupo).
- **Grupos de elementos**: Agrupa múltiples elementos para compartir reglas de visibilidad y lógica condicional (`printCondition`).
- **Contenedores & layouts anidados**: Anida elementos hijos con altura automática y tamaños porcentuales responsivos.
- **Reglas & guías interactivas**: Reglas de precisión con guías arrastrables y ayuda de ajuste al borde (snap-to-edge).
- **Validación JSON Schema & generador de mocks**: Inspecciona los esquemas de la plantilla y genera datos de prueba realistas con un clic.
- **Soporte multi-idioma**: Localización completa en inglés, portugués (pt-BR) y español (es).
- **Sin nube requerida**: Aplicación de escritorio 100% offline, potenciada por compilación y renderizado locales.

---

## Instalación

::: code-group

```bash [macOS]
# 1. Download the .dmg file from the button above
# 2. Open the downloaded disk image
# 3. Drag "PDF Template Editor" into your Applications folder
# 4. Launch from Applications or Spotlight
```

```bash [Windows]
# 1. Download the .exe installer from the button above
# 2. Run PDF.Template.Editor.Setup.1.0.0.exe
# 3. Follow the installation setup wizard
# 4. Launch from Start Menu or Desktop shortcut
```

```bash [Linux]
# Option A: AppImage (Recommended)
chmod +x PDF.Template.Editor-1.0.0.AppImage
./PDF.Template.Editor-1.0.0.AppImage

# Option B: Debian / Ubuntu package (.deb)
sudo dpkg -i pdf-template-editor_1.0.0_amd64.deb
```

:::

::: tip Primer arranque
- **macOS**: Si aparece la advertencia de desarrollador no verificado, ve a **Preferencias del Sistema → Privacidad y Seguridad** y haz clic en **Abrir igualmente**.
- **Windows**: Si aparece Windows SmartScreen, haz clic en **Más información** → **Ejecutar de todos modos**.
- **Linux**: Asegúrate de tener FUSE 2 instalado si ejecutas la AppImage en distribuciones modernas (`sudo apt install libfuse2`).
:::

---

## Apoyo y donaciones

Si Open PDF Template Editor te ahorra tiempo o potencia el flujo de trabajo de tu producto, considera apoyar el desarrollo a través de GitHub Sponsors o Buy Me a Coffee:

<div style="margin: 20px 0; display: flex; gap: 12px; flex-wrap: wrap;">
  <a 
    href="https://github.com/sponsors/adilsoncruz" 
    target="_blank"
    rel="noopener noreferrer"
    style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #db2777); color: white; border-radius: 10px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.35);"
  >
    💖 Patrocinar en GitHub
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
