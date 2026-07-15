import { describe, it, expect } from 'vitest'
import { clampZoomPercent, MAX_ZOOM_PERCENT, MIN_ZOOM_PERCENT } from './zoom'

describe('clampZoomPercent', () => {
  it('passes values within range through unchanged (rounded)', () => {
    expect(clampZoomPercent(80)).toBe(80)
    expect(clampZoomPercent(80.6)).toBe(81)
  })

  it('clamps below the minimum', () => {
    expect(clampZoomPercent(0)).toBe(MIN_ZOOM_PERCENT)
    expect(clampZoomPercent(-50)).toBe(MIN_ZOOM_PERCENT)
  })

  it('clamps above the maximum', () => {
    expect(clampZoomPercent(500)).toBe(MAX_ZOOM_PERCENT)
  })
})
