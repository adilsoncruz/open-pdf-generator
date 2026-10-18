import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RulersAndGuides, Guide } from './RulersAndGuides'

describe('RulersAndGuides', () => {
  it('renders correctly with given guides', () => {
    const guides: Guide[] = [
      { id: '1', pos: 100, type: 'horizontal' },
      { id: '2', pos: 200, type: 'vertical' }
    ]
    const setGuides = vi.fn()
    
    render(
      <RulersAndGuides 
        width={800} 
        height={600} 
        scale={1} 
        guides={guides} 
        setGuides={setGuides} 
      />
    )
    
    // There should be two guides rendered
    // We can't directly query by role easily because they are just absolute divs, 
    // but we can query by style or role if we added one. 
    // We'll rely on checking container children or modifying the component to have test-ids later.
    expect(document.querySelectorAll('.pointer-events-auto.flex')).toHaveLength(2)
  })

  it('removes guide on double click', () => {
    const guides: Guide[] = [
      { id: '1', pos: 100, type: 'horizontal' }
    ]
    const setGuides = vi.fn()
    
    render(
      <RulersAndGuides 
        width={800} 
        height={600} 
        scale={1} 
        guides={guides} 
        setGuides={setGuides} 
      />
    )
    
    const guideElement = document.querySelector('.pointer-events-auto.flex')
    expect(guideElement).not.toBeNull()
    
    fireEvent.doubleClick(guideElement!)
    
    expect(setGuides).toHaveBeenCalled()
    // Extract the callback passed to setGuides
    const stateUpdater = setGuides.mock.calls[0][0]
    const nextState = stateUpdater(guides)
    expect(nextState).toHaveLength(0)
  })
})
