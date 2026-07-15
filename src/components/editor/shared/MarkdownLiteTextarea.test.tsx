import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkdownLiteTextarea } from './MarkdownLiteTextarea'

/** Controlled wrapper so onChange updates actually flow back into the textarea's value. */
function ControlledTextarea({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <MarkdownLiteTextarea
      id="description"
      label="Description"
      value={value}
      onChange={setValue}
    />
  )
}

describe('MarkdownLiteTextarea', () => {
  it('renders a label, textarea, and Bold/Italic/Bullet list toolbar buttons', () => {
    render(<ControlledTextarea />)

    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bullet list' })).toBeInTheDocument()
  })

  it('wraps selected text in ** when Bold is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledTextarea initial="Led a team" />)

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    textarea.setSelectionRange(6, 10) // "team"

    await user.click(screen.getByRole('button', { name: 'Bold' }))

    expect(textarea.value).toBe('Led a **team**')
  })

  it('wraps selected text in * when Italic is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledTextarea initial="a great team" />)

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    textarea.setSelectionRange(2, 7) // "great"

    await user.click(screen.getByRole('button', { name: 'Italic' }))

    expect(textarea.value).toBe('a *great* team')
  })

  it('inserts a placeholder wrapped in markers when nothing is selected', async () => {
    const user = userEvent.setup()
    render(<ControlledTextarea initial="" />)

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    textarea.setSelectionRange(0, 0)

    await user.click(screen.getByRole('button', { name: 'Bold' }))

    expect(textarea.value).toBe('**text**')
  })

  it('prepends "- " to the current line when Bullet list is clicked', async () => {
    const user = userEvent.setup()
    render(<ControlledTextarea initial="Led a team" />)

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    textarea.setSelectionRange(3, 3)

    await user.click(screen.getByRole('button', { name: 'Bullet list' }))

    expect(textarea.value).toBe('- Led a team')
  })

  it('toggles the bullet back off when clicked again on an already-bulleted line', async () => {
    const user = userEvent.setup()
    render(<ControlledTextarea initial="- Led a team" />)

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    textarea.setSelectionRange(3, 3)

    await user.click(screen.getByRole('button', { name: 'Bullet list' }))

    expect(textarea.value).toBe('Led a team')
  })

  it('applies "- " to every line of a multi-line selection', async () => {
    const user = userEvent.setup()
    render(<ControlledTextarea initial={'first\nsecond'} />)

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    textarea.setSelectionRange(0, textarea.value.length)

    await user.click(screen.getByRole('button', { name: 'Bullet list' }))

    expect(textarea.value).toBe('- first\n- second')
  })

  it('still calls onChange when typing directly into the textarea', () => {
    const onChange = vi.fn()
    render(
      <MarkdownLiteTextarea
        id="description"
        label="Description"
        value=""
        onChange={onChange}
      />,
    )

    const textarea = screen.getByLabelText('Description')
    fireEvent.change(textarea, { target: { value: 'hello' } })

    expect(onChange).toHaveBeenCalledWith('hello')
  })
})
