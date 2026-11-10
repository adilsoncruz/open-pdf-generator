import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { DropdownMenu } from './DropdownMenu/DropdownMenu'
import { TreeItem } from './TreeItem/TreeItem'
import { Accordion } from './Accordion/Accordion'
import { PropertyGroup } from './PropertyGroup/PropertyGroup'
import { TabBar } from './TabBar/TabBar'
import { FormField } from './FormField/FormField'
import { Divider } from '../atoms/Divider/Divider'
import { Label } from '../atoms/Label/Label'

describe('Design System Molecules and Atoms', () => {
  it('DropdownMenu opens and closes on trigger click and outside click', () => {
    const onOpenChange = vi.fn()
    const { getByText, rerender } = render(
      <DropdownMenu
        trigger={<button>Menu</button>}
        isOpen={false}
        onOpenChange={onOpenChange}
      >
        <div>Item 1</div>
      </DropdownMenu>
    )

    fireEvent.click(getByText('Menu'))
    expect(onOpenChange).toHaveBeenCalledWith(true)

    rerender(
      <DropdownMenu
        trigger={<button>Menu</button>}
        isOpen={true}
        onOpenChange={onOpenChange}
      >
        <div>Item 1</div>
      </DropdownMenu>
    )
    expect(getByText('Item 1')).toBeInTheDocument()
    expect(document.body).toMatchSnapshot()

    // Outside click
    fireEvent.mouseDown(document.body)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('TreeItem renders label, triggers select and toggle', () => {
    const onSelect = vi.fn()
    const onToggleExpand = vi.fn()
    const onToggleVisibility = vi.fn()

    const { getByText, getByRole } = render(
      <TreeItem
        id="node-1"
        label="Node 1"
        hasChildren={true}
        isExpanded={true}
        isVisible={true}
        onSelect={onSelect}
        onToggleExpand={onToggleExpand}
        onToggleVisibility={onToggleVisibility}
      />
    )

    fireEvent.click(getByText('Node 1'))
    expect(onSelect).toHaveBeenCalled()

    const buttons = document.querySelectorAll('button')
    if (buttons.length > 0) {
      fireEvent.click(buttons[0])
      expect(onToggleExpand).toHaveBeenCalled()
    }
  })

  it('Accordion toggles content', () => {
    const { getByText, queryByText } = render(
      <Accordion title="Details" defaultOpen={false}>
        <div>Expanded content</div>
      </Accordion>
    )

    expect(queryByText('Expanded content')).not.toBeInTheDocument()
    fireEvent.click(getByText('Details'))
    expect(getByText('Expanded content')).toBeInTheDocument()
  })

  it('PropertyGroup collapses and expands', () => {
    const { getByText, queryByText } = render(
      <PropertyGroup title="Settings" defaultExpanded={true} collapsible={true}>
        <div>Prop content</div>
      </PropertyGroup>
    )

    expect(getByText('Prop content')).toBeInTheDocument()
    fireEvent.click(getByText('Settings'))
    expect(queryByText('Prop content')).not.toBeInTheDocument()
  })

  it('TabBar switches active tabs', () => {
    const onTabChange = vi.fn()
    const { getByText } = render(
      <TabBar
        tabs={[
          { id: 'tab1', label: 'Tab 1' },
          { id: 'tab2', label: 'Tab 2' },
        ]}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    )

    fireEvent.click(getByText('Tab 2'))
    expect(onTabChange).toHaveBeenCalledWith('tab2')
  })

  it('FormField, Divider, Label render properly', () => {
    const { getByText, container } = render(
      <div>
        <Label>My Label</Label>
        <Divider />
        <FormField label="Field Name" hint="Some hint">
          <input />
        </FormField>
      </div>
    )

    expect(getByText('My Label')).toBeInTheDocument()
    expect(getByText('Field Name')).toBeInTheDocument()
    expect(getByText(/\(Some hint\)/)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
