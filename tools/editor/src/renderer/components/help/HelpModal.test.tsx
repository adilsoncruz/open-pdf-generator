import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HelpModal from './HelpModal'
import ReExportedHelpModal from '../HelpModal'

describe('HelpModal and Modularized Tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  it('renders nothing when isOpen is false', () => {
    const onClose = vi.fn()
    render(<HelpModal isOpen={false} onClose={onClose} />)
    expect(screen.queryByText('Reference Guide')).not.toBeInTheDocument()
  })

  it('renders modal with default Expressions tab when isOpen is true', () => {
    const onClose = vi.fn()
    render(<HelpModal isOpen={true} onClose={onClose} />)

    expect(screen.getByText('Reference Guide')).toBeInTheDocument()
    expect(screen.getByText('Expressions & Conditions')).toBeInTheDocument()
    expect(screen.getByText('Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('Elements Guide')).toBeInTheDocument()
    // Default expressions active category is Text
    expect(screen.getByText('Transformations to manipulate strings and text.')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<HelpModal isOpen={true} onClose={onClose} />)

    const closeBtn = screen.getByRole('button', { name: 'Close' })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('switches between top-level tabs: Shortcuts and Elements', () => {
    const onClose = vi.fn()
    render(<HelpModal isOpen={true} onClose={onClose} />)

    // Switch to Shortcuts
    fireEvent.click(screen.getByText('Shortcuts'))
    expect(screen.getByText('Canvas & Selection')).toBeInTheDocument()
    expect(screen.getByText('Editing & Clipboard')).toBeInTheDocument()

    // Switch to Elements Guide
    fireEvent.click(screen.getByText('Elements Guide'))
    expect(screen.getByText('Text & Typography')).toBeInTheDocument()
    expect(screen.getByText(/Common Properties/i)).toBeInTheDocument()
  })

  it('navigates subcategories in Expressions tab and copies expression', async () => {
    const onClose = vi.fn()
    render(<HelpModal isOpen={true} onClose={onClose} />)

    // Switch subcategory to Numbers
    fireEvent.click(screen.getByRole('button', { name: /Numbers/i }))
    expect(screen.getByText('Formatting and operations with numbers.')).toBeInTheDocument()

    // Find and click copy button
    const copyButtons = screen.getAllByTitle('Copy expression')
    expect(copyButtons.length).toBeGreaterThan(0)
    fireEvent.click(copyButtons[0])
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('respects initialTab for backward-compatible subcategory like conditions', () => {
    const onClose = vi.fn()
    render(<HelpModal isOpen={true} onClose={onClose} initialTab="conditions" />)

    expect(screen.getByText('Boolean expressions to control when elements, groups, or sections are printed.')).toBeInTheDocument()
  })

  it('respects initialTab for shortcuts', () => {
    const onClose = vi.fn()
    render(<HelpModal isOpen={true} onClose={onClose} initialTab="shortcuts" />)

    expect(screen.getByText('Canvas & Selection')).toBeInTheDocument()
  })

  it('verifies re-exported HelpModal works identically', () => {
    const onClose = vi.fn()
    render(<ReExportedHelpModal isOpen={true} onClose={onClose} />)

    expect(screen.getByText('Reference Guide')).toBeInTheDocument()
  })
})
