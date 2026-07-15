import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SaveStatusChip } from './SaveStatusChip'
import { useSaveStatusStore } from '../../store/useSaveStatusStore'

describe('SaveStatusChip', () => {
  beforeEach(() => {
    useSaveStatusStore.setState({ status: 'saved', lastSavedAt: null, pendingCount: 0 })
  })

  it('shows "Saving…" while a debounced write is pending', () => {
    useSaveStatusStore.setState({ status: 'saving' })
    render(<SaveStatusChip />)
    expect(screen.getByText(/saving/i)).toBeInTheDocument()
  })

  it('shows "Saved ✓" with a formatted time once persisted', () => {
    const timestamp = new Date('2026-07-14T12:04:00')
    useSaveStatusStore.setState({ status: 'saved', lastSavedAt: timestamp.toISOString() })
    render(<SaveStatusChip />)

    const expectedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    expect(screen.getByText(new RegExp(`Saved.*${expectedTime}`))).toBeInTheDocument()
  })

  it('exposes the status via an aria-live polite region', () => {
    render(<SaveStatusChip />)
    const chip = screen.getByRole('status')
    expect(chip).toHaveAttribute('aria-live', 'polite')
  })

  it('shows plain "Saved ✓" with no timestamp before any save has ever completed', () => {
    render(<SaveStatusChip />)
    expect(screen.getByText('Saved ✓')).toBeInTheDocument()
  })
})
