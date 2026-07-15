import { describe, it, expect, beforeEach } from 'vitest'
import { useResumeStore } from './useResumeStore'
import { createBlankResume } from '../lib/defaultResume'
import { createSampleResumeContent } from '../lib/sampleData'

function resetStore() {
  const resume = createBlankResume()
  useResumeStore.setState(
    { resumes: [resume], activeResumeId: resume.id },
    false,
  )
  return resume.id
}

describe('useResumeStore reducers', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore()
  })

  it('creates a resume and makes it active', () => {
    const newId = useResumeStore.getState().createResume('Second Resume')

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(2)
    expect(state.activeResumeId).toBe(newId)
    expect(state.resumes.find((r) => r.id === newId)?.name).toBe('Second Resume')
  })

  it('renames a resume', () => {
    useResumeStore.getState().renameResume(resumeId, 'Renamed')
    expect(
      useResumeStore.getState().resumes.find((r) => r.id === resumeId)?.name,
    ).toBe('Renamed')
  })

  it('duplicates a resume with fresh ids', () => {
    useResumeStore.getState().addSection(resumeId, 'experience', 'Experience')
    const sectionId = useResumeStore.getState().resumes[0].sections[0].id
    useResumeStore.getState().addEntry(resumeId, sectionId, {
      id: 'entry-1',
      type: 'experience',
      company: 'Acme',
      role: 'Engineer',
      startDate: '2020-01',
      endDate: null,
      description: '',
    })

    const copyId = useResumeStore.getState().duplicateResume(resumeId)
    const state = useResumeStore.getState()
    const copy = state.resumes.find((r) => r.id === copyId)!
    const original = state.resumes.find((r) => r.id === resumeId)!

    expect(state.activeResumeId).toBe(copyId)
    expect(copy.name).toBe(`${original.name} (Copy)`)
    expect(copy.id).not.toBe(original.id)
    expect(copy.sections[0].id).not.toBe(original.sections[0].id)
    expect(copy.sections[0].entries[0].id).not.toBe(original.sections[0].entries[0].id)
  })

  it('deletes a resume and falls back to another one', () => {
    const secondId = useResumeStore.getState().createResume('Second')
    useResumeStore.getState().setActiveResume(secondId)

    useResumeStore.getState().deleteResume(secondId)

    const state = useResumeStore.getState()
    expect(state.resumes.find((r) => r.id === secondId)).toBeUndefined()
    expect(state.activeResumeId).toBe(resumeId)
  })

  it('always keeps at least one resume, creating a fresh blank after deleting the last one', () => {
    useResumeStore.getState().deleteResume(resumeId)

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(1)
    expect(state.resumes[0].id).not.toBe(resumeId)
    expect(state.activeResumeId).toBe(state.resumes[0].id)
  })

  it('updates personal info', () => {
    useResumeStore.getState().updatePersonalInfo(resumeId, {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
    })

    const info = useResumeStore.getState().resumes[0].personalInfo
    expect(info.fullName).toBe('Jane Doe')
    expect(info.email).toBe('jane@example.com')
  })

  it('adds, updates, reorders, and removes sections', () => {
    const s1 = useResumeStore.getState().addSection(resumeId, 'experience', 'Experience')
    const s2 = useResumeStore.getState().addSection(resumeId, 'education', 'Education')

    expect(useResumeStore.getState().resumes[0].sections.map((s) => s.id)).toEqual([
      s1,
      s2,
    ])

    useResumeStore.getState().updateSection(resumeId, s1, { title: 'Work History' })
    expect(
      useResumeStore.getState().resumes[0].sections.find((s) => s.id === s1)?.title,
    ).toBe('Work History')

    useResumeStore.getState().reorderSections(resumeId, [s2, s1])
    expect(useResumeStore.getState().resumes[0].sections.map((s) => s.id)).toEqual([
      s2,
      s1,
    ])

    useResumeStore.getState().removeSection(resumeId, s1)
    expect(useResumeStore.getState().resumes[0].sections.map((s) => s.id)).toEqual([s2])
  })

  it('adds, updates, reorders, and removes entries within a section', () => {
    const sectionId = useResumeStore.getState().addSection(resumeId, 'skills', 'Skills')

    useResumeStore.getState().addEntry(resumeId, sectionId, {
      id: 'skill-1',
      type: 'skills',
      name: 'TypeScript',
    })
    useResumeStore.getState().addEntry(resumeId, sectionId, {
      id: 'skill-2',
      type: 'skills',
      name: 'React',
    })

    let entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries.map((e) => e.id)).toEqual(['skill-1', 'skill-2'])

    useResumeStore.getState().updateEntry(resumeId, sectionId, 'skill-1', {
      name: 'JavaScript',
    })
    entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries[0]).toMatchObject({ name: 'JavaScript' })

    useResumeStore.getState().reorderEntries(resumeId, sectionId, ['skill-2', 'skill-1'])
    entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries.map((e) => e.id)).toEqual(['skill-2', 'skill-1'])

    useResumeStore.getState().removeEntry(resumeId, sectionId, 'skill-2')
    entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries.map((e) => e.id)).toEqual(['skill-1'])
  })

  it('duplicates an entry with a fresh id, inserted right after the original', () => {
    const sectionId = useResumeStore.getState().addSection(resumeId, 'skills', 'Skills')
    useResumeStore.getState().addEntry(resumeId, sectionId, {
      id: 'skill-1',
      type: 'skills',
      name: 'TypeScript',
    })
    useResumeStore.getState().addEntry(resumeId, sectionId, {
      id: 'skill-2',
      type: 'skills',
      name: 'React',
    })

    useResumeStore.getState().duplicateEntry(resumeId, sectionId, 'skill-1')

    const entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries).toHaveLength(3)
    expect(entries[0].id).toBe('skill-1')
    expect(entries[1]).toMatchObject({ name: 'TypeScript' })
    expect(entries[1].id).not.toBe('skill-1')
    expect(entries[2].id).toBe('skill-2')
  })

  it('loadSampleData fills the resume with the given content, preserving id/name', () => {
    const sample = createSampleResumeContent()

    useResumeStore.getState().loadSampleData(resumeId, sample)

    const resume = useResumeStore.getState().resumes[0]
    expect(resume.id).toBe(resumeId)
    expect(resume.personalInfo).toEqual(sample.personalInfo)
    expect(resume.sections).toEqual(sample.sections)
  })
})
