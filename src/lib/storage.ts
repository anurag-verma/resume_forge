import { useResumeStore } from '../store/useResumeStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { SCHEMA_VERSION } from './schemaVersion'
import { sanitizeFilenameSegment } from './pdf'
import type { AppData, Resume, Settings } from '../types/resume'

/**
 * The two export shapes RB-031 produces. `kind` is a discriminator for the
 * importer (RB-032) — it isn't part of the base `AppData` type (RB-002),
 * which only describes what's persisted to localStorage; export files are a
 * distinct, versioned, self-describing format.
 */
export interface AppDataExport extends AppData {
  kind: 'app-data'
}

export interface SingleResumeExport {
  kind: 'single-resume'
  schemaVersion: number
  resume: Resume
  settings: Settings
}

export type ResumeForgeExport = AppDataExport | SingleResumeExport

/** Everything currently in the app — every resume, every resume's settings. */
export function buildAppDataExport(): AppDataExport {
  const resumeState = useResumeStore.getState()
  const settingsState = useSettingsStore.getState()
  return {
    kind: 'app-data',
    schemaVersion: SCHEMA_VERSION,
    resumes: resumeState.resumes,
    activeResumeId: resumeState.activeResumeId,
    settings: settingsState.settings,
  }
}

/** One resume plus its own settings — for sharing/transferring a single resume. */
export function buildSingleResumeExport(resume: Resume, settings: Settings): SingleResumeExport {
  return {
    kind: 'single-resume',
    schemaVersion: SCHEMA_VERSION,
    resume,
    settings,
  }
}

export function buildAppDataExportFilename(): string {
  const date = new Date().toISOString().slice(0, 10)
  return `resumeforge-backup-${date}.json`
}

export function buildSingleResumeExportFilename(resumeName: string): string {
  const cleaned = sanitizeFilenameSegment(resumeName).replace(/\s+/g, '-')
  return `${cleaned || 'Resume'}.json`
}
