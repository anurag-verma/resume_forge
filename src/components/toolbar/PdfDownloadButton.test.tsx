import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PdfDownloadButton } from './PdfDownloadButton'
import { hasSeenPdfTooltip } from '../../lib/pdfTooltip'

describe('PdfDownloadButton', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the one-time tooltip on first click, without printing yet', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<PdfDownloadButton fullName="Jane Doe" className="btn" />)

    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText(/save as pdf/i)).toBeInTheDocument()
    expect(printSpy).not.toHaveBeenCalled()
  })

  it('prints and marks the tooltip seen when "Continue to print" is clicked', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<PdfDownloadButton fullName="Jane Doe" className="btn" />)

    await user.click(screen.getByRole('button', { name: /download pdf/i }))
    await user.click(screen.getByRole('button', { name: /continue to print/i }))

    expect(printSpy).toHaveBeenCalledOnce()
    expect(hasSeenPdfTooltip()).toBe(true)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('prints immediately, with no tooltip, once the tooltip has already been seen', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<PdfDownloadButton fullName="Jane Doe" className="btn" />)

    await user.click(screen.getByRole('button', { name: /download pdf/i }))
    await user.click(screen.getByRole('button', { name: /continue to print/i }))
    printSpy.mockClear()

    await user.click(screen.getByRole('button', { name: /download pdf/i }))

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(printSpy).toHaveBeenCalledOnce()
  })
})
