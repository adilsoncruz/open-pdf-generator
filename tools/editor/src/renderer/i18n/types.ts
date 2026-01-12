/**
 * Internationalization types for the PDF Template Editor
 * 
 * This file defines the structure of translations.
 * To add a new language:
 * 1. Create a new file in locales/ (e.g., es.ts for Spanish)
 * 2. Export an object that satisfies the Translations interface
 * 3. Add the language to AVAILABLE_LANGUAGES in index.ts
 */

export interface Translations {
  // Common
  common: {
    cancel: string
    apply: string
    close: string
    save: string
    delete: string
    create: string
    edit: string
    add: string
    remove: string
    search: string
    loading: string
    error: string
    success: string
    warning: string
    confirm: string
    yes: string
    no: string
    none: string
    unsaved: string
  }

  // Toolbar
  toolbar: {
    file: string
    new: string
    open: string
    save: string
    saveAs: string
    export: string
    preview: string
    testData: string
    settings: string
    cliNotInstalled: string
    unsavedChanges: string
    continueAnyway: string
  }

  // Sidebar
  sidebar: {
    pageSettings: string
    size: string
    margins: string
    top: string
    bottom: string
    left: string
    right: string
    section: string
    header: string
    footer: string
    page: string
    summary: string
    background: string
    elementsTitle: string
    group: string
    createGroup: string
    groupName: string
    selectAtLeast2Elements: string
    elementsAlreadyInGroup: string
    removeHeaderConfirm: string
    removeFooterConfirm: string
    removeSummaryConfirm: string
    removeBackgroundConfirm: string
    noElements: string
    useSidebar: string
    expand: string
    collapse: string
    expandGroup: string
    collapseGroup: string
    showElement: string
    hideElement: string
    showGroup: string
    hideGroup: string
    deleteElement: string
    deleteElementConfirm: string
    deleteLoopConfirm: string
    addHeader: string
    addFooter: string
    addSummary: string
    addBackground: string
  }

  // Elements Toolbar
  elements: {
    text: string
    staticText: string
    image: string
    table: string
    rectangle: string
    line: string
    barcode: string
    loop: string
  }

  // Data Panel
  dataPanel: {
    title: string
    description: string
    loadFile: string
    format: string
    minify: string
    validJson: string
    invalidJson: string
    cannotFormat: string
    cannotMinify: string
    errorLoading: string
    indent: string
    removeIndent: string
    autoIndent: string
    previous: string
    next: string
    caseSensitive: string
  }

  // Help Modal
  help: {
    title: string
    subtitle: string
    dataBindingIntro: string
    conditionsIntro: string
    tip: string
    fullDocumentation: string
    copyExpression: string
    input: string
    output: string
    tabs: {
      text: string
      numbers: string
      dates: string
      lists: string
      template: string
      conditions: string
      utils: string
    }
    descriptions: {
      text: string
      numbers: string
      dates: string
      lists: string
      template: string
      conditions: string
      utils: string
    }
  }

  // Properties Panel
  properties: {
    elementProperties: string
    groupProperties: string
    sectionProperties: string
    position: string
    size: string
    style: string
    content: string
    dataBinding: string
    printCondition: string
    id: string
    value: string
    source: string
    width: string
    height: string
    fontSize: string
    fontFamily: string
    fontWeight: string
    color: string
    backgroundColor: string
    borderColor: string
    borderWidth: string
    alignment: string
    cornerRadius: string
    opacity: string
    rotation: string
    columns: string
    addColumn: string
    columnHeader: string
    columnField: string
    columnWidth: string
    barcodeType: string
    errorCorrection: string
    itemSpacing: string
    fit: string
    contain: string
    cover: string
    fill: string
    scale: string
    none: string
  }

  // Settings Modal
  settings: {
    title: string
    java: string
    cli: string
    installed: string
    notInstalled: string
    version: string
    installationPath: string
    installAutomatically: string
    selectJarFile: string
    installing: string
    javaRequired: string
    downloadJava: string
    cliNeeded: string
    chooseOption: string
    manualInstallTip: string
    refreshStatus: string
    versionInfo: string
    editor: string
    coreLibrary: string
    documentation: string
    learnMore: string
    open: string
    cliReady: string
  }

  // PDF Generation
  pdf: {
    generating: string
    generated: string
    openPdf: string
    noTestData: string
    noTestDataTip: string
    generateAnyway: string
    javaNotInstalled: string
    javaRequired: string
    installJava: string
    error: string
  }

  // Preview
  preview: {
    title: string
    loading: string
    generating: string
    refresh: string
    page: string
    of: string
    zoomIn: string
    zoomOut: string
    emptyTemplate: string
    emptyTemplateHint: string
    genericError: string
    tryAgain: string
  }

  // Error messages
  errors: {
    javaNotInstalled: string
    javaNotInstalledHint: string
    cliNotInstalled: string
    cliNotInstalledHint: string
    mainWindowNotFound: string
    operationCancelled: string
    errorReadingPdf: string
    errorGeneratingPdf: string
    errorExecutingJava: string
    unknownError: string
  }

  // Confirmations
  confirmations: {
    unsavedChanges: string
    deleteElement: string
    deleteGroup: string
    removeSection: string
  }
}

export type TranslationKey = keyof Translations

