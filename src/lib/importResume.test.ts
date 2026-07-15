import { describe, it, expect, beforeEach } from 'vitest'
import { useResumeStore } from '../store/useResumeStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { createBlankResume, DEFAULT_SETTINGS } from './defaultResume'
import { applyImport } from './importResume'
import type { SingleResumeImport, AppDataImport } from './validateImport'
import type { Resume, Settings } from '../types/resume'

function resetStores() {
  const resume = createBlankResume('Existing Resume')
  resume.personalInfo.fullName = 'Existing Person'
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  useSettingsStore.setState({ settings: { [resume.id]: DEFAULT_SETTINGS } }, false)
  return resume
}

function makeImportedResume(overrides: Partial<Resume> = {}): Resume {
  return {
    ...createBlankResume('Imported Resume'),
    personalInfo: { ...createBlankResume().personalInfo, fullName: 'Imported Person' },
    ...overrides,
  }
}

const importedSettings: Settings = { ...DEFAULT_SETTINGS, accentColor: '#FF0000' }

describe('applyImport — single-resume', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('merge: adds a new resume with a fresh id, alongside the existing one', () => {
    const existing = resetStores()
    const importedResume = makeImportedResume()
    const data: SingleResumeImport = {
      kind: 'single-resume',
      schemaVersion: 1,
      resume: importedResume,
      settings: importedSettings,
    }

    applyImport(data, 'merge')

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(2)
    expect(state.resumes[0].id).toBe(existing.id)
    const newResume = state.resumes[1]
    expect(newResume.id).not.toBe(importedResume.id)
    expect(newResume.personalInfo.fullName).toBe('Imported Person')
    expect(state.activeResumeId).toBe(newResume.id)
    expect(useSettingsStore.getState().getSettings(newResume.id)).toEqual(importedSettings)
  })

  it('merge: regenerates section and entry ids too, to avoid collisions', () => {
    resetStores()
    const importedResume = makeImportedResume({
      sections: [
        {
          id: 'section-1',
          type: 'skills',
          title: 'Skills',
          visible: true,
          entries: [{ id: 'entry-1', type: 'skills', name: 'TypeScript' }],
        },
      ],
    })
    const data: SingleResumeImport = {
      kind: 'single-resume',
      schemaVersion: 1,
      resume: importedResume,
      settings: importedSettings,
    }

    applyImport(data, 'merge')

    const newResume = useResumeStore.getState().resumes[1]
    expect(newResume.sections[0].id).not.toBe('section-1')
    expect(newResume.sections[0].entries[0].id).not.toBe('entry-1')
    expect(newResume.sections[0].entries[0]).toMatchObject({ name: 'TypeScript' })
  })

  it('replace: overwrites the active resume\'s content but keeps its id', () => {
    const existing = resetStores()
    const importedResume = makeImportedResume()
    const data: SingleResumeImport = {
      kind: 'single-resume',
      schemaVersion: 1,
      resume: importedResume,
      settings: importedSettings,
    }

    applyImport(data, 'replace')

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(1)
    expect(state.resumes[0].id).toBe(existing.id)
    expect(state.resumes[0].personalInfo.fullName).toBe('Imported Person')
    expect(useSettingsStore.getState().getSettings(existing.id)).toEqual(importedSettings)
  })
})

describe('applyImport — app-data', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('merge: adds every imported resume as new resumes with fresh ids', () => {
    const existing = resetStores()
    const importedA = makeImportedResume({ name: 'Imported A' })
    const importedB = makeImportedResume({ name: 'Imported B' })
    const data: AppDataImport = {
      kind: 'app-data',
      schemaVersion: 1,
      resumes: [importedA, importedB],
      activeResumeId: importedA.id,
      settings: { [importedA.id]: importedSettings, [importedB.id]: DEFAULT_SETTINGS },
    }

    applyImport(data, 'merge')

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(3)
    expect(state.resumes[0].id).toBe(existing.id)
    expect(state.resumes.map((r) => r.name)).toEqual([
      'Existing Resume',
      'Imported A',
      'Imported B',
    ])
    expect(state.resumes[1].id).not.toBe(importedA.id)
    expect(state.resumes[2].id).not.toBe(importedB.id)
    expect(state.activeResumeId).toBe(state.resumes[2].id)
    expect(useSettingsStore.getState().getSettings(state.resumes[1].id)).toEqual(
      importedSettings,
    )
  })

  it('replace: discards existing resumes and settings entirely', () => {
    resetStores()
    const importedA = makeImportedResume({ name: 'Imported A' })
    const data: AppDataImport = {
      kind: 'app-data',
      schemaVersion: 1,
      resumes: [importedA],
      activeResumeId: importedA.id,
      settings: { [importedA.id]: importedSettings },
    }

    applyImport(data, 'replace')

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(1)
    expect(state.resumes[0].id).toBe(importedA.id)
    expect(state.activeResumeId).toBe(importedA.id)
    expect(useSettingsStore.getState().settings).toEqual({ [importedA.id]: importedSettings })
  })
})
