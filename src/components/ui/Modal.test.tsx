import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('is not visible in the accessibility tree when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Choose a template">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the title and children when open', () => {
    render(
      <Modal open onClose={vi.fn()} title="Choose a template">
        <p>Gallery content</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose a template' })).toBeInTheDocument()
    expect(screen.getByText('Gallery content')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Choose a template">
        <p>Content</p>
      </Modal>,
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
