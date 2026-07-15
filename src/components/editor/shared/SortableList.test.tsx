import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SortableList } from './SortableList'

interface Item {
  id: string
  label: string
}

const items: Item[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

describe('SortableList', () => {
  it('renders each item in order via the render-prop', () => {
    render(
      <SortableList items={items} onReorder={vi.fn()}>
        {(item) => <div key={item.id}>{item.label}</div>}
      </SortableList>,
    )

    const rendered = screen.getAllByText(/Alpha|Beta|Gamma/)
    expect(rendered.map((el) => el.textContent)).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('applies the given className to the list container', () => {
    const { container } = render(
      <SortableList items={items} onReorder={vi.fn()} className="my-list-class">
        {(item) => <div key={item.id}>{item.label}</div>}
      </SortableList>,
    )

    expect(container.querySelector('.my-list-class')).not.toBeNull()
  })

  it('renders nothing extra when the items list is empty', () => {
    render(
      <SortableList items={[]} onReorder={vi.fn()}>
        {(item: Item) => <div key={item.id}>{item.label}</div>}
      </SortableList>,
    )

    expect(screen.queryByText(/Alpha|Beta|Gamma/)).not.toBeInTheDocument()
  })
})
