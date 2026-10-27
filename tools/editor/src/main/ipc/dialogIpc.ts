import { ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import { getMainWindow } from '../window/mainWindow'
import { convertJrxmlToJson } from '../services/cliManager'
import type { OpenFileResult } from '../types'

export function registerDialogIpc(): void {
  ipcMain.handle('dialog:openFile', async () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return null

    console.log('dialog:openFile')
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JSON Templates', extensions: ['json'] },
        { name: 'Jasper Templates', extensions: ['jrxml'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const extension = path.extname(filePath).toLowerCase()

    if (extension === '.jrxml') {
      const conversion = await convertJrxmlToJson(filePath)
      if (!conversion.success || !conversion.content) {
        throw new Error(conversion.error || 'Failed to convert JRXML template')
      }
      const jsonPath = filePath.replace(/\.jrxml$/i, '.json')
      await fs.writeFile(jsonPath, conversion.content)
      const openResult: OpenFileResult = {
        path: jsonPath,
        content: conversion.content,
        convertedFromJasper: true,
      }
      return openResult
    }

    const content = await fs.readFile(filePath, 'utf-8')
    return {
      path: filePath,
      content,
    } as OpenFileResult
  })

  ipcMain.handle('dialog:openJasperFile', async () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return null

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JasperReports Templates (*.jrxml)', extensions: ['jrxml'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      title: 'Importar Template Jasper (.jrxml)',
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const content = await fs.readFile(filePath, 'utf-8')
    return {
      path: filePath,
      content,
      isJrxml: true,
    }
  })

  ipcMain.handle('dialog:openPdfFile', async () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return null

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Documentos PDF (*.pdf)', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      title: 'Selecionar PDF para Análise com IA',
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const buffer = await fs.readFile(filePath)
    return {
      path: filePath,
      name: path.basename(filePath),
      base64: buffer.toString('base64'),
    }
  })

  ipcMain.handle('dialog:openDataFile', async () => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return null

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'JSON Data Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      title: 'Selecionar Arquivo de Dados JSON',
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const content = await fs.readFile(filePath, 'utf-8')

    return {
      path: filePath,
      content,
    }
  })

  ipcMain.handle('dialog:saveFile', async (_, content: string, defaultPath?: string) => {
    const mainWindow = getMainWindow()
    if (!mainWindow) return null

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: [
        { name: 'JSON Templates', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    await fs.writeFile(result.filePath, content, 'utf-8')
    return result.filePath
  })

  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return { success: true, content }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })
}
