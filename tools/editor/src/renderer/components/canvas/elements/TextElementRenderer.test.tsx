import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { TextElementRenderer } from './TextElementRenderer'
import type { Element } from '../../../store/templateStore'

describe('TextElementRenderer', () => {
  const baseElement: Element = {
    id: 'txt-1',
    type: 'text',
    value: 'Hello World',
    width: 200,
    height: 50,
    style: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333333',
      alignment: 'center',
      verticalAlignment: 'center',
      paddingX: 4,
      paddingY: 2,
    },
  }

  it('renders normal text and matches snapshot', () => {
    const onMouseDown = vi.fn()
    const onDoubleClick = vi.fn()
    const resolveDisplayText = vi.fn((el) => el.value || '')

    const { container, getByText } = render(
      <TextElementRenderer
        element={baseElement}
        isSelected={false}
        isEditingText={false}
        editingValue=""
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onTextChange={vi.fn()}
        onTextBlur={vi.fn()}
        onTextKeyDown={vi.fn()}
        resolveDisplayText={resolveDisplayText}
      />
    )

    expect(container).toMatchSnapshot()
    expect(getByText('Hello World')).toBeInTheDocument()

    // Test mouse down & double click
    fireEvent.mouseDown(getByText('Hello World'))
    expect(onMouseDown).toHaveBeenCalled()

    fireEvent.doubleClick(getByText('Hello World'))
    expect(onDoubleClick).toHaveBeenCalled()
  })

  it('renders editing textarea and handles text changes, blur, and keyDown', () => {
    const onTextChange = vi.fn()
    const onTextBlur = vi.fn()
    const onTextKeyDown = vi.fn()

    const { container } = render(
      <TextElementRenderer
        element={baseElement}
        isSelected={true}
        isEditingText={true}
        editingValue="Editing text"
        onMouseDown={vi.fn()}
        onDoubleClick={vi.fn()}
        onTextChange={onTextChange}
        onTextBlur={onTextBlur}
        onTextKeyDown={onTextKeyDown}
        resolveDisplayText={(el) => el.value || ''}
      />
    )

    expect(container).toMatchSnapshot()

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea.value).toBe('Editing text')

    fireEvent.change(textarea, { target: { value: 'Updated text' } })
    expect(onTextChange).toHaveBeenCalledWith('Updated text')

    fireEvent.blur(textarea)
    expect(onTextBlur).toHaveBeenCalled()

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onTextKeyDown).toHaveBeenCalled()
  })

  it('renders multiline and link styles with alignment variants: top, bottom, justify, right', () => {
    const multilineElement: Element = {
      id: 'link-1',
      type: 'link',
      value: 'https://example.com',
      positionMode: 'RELATIVE',
      effectiveWidth: 350,
      style: {
        multiline: true,
        firstLineIndent: 15,
        alignment: 'justify',
        verticalAlignment: 'bottom',
        borderWidth: 2,
        borderColor: '#ff0000',
        borderStyle: 'dashed',
        backgroundColor: '#f0f0f0',
        cornerRadius: 4,
        paddingTop: 8,
        paddingRight: 6,
        paddingBottom: 8,
        paddingLeft: 6,
      },
    }

    const { container, rerender } = render(
      <TextElementRenderer
        element={multilineElement}
        effectiveWidth={350}
        isSelected={true}
        isEditingText={false}
        editingValue=""
        onMouseDown={vi.fn()}
        onDoubleClick={vi.fn()}
        onTextChange={vi.fn()}
        onTextBlur={vi.fn()}
        onTextKeyDown={vi.fn()}
        resolveDisplayText={(el) => el.value || ''}
      />
    )

    expect(container).toMatchSnapshot()

    // Test top & right alignment
    rerender(
      <TextElementRenderer
        element={{
          ...multilineElement,
          style: {
            ...multilineElement.style,
            multiline: false,
            alignment: 'right',
            verticalAlignment: 'top',
          },
        }}
        isSelected={false}
        isEditingText={false}
        editingValue=""
        onMouseDown={vi.fn()}
        onDoubleClick={vi.fn()}
        onTextChange={vi.fn()}
        onTextBlur={vi.fn()}
        onTextKeyDown={vi.fn()}
        resolveDisplayText={(el) => el.value || ''}
      />
    )
    expect(container).toMatchSnapshot()

    // Test justify and bottom in non-multiline mode
    rerender(
      <TextElementRenderer
        element={{
          ...multilineElement,
          style: {
            ...multilineElement.style,
            multiline: false,
            alignment: 'justify',
            verticalAlignment: 'bottom',
          },
        }}
        isSelected={false}
        isEditingText={false}
        editingValue=""
        onMouseDown={vi.fn()}
        onDoubleClick={vi.fn()}
        onTextChange={vi.fn()}
        onTextBlur={vi.fn()}
        onTextKeyDown={vi.fn()}
        resolveDisplayText={(el) => el.value || ''}
      />
    )

    // Test right & center in multiline mode, and undefined alignment
    rerender(
      <TextElementRenderer
        element={{
          ...multilineElement,
          style: {
            ...multilineElement.style,
            multiline: true,
            alignment: 'center',
          },
        }}
        isSelected={false}
        isEditingText={false}
        editingValue=""
        onMouseDown={vi.fn()}
        onDoubleClick={vi.fn()}
        onTextChange={vi.fn()}
        onTextBlur={vi.fn()}
        onTextKeyDown={vi.fn()}
        resolveDisplayText={(el) => el.value || ''}
      />
    )

    rerender(
      <TextElementRenderer
        element={{
          ...multilineElement,
          style: {
            ...multilineElement.style,
            multiline: false,
            alignment: undefined,
          },
        }}
        isSelected={false}
        isEditingText={false}
        editingValue=""
        onMouseDown={vi.fn()}
        onDoubleClick={vi.fn()}
        onTextChange={vi.fn()}
        onTextBlur={vi.fn()}
        onTextKeyDown={vi.fn()}
        resolveDisplayText={(el) => el.value || ''}
      />
    )

    rerender(
      <TextElementRenderer
        element={{
          ...multilineElement,
          style: {
            ...multilineElement.style,
            multiline: true,
            alignment: 'left',
          },
        }}
        isSelected={false}
        isEditingText={false}
        editingValue=""
        onMouseDown={vi.fn()}
        onDoubleClick={vi.fn()}
        onTextChange={vi.fn()}
        onTextBlur={vi.fn()}
        onTextKeyDown={vi.fn()}
        resolveDisplayText={(el) => el.value || ''}
      />
    )
  })
})
