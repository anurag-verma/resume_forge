import { describe, it, expect } from 'vitest'
import { createSampleResumeContent } from './sampleData'

describe('createSampleResumeContent', () => {
  it('fills in believable personal info', () => {
    const { personalInfo } = createSampleResumeContent()
    expect(personalInfo.fullName).toBeTruthy()
    expect(personalInfo.jobTitle).toBeTruthy()
    expect(personalInfo.email).toMatch(/@/)
  })

  it('includes every major section type', () => {
    const { sections } = createSampleResumeContent()
    const types = sections.map((section) => section.type)
    expect(types).toEqual(
      expect.arrayContaining([
        'summary',
        'experience',
        'education',
        'skills',
        'projects',
        'certifications',
        'languages',
      ]),
    )
  })

  it('gives every section and entry at least one populated entry', () => {
    const { sections } = createSampleResumeContent()
    for (const section of sections) {
      expect(section.entries.length).toBeGreaterThan(0)
    }
  })

  it('generates fresh ids on every call', () => {
    const first = createSampleResumeContent()
    const second = createSampleResumeContent()

    expect(first.sections[0].id).not.toBe(second.sections[0].id)
    expect(first.sections[0].entries[0].id).not.toBe(second.sections[0].entries[0].id)
  })

  it('all section and entry ids are unique within one call', () => {
    const { sections } = createSampleResumeContent()
    const ids = [
      ...sections.map((section) => section.id),
      ...sections.flatMap((section) => section.entries.map((entry) => entry.id)),
    ]
    expect(new Set(ids).size).toBe(ids.length)
  })
})
