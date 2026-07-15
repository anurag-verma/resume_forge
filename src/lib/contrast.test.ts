import { describe, it, expect } from 'vitest'
import { getContrastRatio, getLowContrastWarning, isValidHexColor } from './contrast'

describe('isValidHexColor', () => {
  it('accepts 6-digit and 3-digit hex, with or without a leading #', () => {
    expect(isValidHexColor('#2456A6')).toBe(true)
    expect(isValidHexColor('2456A6')).toBe(true)
    expect(isValidHexColor('#fff')).toBe(true)
    expect(isValidHexColor('abc')).toBe(true)
  })

  it('rejects malformed input', () => {
    expect(isValidHexColor('not-a-color')).toBe(false)
    expect(isValidHexColor('#12345')).toBe(false)
    expect(isValidHexColor('')).toBe(false)
  })
})

describe('getContrastRatio', () => {
  it('gives black-on-white the maximum 21:1 ratio', () => {
    expect(getContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
  })

  it('gives identical colors a 1:1 ratio', () => {
    expect(getContrastRatio('#2456A6', '#2456A6')).toBeCloseTo(1, 5)
  })

  it('is symmetric regardless of argument order', () => {
    const a = getContrastRatio('#2456A6', '#FFFFFF')
    const b = getContrastRatio('#FFFFFF', '#2456A6')
    expect(a).toBeCloseTo(b, 10)
  })
})

describe('getLowContrastWarning', () => {
  it('returns null for a well-contrasting curated accent (dark blue on white)', () => {
    expect(getLowContrastWarning('#2456A6')).toBeNull()
  })

  it('warns for a very light, low-contrast custom hex', () => {
    expect(getLowContrastWarning('#F5F5F5')).not.toBeNull()
  })

  it('returns null (no crash) for invalid hex input', () => {
    expect(getLowContrastWarning('not-a-color')).toBeNull()
  })
})
