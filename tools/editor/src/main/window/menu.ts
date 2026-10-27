import { app, Menu, shell, dialog, BrowserWindow } from 'electron'

export let currentAppLanguage = 'en'

export function getAppLanguage(): string {
  return currentAppLanguage
}

export function setAppLanguage(lang: string): void {
  currentAppLanguage = lang
}

export const MENU_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    file: 'File',
    new: 'New',
    open: 'Open...',
    save: 'Save',
    saveAs: 'Save As...',
    export: 'Export PDF...',
    exit: 'Exit',
    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    copyElement: 'Copy Element',
    pasteElement: 'Paste Element',
    deleteElement: 'Delete Element',
    view: 'View',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    resetZoom: 'Reset Zoom',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    togglefullscreen: 'Toggle Full Screen',
    window: 'Window',
    minimize: 'Minimize',
    zoom: 'Zoom',
    close: 'Close',
    help: 'Help',
    documentation: 'Documentation',
    reportIssue: 'Report Issue',
    about: 'About',
    language: 'Language',
    aboutDetail: 'Visual editor for PDF template generation.',
  },
  pt: {
    file: 'Arquivo',
    new: 'Novo',
    open: 'Abrir...',
    save: 'Salvar',
    saveAs: 'Salvar Como...',
    export: 'Exportar PDF...',
    exit: 'Sair',
    edit: 'Editar',
    undo: 'Desfazer',
    redo: 'Refazer',
    cut: 'Recortar',
    copy: 'Copiar',
    paste: 'Colar',
    selectAll: 'Selecionar Tudo',
    copyElement: 'Copiar Elemento',
    pasteElement: 'Colar Elemento',
    deleteElement: 'Excluir Elemento',
    view: 'Exibir',
    reload: 'Recarregar',
    forceReload: 'Forçar Recarregamento',
    toggleDevTools: 'Alternar Ferramentas do Desenvolvedor',
    resetZoom: 'Redefinir Zoom',
    zoomIn: 'Aumentar Zoom',
    zoomOut: 'Diminuir Zoom',
    togglefullscreen: 'Alternar Tela Cheia',
    window: 'Janela',
    minimize: 'Minimizar',
    zoom: 'Zoom',
    close: 'Fechar',
    help: 'Ajuda',
    documentation: 'Documentação',
    reportIssue: 'Relatar Problema',
    about: 'Sobre',
    language: 'Idioma',
    aboutDetail: 'Editor visual para geração de modelos PDF.',
  },
  es: {
    file: 'Archivo',
    new: 'Nuevo',
    open: 'Abrir...',
    save: 'Guardar',
    saveAs: 'Guardar como...',
    export: 'Exportar PDF...',
    exit: 'Salir',
    edit: 'Editar',
    undo: 'Deshacer',
    redo: 'Rehacer',
    cut: 'Cortar',
    copy: 'Copiar',
    paste: 'Pegar',
    selectAll: 'Seleccionar todo',
    copyElement: 'Copiar elemento',
    pasteElement: 'Pegar elemento',
    deleteElement: 'Eliminar elemento',
    view: 'Ver',
    reload: 'Recargar',
    forceReload: 'Forzar recarga',
    toggleDevTools: 'Alternar herramientas de desarrollo',
    resetZoom: 'Restablecer zoom',
    zoomIn: 'Acercar zoom',
    zoomOut: 'Alejar zoom',
    togglefullscreen: 'Alternar pantalla completa',
    window: 'Ventana',
    minimize: 'Minimizar',
    zoom: 'Zoom',
    close: 'Cerrar',
    help: 'Ayuda',
    documentation: 'Documentación',
    reportIssue: 'Informar de un problema',
    about: 'Acerca de',
    language: 'Idioma',
    aboutDetail: 'Editor visual para la generación de plantillas PDF.',
  },
}

export function createMenu(getMainWindow: () => BrowserWindow | null, lang: string = currentAppLanguage) {
  const isMac = process.platform === 'darwin'
  const strings = MENU_TRANSLATIONS[lang] || MENU_TRANSLATIONS.en

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: strings.file,
      submenu: [
        {
          label: strings.new,
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            getMainWindow()?.webContents.send('menu:new')
          },
        },
        {
          label: strings.open,
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            getMainWindow()?.webContents.send('menu:open')
          },
        },
        { type: 'separator' },
        {
          label: strings.save,
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            getMainWindow()?.webContents.send('menu:save')
          },
        },
        {
          label: strings.saveAs,
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            getMainWindow()?.webContents.send('menu:save-as')
          },
        },
        { type: 'separator' },
        {
          label: strings.export,
          click: () => {
            getMainWindow()?.webContents.send('menu:export')
          },
        },
        { type: 'separator' },
        ...(isMac
          ? []
          : [
              {
                label: strings.exit,
                accelerator: 'CmdOrCtrl+Q',
                role: 'quit' as const,
              },
            ]),
      ],
    },
    {
      label: strings.edit,
      submenu: [
        {
          label: strings.undo,
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            getMainWindow()?.webContents.send('menu:undo')
          },
        },
        {
          label: strings.redo,
          accelerator: 'CmdOrCtrl+Y',
          click: () => {
            getMainWindow()?.webContents.send('menu:redo')
          },
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: strings.copyElement,
          click: () => {
            getMainWindow()?.webContents.send('menu:copy')
          },
        },
        {
          label: strings.pasteElement,
          click: () => {
            getMainWindow()?.webContents.send('menu:paste')
          },
        },
        { type: 'separator' },
        {
          label: strings.deleteElement,
          accelerator: 'Delete',
          click: () => {
            getMainWindow()?.webContents.send('menu:delete')
          },
        },
      ],
    },
    {
      label: strings.view,
      submenu: [
        ...((!app.isPackaged || process.env.NODE_ENV === 'development')
          ? [
              { role: 'reload' as const },
              { role: 'forceReload' as const },
              { role: 'toggleDevTools' as const },
              { type: 'separator' as const },
            ]
          : []),
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: strings.language,
      submenu: [
        {
          label: 'English',
          type: 'radio',
          checked: lang === 'en',
          click: () => {
            setAppLanguage('en')
            createMenu(getMainWindow, 'en')
            getMainWindow()?.webContents.send('menu:set-language', 'en')
          },
        },
        {
          label: 'Português',
          type: 'radio',
          checked: lang === 'pt',
          click: () => {
            setAppLanguage('pt')
            createMenu(getMainWindow, 'pt')
            getMainWindow()?.webContents.send('menu:set-language', 'pt')
          },
        },
        {
          label: 'Español',
          type: 'radio',
          checked: lang === 'es',
          click: () => {
            setAppLanguage('es')
            createMenu(getMainWindow, 'es')
            getMainWindow()?.webContents.send('menu:set-language', 'es')
          },
        },
      ],
    },
    {
      label: strings.window,
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: strings.help,
      submenu: [
        {
          label: strings.documentation,
          click: () => {
            shell.openExternal('https://adilsoncruz.github.io/open-pdf-generator/')
          },
        },
        { type: 'separator' },
        {
          label: strings.reportIssue,
          click: () => {
            shell.openExternal('https://github.com/adilsoncruz/open-pdf-generator/issues')
          },
        },
        { type: 'separator' },
        {
          label: strings.about,
          click: () => {
            const win = getMainWindow()
            if (win) {
              dialog.showMessageBox(win, {
                type: 'info',
                title: `${strings.about} PDF Template Editor`,
                message: 'PDF Template Editor',
                detail: `Version ${app.getVersion()}\n\n${strings.aboutDetail}\n\n© 2024`,
              })
            }
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
