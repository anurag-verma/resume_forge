import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App shell & layout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the toolbar, editor panel, and preview pane', async () => {
    render(<App />)

    expect(screen.getByText('ResumeForge')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Personal Info' })).toBeInTheDocument()
    // The active template is React.lazy-loaded (RB-024), so it resolves asynchronously.
    // It renders twice: once in the on-screen preview, once in the hidden
    // print-only copy (RB-030) — jsdom doesn't evaluate the `print:` media
    // query that keeps the second one hidden on screen.
    const nameHeadings = await screen.findAllByRole('heading', { name: 'Your Name' })
    expect(nameHeadings).toHaveLength(2)
  })

  it('renders the mobile Edit/Preview tab bar and switches views', async () => {
    const user = userEvent.setup()
    render(<App />)

    const editTab = screen.getByRole('button', { name: 'Edit' })
    const previewTab = screen.getByRole('button', { name: 'Preview' })

    expect(editTab).toHaveAttribute('aria-pressed', 'true')
    expect(previewTab).toHaveAttribute('aria-pressed', 'false')

    await user.click(previewTab)

    expect(editTab).toHaveAttribute('aria-pressed', 'false')
    expect(previewTab).toHaveAttribute('aria-pressed', 'true')
  })
})
