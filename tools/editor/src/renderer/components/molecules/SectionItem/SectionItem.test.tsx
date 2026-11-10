import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SectionItem } from './SectionItem'

describe('SectionItem', () => {
  it('renders default inactive section item and matches snapshot', () => {
    const onClick = vi.fn()
    const { container } = render(<SectionItem label="Header" onClick={onClick} />)

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    fireEvent.click(screen.getByText('Header'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders active section item with rightContent and matches snapshot', () => {
    const { container } = render(
      <SectionItem
        label="Body"
        isActive={true}
        rightContent={<span data-testid="right-badge">Active</span>}
      />
    )

    expect(screen.getByTestId('right-badge')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('handles remove without confirm message', () => {
    const onRemove = vi.fn()
    render(<SectionItem label="Footer" onRemove={onRemove} />)

    const removeBtn = screen.getByTitle('Remove')
    fireEvent.click(removeBtn)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('handles remove with confirm dialog (accepted and canceled)', () => {
    const onRemove = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm')

    // 1. Canceled
    confirmSpy.mockReturnValue(false)
    const { unmount } = render(
      <SectionItem
        label="Summary"
        isActive={true}
        onRemove={onRemove}
        removeConfirmMessage="Remover seção?"
      />
    )
    fireEvent.click(screen.getByTitle('Remove'))
    expect(onRemove).not.toHaveBeenCalled()
    unmount()

    // 2. Confirmed
    confirmSpy.mockReturnValue(true)
    render(
      <SectionItem
        label="Summary"
        isActive={true}
        onRemove={onRemove}
        removeConfirmMessage="Remover seção?"
      />
    )
    fireEvent.click(screen.getByTitle('Remove'))
    expect(onRemove).toHaveBeenCalledTimes(1)

    confirmSpy.mockRestore()
  })
})
