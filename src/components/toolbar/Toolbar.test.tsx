import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toolbar } from './Toolbar'

describe('Toolbar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens the template gallery when the Template button is clicked', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /template/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose a template' })).toBeInTheDocument()
  })

  it('closes the gallery when its close button is clicked', async () => {
    const user = userEvent.setup()
    render(<Toolbar />)

    await user.click(screen.getByRole('button', { name: /template/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
