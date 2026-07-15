import { describe, it, expect, beforeEach } from 'vitest'
import { useResumeStore } from '../store/useResumeStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { createBlankResume } from './defaultResume'
import { SCHEMA_VERSION } from './schemaVersion'
import {
  buildAppDataExport,
  buildAppDataExportFilename,
  buildSingleResumeExport,
  buildSingleResumeExportFilename,
} from './storage'

function resetStores() {
  const resume = createBlankResume('Jane Doe Resume')
  resume.personalInfo.fullName = 'Jane Doe'
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  useSettingsStore.setState({ settings: {} }, false)
  return resume
}

describe('buildAppDataExport', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('bundles all resumes, activeResumeId, and settings with a schemaVersion', () => {
    const resume = resetStores()
    useSettingsStore.getState().updateSettings(resume.id, { templateId: 'modern' })

    const exported = buildAppDataExport()

    expect(exported.kind).toBe('app-data')
    expect(exported.schemaVersion).toBe(SCHEMA_VERSION)
    expect(exported.resumes).toEqual([useResumeStore.getState().resumes[0]])
    expect(exported.activeResumeId).toBe(resume.id)
    expect(exported.settings[resume.id]).toMatchObject({ templateId: 'modern' })
  })

  it('round-trips through JSON without losing data (re-importable)', () => {
    const resume = resetStores()
    useSettingsStore.getState().updateSettings(resume.id, { accentColor: '#000000' })

    const exported = buildAppDataExport()
    const roundTripped = JSON.parse(JSON.stringify(exported))

    expect(roundTripped).toEqual(exported)
    expect(roundTripped.resumes[0].personalInfo.fullName).toBe('Jane Doe')
    expect(roundTripped.settings[resume.id].accentColor).toBe('#000000')
  })
})

describe('buildSingleResumeExport', () => {
  it('bundles just the given resume and settings with a schemaVersion', () => {
    const resume = resetStores()
    const settings = useSettingsStore.getState().getSettings(resume.id)

    const exported = buildSingleResumeExport(resume, settings)

    expect(exported.kind).toBe('single-resume')
    expect(exported.schemaVersion).toBe(SCHEMA_VERSION)
    expect(exported.resume).toEqual(resume)
    expect(exported.settings).toEqual(settings)
  })

  it('round-trips through JSON without losing data', () => {
    const resume = resetStores()
    const settings = useSettingsStore.getState().getSettings(resume.id)
    const exported = buildSingleResumeExport(resume, settings)

    const roundTripped = JSON.parse(JSON.stringify(exported))

    expect(roundTripped).toEqual(exported)
  })
})

describe('filenames', () => {
  it('builds an app-data backup filename with today’s date', () => {
    const filename = buildAppDataExportFilename()
    expect(filename).toMatch(/^resumeforge-backup-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('builds a single-resume filename from the resume name', () => {
    expect(buildSingleResumeExportFilename('Jane Doe Resume')).toBe('Jane-Doe-Resume.json')
  })

  it('sanitizes unsafe characters in the resume name', () => {
    expect(buildSingleResumeExportFilename('Jane/Doe: Resume')).toBe('JaneDoe-Resume.json')
  })

  it('falls back to "Resume.json" for an empty name', () => {
    expect(buildSingleResumeExportFilename('')).toBe('Resume.json')
  })
})
