import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SchemaSearchBar } from './SchemaSearchBar'
import React from 'react'

describe('SchemaSearchBar', () => {
  it('renders search bar and triggers callbacks', () => {
    const inputRef = React.createRef<HTMLInputElement>()
    const onSearchTermChange = vi.fn()
    const onToggleCaseSensitive = vi.fn()
    const onPrevMatch = vi.fn()
    const onNextMatch = vi.fn()
    const onClose = vi.fn()

    const { getByPlaceholderText, getByTitle, getByText } = render(
      <SchemaSearchBar
        searchInputRef={inputRef}
        searchTerm="customer"
        onSearchTermChange={onSearchTermChange}
        searchMatches={[1, 5, 10]}
        currentMatchIndex={1}
        caseSensitive={false}
        onToggleCaseSensitive={onToggleCaseSensitive}
        onPrevMatch={onPrevMatch}
        onNextMatch={onNextMatch}
        onClose={onClose}
      />
    )

    const input = getByPlaceholderText('Buscar no schema...')
    fireEvent.change(input, { target: { value: 'items' } })
    expect(onSearchTermChange).toHaveBeenCalledWith('items')

    // Escape closes
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()

    // Enter goes to next match
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    expect(onNextMatch).toHaveBeenCalled()

    // Shift+Enter goes to prev match
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(onPrevMatch).toHaveBeenCalled()

    // Button clicks
    fireEvent.click(getByText('Aa'))
    expect(onToggleCaseSensitive).toHaveBeenCalled()

    fireEvent.click(getByTitle('Anterior (Shift+Enter)'))
    expect(onPrevMatch).toHaveBeenCalledTimes(2)

    fireEvent.click(getByTitle('Próxima (Enter)'))
    expect(onNextMatch).toHaveBeenCalledTimes(2)

    fireEvent.click(getByText('✕'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
