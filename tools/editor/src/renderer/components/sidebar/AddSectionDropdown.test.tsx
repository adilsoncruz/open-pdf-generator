import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { AddSectionDropdown } from './AddSectionDropdown'
import { useTemplateStore } from '../../store/templateStore'

describe('AddSectionDropdown', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      template: {
        version: '1.0',
        metadata: { name: 'Doc' },
        pageSettings: {
          size: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        page: [],
        groups: [],
      } as any,
    })
  })

  it('renders trigger button and calls onToggle', () => {
    const onToggle = vi.fn()
    const { getByRole, container } = render(
      <AddSectionDropdown
        show={false}
        onToggle={onToggle}
        onClose={vi.fn()}
        currentSection="body"
      />
    )

    fireEvent.click(getByRole('button'))
    expect(onToggle).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  it('renders open menu with section options, matches snapshot, and triggers add actions', () => {
    const onClose = vi.fn()
    const { getByText, container } = render(
      <AddSectionDropdown
        show={true}
        onToggle={vi.fn()}
        onClose={onClose}
        currentSection="body"
      />
    )

    expect(getByText(/Adicionar Seção/i)).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Add Header
    fireEvent.click(getByText('Header Band'))
    expect(onClose).toHaveBeenCalled()

    // Add Summary
    fireEvent.click(getByText('Summary Band'))

    // Add Footer
    fireEvent.click(getByText('Footer Band'))

    // Add Background
    fireEvent.click(getByText('Background Layer'))

    // Add Container
    fireEvent.click(getByText(/Container \(em BODY\)/))
  })
})
