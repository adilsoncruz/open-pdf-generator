import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ListElementRenderer } from './ListElementRenderer'
import type { Element } from '../../../../store/templateStore'

describe('ListElementRenderer', () => {
  it('renders default placeholder list with bullets', () => {
    const element: Element = {
      id: 'list-1',
      type: 'list',
      x: 0,
      y: 0,
      width: 300,
      height: 60,
      listStyle: 'BULLETED',
    }
    const handleMouseDown = vi.fn()

    render(
      <ListElementRenderer
        element={element}
        isSelected={false}
        testData={null}
        onMouseDown={handleMouseDown}
      />
    )

    expect(screen.getByText('Primeiro item da lista')).toBeDefined()
    expect(screen.getByText('Segundo item com detalhamento')).toBeDefined()
    expect(screen.getByText('Terceiro item de exemplo')).toBeDefined()
    expect(screen.getAllByText(/•/).length).toBe(3)
  })

  it('renders numbered list with custom items from testData', () => {
    const element: Element = {
      id: 'list-2',
      type: 'list',
      x: 0,
      y: 0,
      width: 300,
      height: 60,
      dataBinding: 'fruits',
      listStyle: 'NUMBERED',
    }
    const testData = {
      fruits: ['Maçã', 'Banana'],
    }

    render(
      <ListElementRenderer
        element={element}
        isSelected={true}
        testData={testData}
        onMouseDown={vi.fn()}
      />
    )

    expect(screen.getByText('Maçã')).toBeDefined()
    expect(screen.getByText('Banana')).toBeDefined()
    expect(screen.getByText('1.')).toBeDefined()
    expect(screen.getByText('2.')).toBeDefined()
  })

  it('renders checklist with check boxes and handles testData', () => {
    const element: Element = {
      id: 'chk-1',
      type: 'check_list',
      x: 0,
      y: 0,
      width: 300,
      height: 60,
      dataBinding: 'tasks',
      checkStyle: 'CIRCLE',
    }
    const testData = {
      tasks: {
        'Deploy para Produção': true,
        'Escrever Testes': false,
      },
    }
    const handleMouseDown = vi.fn()

    const { container } = render(
      <ListElementRenderer
        element={element}
        isSelected={false}
        testData={testData}
        onMouseDown={handleMouseDown}
      />
    )

    expect(screen.getByText('Deploy para Produção')).toBeDefined()
    expect(screen.getByText('Escrever Testes')).toBeDefined()

    fireEvent.mouseDown(container.firstElementChild!)
    expect(handleMouseDown).toHaveBeenCalledTimes(1)
  })
})
