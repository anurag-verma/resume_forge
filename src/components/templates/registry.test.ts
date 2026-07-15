import { describe, it, expect } from 'vitest'
import { TEMPLATES, getTemplateDefinition } from './index'

describe('template registry', () => {
  it('lists Classic, Modern, and Minimal', () => {
    expect(TEMPLATES.map((template) => template.id)).toEqual(['classic', 'modern', 'minimal'])
  })

  it('marks only Classic as ATS-friendly', () => {
    const atsFlags = Object.fromEntries(
      TEMPLATES.map((template) => [template.id, Boolean(template.atsFriendly)]),
    )
    expect(atsFlags).toEqual({ classic: true, modern: false, minimal: false })
  })

  it('looks up a template definition by id', () => {
    expect(getTemplateDefinition('modern').name).toBe('Modern')
    expect(getTemplateDefinition('minimal').name).toBe('Minimal')
  })

  it('falls back to Classic for an unrecognized id', () => {
    expect(getTemplateDefinition('nonexistent' as never).id).toBe('classic')
  })
})
