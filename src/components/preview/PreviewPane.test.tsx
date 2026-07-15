import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PreviewPane } from './PreviewPane'

describe('PreviewPane', () => {
  it('renders the placeholder content when no children are given', () => {
    render(<PreviewPane />)
    expect(
      screen.getByText('Preview of your resume; content matches the editor.'),
    ).toBeInTheDocument()
  })

  it('renders given children instead of the placeholder', () => {
    render(
      <PreviewPane>
        <p>Jane Doe's resume content</p>
      </PreviewPane>,
    )
    expect(screen.getByText("Jane Doe's resume content")).toBeInTheDocument()
    expect(
      screen.queryByText('Preview of your resume; content matches the editor.'),
    ).not.toBeInTheDocument()
  })

  it('renders zoom controls defaulting to Fit', () => {
    render(<PreviewPane />)
    expect(screen.getByRole('button', { name: 'Fit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('switches zoom level when a zoom button is clicked', async () => {
    const user = userEvent.setup()
    render(<PreviewPane />)

    await user.click(screen.getByRole('button', { name: '100%' }))

    expect(screen.getByRole('button', { name: '100%' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Fit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
