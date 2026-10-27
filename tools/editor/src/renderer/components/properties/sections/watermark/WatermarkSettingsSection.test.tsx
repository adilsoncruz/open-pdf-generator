import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { WatermarkSettingsSection } from './WatermarkSettingsSection'
import { WatermarkSettingsSection as ReExportedSection } from '../WatermarkSettingsSection'
import { useTemplateStore } from '../../../../store/templateStore'

describe('WatermarkSettingsSection and modular watermark controls', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Test Template' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
      },
    })
  })

  it('renders activation toggle when watermark is initially disabled', () => {
    render(<WatermarkSettingsSection />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    expect(screen.getByText("Marca d'Água (Watermark)")).toBeInTheDocument()
    expect(screen.queryByText('Tipo de Marca:')).not.toBeInTheDocument()
  })

  it('enables default text watermark when toggled on, and disables when toggled off', () => {
    render(<WatermarkSettingsSection />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    const watermark = useTemplateStore.getState().template.pageSettings.watermark
    expect(watermark).toBeDefined()
    expect(watermark?.type).toBe('text')
    expect(watermark?.text).toBe('CONFIDENTIAL')
    expect(watermark?.fontSize).toBe(60)

    // Uncheck to disable
    fireEvent.click(checkbox)
    expect(useTemplateStore.getState().template.pageSettings.watermark).toBeUndefined()
  })

  it('renders and updates text controls when watermark type is text', () => {
    useTemplateStore.getState().updateWatermark({
      type: 'text',
      text: 'DRAFT',
      dataBinding: 'user.status',
      fontSize: 48,
      fontStyle: 'normal',
      color: '#6366f1',
    })

    render(<WatermarkSettingsSection />)

    expect(screen.getByText('Tipo de Marca:')).toBeInTheDocument()
    const textInput = screen.getByPlaceholderText('Ex: CONFIDENTIAL, DRAFT') as HTMLInputElement
    expect(textInput.value).toBe('DRAFT')

    fireEvent.change(textInput, { target: { value: 'TOP SECRET' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.text).toBe('TOP SECRET')

    const bindingInput = screen.getByPlaceholderText('Ex: status, watermarkText') as HTMLInputElement
    expect(bindingInput.value).toBe('user.status')
    fireEvent.change(bindingInput, { target: { value: 'doc.state' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.dataBinding).toBe('doc.state')

    const fontSizeInput = screen.getByDisplayValue('48') as HTMLInputElement
    fireEvent.change(fontSizeInput, { target: { value: '72' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.fontSize).toBe(72)

    const fontStyleSelect = screen.getByDisplayValue('Normal') as HTMLSelectElement
    fireEvent.change(fontStyleSelect, { target: { value: 'italic' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.fontStyle).toBe('italic')
  })

  it('switches between text and image modes and updates image properties', () => {
    useTemplateStore.getState().updateWatermark({
      type: 'text',
      text: 'SAMPLE',
    })

    render(<WatermarkSettingsSection />)

    const imageBtn = screen.getByRole('button', { name: 'Imagem' })
    fireEvent.click(imageBtn)

    expect(useTemplateStore.getState().template.pageSettings.watermark?.type).toBe('image')
    expect(screen.getByText('Procurar Imagem Local')).toBeInTheDocument()

    // Update image source via input
    const urlInput = screen.getByPlaceholderText('https://exemplo.com/logo.png') as HTMLInputElement
    fireEvent.change(urlInput, { target: { value: 'https://example.com/watermark.png' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.imageSource).toBe('https://example.com/watermark.png')

    // Update dimensions
    const [widthInput, heightInput] = screen.getAllByPlaceholderText('Auto') as HTMLInputElement[]
    fireEvent.change(widthInput, { target: { value: '250' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.width).toBe(250)

    fireEvent.change(heightInput, { target: { value: '180' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.height).toBe(180)
  })

  it('renders and updates general controls (rotation, opacity, onTop, repeat, printCondition)', () => {
    useTemplateStore.getState().updateWatermark({
      type: 'text',
      text: 'WATERMARK',
      rotation: 45,
      opacity: 0.2,
      onTop: false,
      repeat: false,
    })

    render(<WatermarkSettingsSection />)

    const checkboxes = screen.getAllByRole('checkbox')
    // checkboxes[0] is activation toggle
    // checkboxes[1] is onTop
    // checkboxes[2] is repeat
    expect(checkboxes[1]).not.toBeChecked()
    fireEvent.click(checkboxes[1])
    expect(useTemplateStore.getState().template.pageSettings.watermark?.onTop).toBe(true)

    expect(checkboxes[2]).not.toBeChecked()
    fireEvent.click(checkboxes[2])
    expect(useTemplateStore.getState().template.pageSettings.watermark?.repeat).toBe(true)

    // Repeat spacing controls should now be visible
    expect(screen.getByText('Espaçamento Horizontal:')).toBeInTheDocument()
    expect(screen.getByText('Espaçamento Vertical:')).toBeInTheDocument()

    // Print condition input
    const conditionInput = screen.getByPlaceholderText("Ex: status == 'draft'") as HTMLInputElement
    fireEvent.change(conditionInput, { target: { value: 'isDraft == true' } })
    expect(useTemplateStore.getState().template.pageSettings.watermark?.printCondition).toBe('isDraft == true')
  })

  it('re-exported component matches behavior for backward compatibility', () => {
    useTemplateStore.getState().updateWatermark({
      type: 'text',
      text: 'COMPATIBILITY_CHECK',
    })

    render(<ReExportedSection />)

    const input = screen.getByDisplayValue('COMPATIBILITY_CHECK')
    expect(input).toBeInTheDocument()
  })
})
