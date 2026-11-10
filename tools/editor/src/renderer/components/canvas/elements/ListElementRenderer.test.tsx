import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ListElementRenderer } from './ListElementRenderer'
import type { Element } from '../../../store/templateStore'

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

  it('renders custom static items and background color', () => {
    const element: Element = {
      id: 'list-3',
      type: 'list',
      x: 0,
      y: 0,
      width: 250,
      height: 80,
      listStyle: 'NUMBERED',
      startNumber: 5,
      items: ['teste 1', 'teste 2', 'teste 3'],
      style: {
        backgroundColor: '#f1f5f9',
      },
    }

    const { container } = render(
      <ListElementRenderer
        element={element}
        isSelected={false}
        testData={null}
      />
    )

    expect(screen.getByText('teste 1')).toBeDefined()
    expect(screen.getByText('teste 2')).toBeDefined()
    expect(screen.getByText('teste 3')).toBeDefined()
    expect(screen.getByText('5.')).toBeDefined()
    expect(screen.getByText('6.')).toBeDefined()
    expect(screen.getByText('7.')).toBeDefined()

    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundColor).toBe('rgb(241, 245, 249)')
    expect(el.style.width).toBe('250px')
    expect(el.style.height).toBe('80px')
  })

  it('renders START, DASH, DIAMOND list styles, checklist with array items, and snapshot', () => {
    const listStyles = ['START', 'DASH', 'DIAMOND'] as const

    listStyles.forEach((style) => {
      const { container } = render(
        <ListElementRenderer
          element={{
            id: `list-${style}`,
            type: 'list',
            width: 200,
            height: 50,
            listStyle: style,
            items: ['Item 1'],
          }}
          isSelected={false}
          testData={null}
        />
      )
      expect(container).toMatchSnapshot()
    })

    // Checklist with array items
    const { container: clContainer } = render(
      <ListElementRenderer
        element={{
          id: 'chk-arr',
          type: 'check_list',
          width: 250,
          height: 60,
          items: ['Task 1', 'Task 2'],
        }}
        isSelected={false}
        testData={null}
      />
    )
    expect(clContainer).toMatchSnapshot()
  })
})
