import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteAllDataDialog } from './DeleteAllDataDialog'

describe('DeleteAllDataDialog', () => {
  let reloadSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    reloadSpy = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload: reloadSpy })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('disables the delete button until DELETE is typed exactly', async () => {
    const user = userEvent.setup()
    render(<DeleteAllDataDialog open onClose={vi.fn()} />)

    const deleteButton = screen.getByRole('button', { name: 'Delete everything' })
    expect(deleteButton).toBeDisabled()

    await user.type(screen.getByLabelText(/type/i), 'delete')
    expect(deleteButton).toBeDisabled()

    await user.clear(screen.getByLabelText(/type/i))
    await user.type(screen.getByLabelText(/type/i), 'DELETE')
    expect(deleteButton).not.toBeDisabled()
  })

  it('clears localStorage and reloads only once DELETE is typed and confirmed', async () => {
    localStorage.setItem('resume-builder-data', '{"resumes":[]}')
    const user = userEvent.setup()
    render(<DeleteAllDataDialog open onClose={vi.fn()} />)

    await user.type(screen.getByLabelText(/type/i), 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Delete everything' }))

    expect(localStorage.length).toBe(0)
    expect(reloadSpy).toHaveBeenCalledOnce()
  })

  it('does nothing when Cancel is clicked, regardless of what was typed', async () => {
    localStorage.setItem('resume-builder-data', '{"resumes":[]}')
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DeleteAllDataDialog open onClose={onClose} />)

    await user.type(screen.getByLabelText(/type/i), 'DELETE')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onClose).toHaveBeenCalledOnce()
    expect(reloadSpy).not.toHaveBeenCalled()
    expect(localStorage.getItem('resume-builder-data')).not.toBeNull()
  })
})
