import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  TypographySection,
  FontFamilyAndSizeControls,
  FontFormatControls,
  TextAlignControls,
  TextSpacingAndContentControls,
} from './index'
import { TypographySection as ReExportedTypographySection } from '../TypographySection'
import type { Element } from '../../../../../store/templateStore'

describe('TypographySection and modular typography controls', () => {
  const baseTextElement: Element = {
    id: 'text-1',
    type: 'text',
    x: 10,
    y: 20,
    width: 200,
    height: 50,
    value: 'Hello World',
    style: {
      fontFamily: 'Helvetica',
      fontSize: 14,
      fontWeight: 'bold',
      fontStyle: 'normal',
      alignment: 'left',
      verticalAlignment: 'center',
      textDecoration: 'none',
      textTransform: 'none',
      lineHeight: 1.2,
      letterSpacing: 0,
      multiline: false,
    },
  }

  describe('TypographySection orchestrator & accordion', () => {
    it('returns null for non-text element types', () => {
      const nonTextElement: Element = {
        id: 'rect-1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      const { container } = render(
        <TypographySection
          element={nonTextElement}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('renders typography controls for text element and toggles accordion', () => {
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      render(
        <TypographySection
          element={baseTextElement}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      // Header is rendered
      expect(screen.getByTestId('typography-accordion-toggle')).toBeInTheDocument()
      // Submodules are rendered when open
      expect(screen.getByTestId('font-family-select')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-bold-btn')).toBeInTheDocument()
      expect(screen.getByTestId('align-left-btn')).toBeInTheDocument()

      // Toggle accordion to close
      fireEvent.click(screen.getByTestId('typography-accordion-toggle'))
      expect(screen.queryByTestId('font-family-select')).not.toBeInTheDocument()

      // Toggle accordion to re-open
      fireEvent.click(screen.getByTestId('typography-accordion-toggle'))
      expect(screen.getByTestId('font-family-select')).toBeInTheDocument()
    })

    it('re-exported component matches behavior for 100% backward compatibility', () => {
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      render(
        <ReExportedTypographySection
          element={baseTextElement}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      expect(screen.getByTestId('typography-accordion-toggle')).toBeInTheDocument()
      expect(screen.getByTestId('font-family-select')).toBeInTheDocument()
    })
  })

  describe('FontFamilyAndSizeControls', () => {
    it('updates font family, font size, line height and letter spacing', () => {
      const onStyleUpdate = vi.fn()

      render(
        <FontFamilyAndSizeControls
          element={baseTextElement}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const fontSelect = screen.getByTestId('font-family-select') as HTMLSelectElement
      expect(fontSelect.value).toBe('Helvetica')
      fireEvent.change(fontSelect, { target: { value: 'Courier' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('fontFamily', 'Courier')

      const sizeSelect = screen.getByTestId('font-size-select') as HTMLSelectElement
      expect(sizeSelect.value).toBe('14')
      fireEvent.change(sizeSelect, { target: { value: '24' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('fontSize', 24)

      const lineHeightInput = screen.getByTestId('line-height-input') as HTMLInputElement
      expect(lineHeightInput.value).toBe('1.2')
      fireEvent.change(lineHeightInput, { target: { value: '1.5' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('lineHeight', 1.5)

      const letterSpacingInput = screen.getByTestId('letter-spacing-input') as HTMLInputElement
      expect(letterSpacingInput.value).toBe('0')
      fireEvent.change(letterSpacingInput, { target: { value: '1.5' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('letterSpacing', 1.5)
    })
  })

  describe('FontFormatControls', () => {
    it('toggles bold, italic, underline, strikethrough, uppercase and lowercase', () => {
      const onStyleUpdate = vi.fn()

      const element: Element = {
        ...baseTextElement,
        style: {
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'underline',
          textTransform: 'uppercase',
        },
      }

      render(
        <FontFormatControls
          element={element}
          onStyleUpdate={onStyleUpdate}
        />
      )

      // Bold is currently active, clicking toggles to normal
      const boldBtn = screen.getByTestId('toggle-bold-btn')
      expect(boldBtn).toHaveAttribute('aria-pressed', 'true')
      fireEvent.click(boldBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('fontWeight', 'normal')

      // Italic is currently inactive, clicking toggles to italic
      const italicBtn = screen.getByTestId('toggle-italic-btn')
      expect(italicBtn).toHaveAttribute('aria-pressed', 'false')
      fireEvent.click(italicBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('fontStyle', 'italic')

      // Underline is currently active, clicking toggles to none
      const underlineBtn = screen.getByTestId('toggle-underline-btn')
      expect(underlineBtn).toHaveAttribute('aria-pressed', 'true')
      fireEvent.click(underlineBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('textDecoration', 'none')

      // Strikethrough is currently inactive, clicking toggles to line-through
      const strikeBtn = screen.getByTestId('toggle-strikethrough-btn')
      expect(strikeBtn).toHaveAttribute('aria-pressed', 'false')
      fireEvent.click(strikeBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('textDecoration', 'line-through')

      // Uppercase is currently active, clicking toggles to none
      const uppercaseBtn = screen.getByTestId('toggle-uppercase-btn')
      expect(uppercaseBtn).toHaveAttribute('aria-pressed', 'true')
      fireEvent.click(uppercaseBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('textTransform', 'none')

      // Lowercase is currently inactive, clicking toggles to lowercase
      const lowercaseBtn = screen.getByTestId('toggle-lowercase-btn')
      expect(lowercaseBtn).toHaveAttribute('aria-pressed', 'false')
      fireEvent.click(lowercaseBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('textTransform', 'lowercase')
    })
  })

  describe('TextAlignControls', () => {
    it('updates horizontal alignment', () => {
      const onStyleUpdate = vi.fn()

      render(
        <TextAlignControls
          element={baseTextElement}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const centerBtn = screen.getByTestId('align-center-btn')
      fireEvent.click(centerBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('alignment', 'center')

      const rightBtn = screen.getByTestId('align-right-btn')
      fireEvent.click(rightBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('alignment', 'right')

      const justifyBtn = screen.getByTestId('align-justify-btn')
      fireEvent.click(justifyBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('alignment', 'justify')
    })

    it('updates vertical alignment', () => {
      const onStyleUpdate = vi.fn()

      render(
        <TextAlignControls
          element={baseTextElement}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const topBtn = screen.getByTestId('vertical-align-top-btn')
      fireEvent.click(topBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('verticalAlignment', 'top')

      const bottomBtn = screen.getByTestId('vertical-align-bottom-btn')
      fireEvent.click(bottomBtn)
      expect(onStyleUpdate).toHaveBeenCalledWith('verticalAlignment', 'bottom')
    })
  })

  describe('TextSpacingAndContentControls', () => {
    it('toggles multiline and renders flow settings when enabled', () => {
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      const { rerender } = render(
        <TextSpacingAndContentControls
          element={baseTextElement}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const multilineCheckbox = screen.getByTestId('multiline-checkbox')
      expect(multilineCheckbox).not.toBeChecked()
      expect(screen.queryByTestId('first-line-indent-input')).not.toBeInTheDocument()

      fireEvent.click(multilineCheckbox)
      expect(onStyleUpdate).toHaveBeenCalledWith('multiline', true)

      // Rerender with multiline = true
      rerender(
        <TextSpacingAndContentControls
          element={{
            ...baseTextElement,
            style: { ...baseTextElement.style, multiline: true },
          }}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const indentInput = screen.getByTestId('first-line-indent-input')
      expect(indentInput).toBeInTheDocument()
      fireEvent.change(indentInput, { target: { value: '15' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('firstLineIndent', 15)

      const overflowSelect = screen.getByTestId('overflow-select')
      fireEvent.change(overflowSelect, { target: { value: 'hidden' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('overflow', 'hidden')
    })

    it('updates internal margins / paddings', () => {
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      render(
        <TextSpacingAndContentControls
          element={baseTextElement}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const topInput = screen.getByTestId('padding-top-input')
      fireEvent.change(topInput, { target: { value: '8' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('paddingTop', 8)
      expect(onStyleUpdate).toHaveBeenCalledWith('marginTop', 8)

      const rightInput = screen.getByTestId('padding-right-input')
      fireEvent.change(rightInput, { target: { value: '6' } })
      expect(onStyleUpdate).toHaveBeenCalledWith('paddingRight', 6)
      expect(onStyleUpdate).toHaveBeenCalledWith('marginRight', 6)
    })

    it('does not render text-content-textarea for text element (dynamic text)', () => {
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      render(
        <TextSpacingAndContentControls
          element={baseTextElement}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      expect(screen.queryByTestId('text-content-textarea')).toBeNull()
    })

    it('renders text-content-textarea for static_text element', () => {
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      render(
        <TextSpacingAndContentControls
          element={{ ...baseTextElement, type: 'static_text', value: 'Static Label' }}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const textarea = screen.getByTestId('text-content-textarea')
      expect(textarea).toBeInTheDocument()
      fireEvent.change(textarea, { target: { value: 'New Static' } })
      expect(onUpdate).toHaveBeenCalledWith('value', 'New Static')
    })

    it('updates text value and handles link URL for link elements', () => {
      const onUpdate = vi.fn()
      const onStyleUpdate = vi.fn()

      const linkElement: Element = {
        ...baseTextElement,
        type: 'link',
        url: 'https://initial.com',
      }

      render(
        <TextSpacingAndContentControls
          element={linkElement}
          onUpdate={onUpdate}
          onStyleUpdate={onStyleUpdate}
        />
      )

      const textarea = screen.getByTestId('text-content-textarea')
      fireEvent.change(textarea, { target: { value: 'Updated Link Text' } })
      expect(onUpdate).toHaveBeenCalledWith('value', 'Updated Link Text')

      const urlInput = screen.getByTestId('target-url-input')
      fireEvent.change(urlInput, { target: { value: 'https://new-url.com' } })
      expect(onUpdate).toHaveBeenCalledWith('url', 'https://new-url.com')
    })
  })
})
