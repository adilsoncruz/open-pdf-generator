import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AppProviders } from './AppProviders'
import { useUIStore } from '../store/uiStore'

describe('AppProviders', () => {
  beforeEach(() => {
    useUIStore.setState({ theme: 'light' })
    document.documentElement.classList.remove('dark')
  })

  it('renders children correctly', () => {
    render(
      <AppProviders>
        <div data-testid="child-element">Hello World</div>
      </AppProviders>,
    )
    expect(screen.getByTestId('child-element')).toBeDefined()
    expect(screen.getByText('Hello World')).toBeDefined()
  })

  it('toggles dark class on documentElement based on theme', () => {
    render(
      <AppProviders>
        <div>Content</div>
      </AppProviders>,
    )
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => {
      useUIStore.getState().setTheme('dark')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    act(() => {
      useUIStore.getState().setTheme('light')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
