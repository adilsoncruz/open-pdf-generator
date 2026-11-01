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
    importJasper: string
    importAI: string
    preview: string
    testData: string
    settings: string
    cliNotInstalled: string
    unsavedChanges: string
    continueAnyway: string
    language: string
  }

  // Sidebar
  sidebar: {
    settings: string
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
    elementsLibrary: string
    layers: string
    layer: string
    templateInfo: string
    documentProperties: string
    documentName: string
    description: string
    author: string
    version: string
    paperSize: string
    orientation: string
    portrait: string
    landscape: string
    activeSections: string
    historyVersions: string
    active: string
    inactive: string
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
    pageBreak: string
    spacer: string
    richText: string
    link: string
    container: string
    list: string
    checkList: string
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
    title: string
    headerProperties: string
    footerProperties: string
    summaryProperties: string
    backgroundProperties: string
    headerTopPage: string
    footerBottomPage: string
    summaryDescription: string
    backgroundDescription: string
    groupName: string
    elementsCount: string
    ungroupElements: string
    ungroupNotice: string
    heightPt: string
    headerNotExist: string
    footerNotExist: string
    summaryNotExist: string
    backgroundNotExist: string
    transform: string
    relativeFlow: string
    absoluteFixed: string
    absolute: string
    relative: string
    offsetY: string
    typography: string
    regular: string
    bold: string
    italic: string
    alignLeft: string
    alignCenter: string
    alignRight: string
    alignJustify: string
    alignTop: string
    alignMiddle: string
    alignBottom: string
    underline: string
    strikethrough: string
    lineWrap: string
    lineHeight: string
    firstLineIndent: string
    overflow: string
    overflowVisible: string
    overflowHidden: string
    overflowAuto: string
    internalMargins: string
    top: string
    right: string
    bottom: string
    left: string
    textContent: string
    textPlaceholder: string
    targetUrl: string
    imageSource: string
    imagePlaceholder: string
    barcodeSettings: string
    barcodePlaceholder: string
    containerSettings: string
    containerName: string
    appearance: string
    transparent: string
    stroke: string
    border: string
    solid: string
    dashed: string
    dotted: string
    radius: string
    boundDynamicData: string
    printConditionHelp: string
    generalTab: string
    columnsTab: string
    stylesTab: string
    width100: string
    dataBindingList: string
    dataBindingListHelp: string
    emptyMessage: string
    emptyMessagePlaceholder: string
    headerBehavior: string
    showHeader: string
    repeatHeader: string
    newColumn: string
    noColumns: string
    addFirstColumn: string
    moveUp: string
    moveDown: string
    deleteColumn: string
    columnTitle: string
    columnFieldJson: string
    headerAlignment: string
    cellAlignment: string
    alignLeftShort: string
    alignCenterShort: string
    alignRightShort: string
    tableHeader: string
    textColor: string
    fontAndSize: string
    padding: string
    cellsAndRows: string
    zebraStriping: string
    alternateColor: string
    tableBorders: string
    borderPreset: string
    grid: string
    rows: string
    columnsPreset: string
    noBorders: string
    borderThickness: string
    borderStyleLabel: string
  }

  // Settings Modal
  settings: {
    title: string
    language: string
    selectLanguage: string
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

  // Template validation
  validation: {
    invalidTemplate: string
    invalidTemplateHint: string
    missingVersion: string
    missingPageSettings: string
    missingElements: string
    invalidJson: string
    validTemplate: string
    templateValidationFailed: string
    selectAnotherFile: string
  }

  // Confirmations
  confirmations: {
    unsavedChanges: string
    deleteElement: string
    deleteGroup: string
    removeSection: string
  }

  // Application Menu (Native)
  menu: {
    file: string
    new: string
    open: string
    save: string
    saveAs: string
    exportPdf: string
    exit: string
    edit: string
    undo: string
    redo: string
    cut: string
    copy: string
    paste: string
    selectAll: string
    copyElement: string
    pasteElement: string
    deleteElement: string
    view: string
    reload: string
    forceReload: string
    toggleDevTools: string
    resetZoom: string
    zoomIn: string
    zoomOut: string
    toggleFullScreen: string
    window: string
    minimize: string
    zoom: string
    close: string
    help: string
    documentation: string
    reportIssue: string
    about: string
    language: string
  }

  // Canvas
  canvas: {
    addElements: string
    viaSidebar: string
    page: string
    dragHorizontalGuide: string
    dragVerticalGuide: string
    guideTooltip: string
    headerEnd: string
    footerStart: string
  }

  // Home Page
  home: {
    tagline: string
    whatDoYouWantToDo: string
    chooseOption: string
    openRecent: string
    continueWhereLeftOff: string
    newTemplate: string
    startFromScratch: string
    browseFile: string
    openFromComputer: string
    importJasper: string
    importJasperDesc: string
    importAI: string
    importAIDesc: string
    recentFiles: string
    noRecentFiles: string
    removeRecent: string
    switchThemeLight: string
    switchThemeDark: string
    selectLanguage: string
  }
}

export type TranslationKey = keyof Translations

