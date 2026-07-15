import { describe, it, expect, beforeEach } from 'vitest'
import { hasSeenPdfTooltip, markPdfTooltipSeen } from './pdfTooltip'

describe('pdfTooltip', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('has not been seen by default', () => {
    expect(hasSeenPdfTooltip()).toBe(false)
  })

  it('is marked seen and stays seen', () => {
    markPdfTooltipSeen()
    expect(hasSeenPdfTooltip()).toBe(true)
  })
})
