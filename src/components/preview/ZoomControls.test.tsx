import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ZoomControls } from './ZoomControls'

describe('ZoomControls', () => {
  it('renders Fit, 75%, and 100% buttons', () => {
    render(<ZoomControls zoom="fit" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Fit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '75%' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '100%' })).toBeInTheDocument()
  })

  it('marks the active zoom level as pressed', () => {
    render(<ZoomControls zoom={75} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: '75%' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Fit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: '100%' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('calls onChange with the selected zoom level', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ZoomControls zoom="fit" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '100%' }))
    expect(onChange).toHaveBeenCalledWith(100)

    await user.click(screen.getByRole('button', { name: '75%' }))
    expect(onChange).toHaveBeenCalledWith(75)

    await user.click(screen.getByRole('button', { name: 'Fit' }))
    expect(onChange).toHaveBeenCalledWith('fit')
  })
})
