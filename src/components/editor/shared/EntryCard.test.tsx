import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { EntryCard } from './EntryCard'

/** EntryCard uses useSortable, which requires a DndContext/SortableContext ancestor. */
function renderSortable(ui: ReactElement) {
  return render(
    <DndContext>
      <SortableContext items={['entry-1']}>{ui}</SortableContext>
    </DndContext>,
  )
}

describe('EntryCard', () => {
  it('renders the summary and starts collapsed by default', () => {
    renderSortable(
      <EntryCard
        id="entry-1"
        summaryTitle="Engineer @ Acme"
        summarySubtitle="Apr 2023 – Present"
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        deleteConfirmTitle="Delete?"
        deleteConfirmDescription="Sure?"
      >
        <p>Entry form fields</p>
      </EntryCard>,
    )

    expect(screen.getByText('Engineer @ Acme')).toBeInTheDocument()
    expect(screen.getByText('Apr 2023 – Present')).toBeInTheDocument()
    expect(screen.queryByText('Entry form fields')).not.toBeInTheDocument()
  })

  it('starts expanded when defaultExpanded is true', () => {
    renderSortable(
      <EntryCard
        id="entry-1"
        summaryTitle="Engineer @ Acme"
        defaultExpanded
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        deleteConfirmTitle="Delete?"
        deleteConfirmDescription="Sure?"
      >
        <p>Entry form fields</p>
      </EntryCard>,
    )

    expect(screen.getByText('Entry form fields')).toBeInTheDocument()
  })

  it('toggles expand/collapse', async () => {
    const user = userEvent.setup()
    renderSortable(
      <EntryCard
        id="entry-1"
        summaryTitle="Engineer @ Acme"
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        deleteConfirmTitle="Delete?"
        deleteConfirmDescription="Sure?"
      >
        <p>Entry form fields</p>
      </EntryCard>,
    )

    await user.click(screen.getByRole('button', { name: 'Expand entry' }))
    expect(screen.getByText('Entry form fields')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Collapse entry' }))
    expect(screen.queryByText('Entry form fields')).not.toBeInTheDocument()
  })

  it('calls onDuplicate when the duplicate button is clicked', async () => {
    const user = userEvent.setup()
    const onDuplicate = vi.fn()
    renderSortable(
      <EntryCard
        id="entry-1"
        summaryTitle="Engineer @ Acme"
        onDuplicate={onDuplicate}
        onDelete={vi.fn()}
        deleteConfirmTitle="Delete?"
        deleteConfirmDescription="Sure?"
      >
        <p>Entry form fields</p>
      </EntryCard>,
    )

    await user.click(screen.getByRole('button', { name: 'Duplicate entry' }))
    expect(onDuplicate).toHaveBeenCalledOnce()
  })

  it('deletes only after confirming', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderSortable(
      <EntryCard
        id="entry-1"
        summaryTitle="Engineer @ Acme"
        onDuplicate={vi.fn()}
        onDelete={onDelete}
        deleteConfirmTitle="Delete this?"
        deleteConfirmDescription="Sure?"
      >
        <p>Entry form fields</p>
      </EntryCard>,
    )

    await user.click(screen.getByRole('button', { name: 'Delete entry' }))
    expect(screen.getByText('Delete this?')).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('exposes an accessible drag handle for keyboard reordering', () => {
    renderSortable(
      <EntryCard
        id="entry-1"
        summaryTitle="Engineer @ Acme"
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        deleteConfirmTitle="Delete?"
        deleteConfirmDescription="Sure?"
      >
        <p>Entry form fields</p>
      </EntryCard>,
    )

    const handle = screen.getByRole('button', { name: 'Drag to reorder entry' })
    expect(handle).toHaveAttribute('tabindex', '0')
  })
})
