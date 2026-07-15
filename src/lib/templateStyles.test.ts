import { describe, it, expect } from 'vitest'
import { getTemplateCssVars } from './templateStyles'
import type { Settings } from '../types/resume'

const baseSettings: Settings = {
  templateId: 'classic',
  accentColor: '#2456A6',
  fontPairId: 'classic-serif',
  fontScale: 'md',
  lineSpacing: 1.4,
  sectionSpacing: 16,
}

describe('getTemplateCssVars', () => {
  it('maps Settings to the shared template CSS variables', () => {
    expect(getTemplateCssVars(baseSettings)).toEqual({
      '--accent': '#2456A6',
      '--font-heading': '"Source Serif 4", Georgia, serif',
      '--font-body': '"Source Sans 3", system-ui, sans-serif',
      '--line-height': '1.4',
      '--section-spacing': '16px',
      '--font-size-base': '14px',
    })
  })

  it('maps every font scale to a distinct base size', () => {
    expect(getTemplateCssVars({ ...baseSettings, fontScale: 'sm' })['--font-size-base']).toBe(
      '13px',
    )
    expect(getTemplateCssVars({ ...baseSettings, fontScale: 'lg' })['--font-size-base']).toBe(
      '16px',
    )
  })

  it('falls back to the default font pair for an unknown fontPairId', () => {
    const vars = getTemplateCssVars({ ...baseSettings, fontPairId: 'nonexistent' })
    expect(vars['--font-heading']).toBe('"Source Serif 4", Georgia, serif')
  })
})
