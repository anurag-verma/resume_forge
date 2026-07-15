import { useResumeStore } from '../store/useResumeStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { createId } from './id'
import type { ValidatedImport } from './validateImport'
import type { Entry, Resume } from '../types/resume'

export type ImportMode = 'merge' | 'replace'

/** Regenerates every id in a resume (itself, its sections, and their
 *  entries) so an imported resume never collides with an existing one. */
function withFreshIds(resume: Resume): Resume {
  return {
    ...resume,
    id: createId(),
    sections: resume.sections.map((section) => ({
      ...section,
      id: createId(),
      entries: section.entries.map((entry) => ({ ...entry, id: createId() }) as Entry),
    })),
  }
}

/**
 * Applies a validated import to the app's state.
 *
 * - single-resume + merge: added as a brand-new resume (fresh ids), made active
 * - single-resume + replace: overwrites the *currently active* resume's
 *   content and settings, keeping its existing id
 * - app-data + merge: every imported resume added as new resumes (fresh ids)
 * - app-data + replace: existing resumes/settings are discarded entirely
 */
export function applyImport(data: ValidatedImport, mode: ImportMode): void {
  if (data.kind === 'single-resume') {
    if (mode === 'replace') {
      const activeResumeId = useResumeStore.getState().activeResumeId
      useResumeStore.setState((state) => ({
        resumes: state.resumes.map((resume) =>
          resume.id === activeResumeId
            ? {
                ...data.resume,
                id: activeResumeId,
                updatedAt: new Date().toISOString(),
              }
            : resume,
        ),
      }))
      useSettingsStore.getState().setSettings(activeResumeId, data.settings)
      return
    }

    const fresh = withFreshIds(data.resume)
    useResumeStore.setState((state) => ({
      resumes: [...state.resumes, fresh],
      activeResumeId: fresh.id,
    }))
    useSettingsStore.getState().setSettings(fresh.id, data.settings)
    return
  }

  // app-data
  if (mode === 'replace') {
    useResumeStore.setState({
      resumes: data.resumes,
      activeResumeId: data.activeResumeId,
    })
    useSettingsStore.setState({ settings: data.settings })
    return
  }

  const idMap = new Map<string, string>()
  const freshResumes = data.resumes.map((resume) => {
    const fresh = withFreshIds(resume)
    idMap.set(resume.id, fresh.id)
    return fresh
  })

  useResumeStore.setState((state) => ({
    resumes: [...state.resumes, ...freshResumes],
    activeResumeId: freshResumes[freshResumes.length - 1]?.id ?? state.activeResumeId,
  }))

  const settingsStore = useSettingsStore.getState()
  for (const [oldId, newId] of idMap.entries()) {
    const settings = data.settings[oldId]
    if (settings) settingsStore.setSettings(newId, settings)
  }
}
