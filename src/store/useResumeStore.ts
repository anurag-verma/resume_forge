import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBlankResume } from '../lib/defaultResume'
import { createId } from '../lib/id'
import { createDebouncedJSONStorage } from '../lib/persistStorage'
import { SCHEMA_VERSION } from '../lib/schemaVersion'
import { useSettingsStore } from './useSettingsStore'
import type { Entry, PersonalInfo, Resume, Section, SectionType } from '../types/resume'

interface ResumeState {
  schemaVersion: number
  resumes: Resume[]
  activeResumeId: string

  createResume: (name?: string) => string
  deleteResume: (id: string) => void
  duplicateResume: (id: string) => string
  renameResume: (id: string, name: string) => void
  setActiveResume: (id: string) => void

  updatePersonalInfo: (resumeId: string, patch: Partial<PersonalInfo>) => void
  loadSampleData: (resumeId: string, content: { personalInfo: PersonalInfo; sections: Section[] }) => void

  addSection: (resumeId: string, type: SectionType, title: string) => string
  updateSection: (
    resumeId: string,
    sectionId: string,
    patch: Partial<Omit<Section, 'id' | 'entries'>>,
  ) => void
  removeSection: (resumeId: string, sectionId: string) => void
  reorderSections: (resumeId: string, orderedSectionIds: string[]) => void

  addEntry: (resumeId: string, sectionId: string, entry: Entry) => void
  updateEntry: (
    resumeId: string,
    sectionId: string,
    entryId: string,
    patch: Partial<Entry>,
  ) => void
  removeEntry: (resumeId: string, sectionId: string, entryId: string) => void
  duplicateEntry: (resumeId: string, sectionId: string, entryId: string) => void
  reorderEntries: (resumeId: string, sectionId: string, orderedEntryIds: string[]) => void
}

function duplicateSections(sections: Section[]): Section[] {
  return sections.map((section) => ({
    ...section,
    id: createId(),
    entries: section.entries.map((entry) => ({ ...entry, id: createId() })),
  }))
}

const initialResume = createBlankResume()

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => {
      function updateResume(resumeId: string, updater: (resume: Resume) => Resume) {
        set((state) => ({
          resumes: state.resumes.map((resume) =>
            resume.id === resumeId
              ? { ...updater(resume), updatedAt: new Date().toISOString() }
              : resume,
          ),
        }))
      }

      function updateSectionIn(
        resume: Resume,
        sectionId: string,
        updater: (section: Section) => Section,
      ): Resume {
        return {
          ...resume,
          sections: resume.sections.map((section) =>
            section.id === sectionId ? updater(section) : section,
          ),
        }
      }

      return {
        schemaVersion: SCHEMA_VERSION,
        resumes: [initialResume],
        activeResumeId: initialResume.id,

        createResume: (name = 'Untitled Resume') => {
          const resume = createBlankResume(name)
          set((state) => ({
            resumes: [...state.resumes, resume],
            activeResumeId: resume.id,
          }))
          return resume.id
        },

        deleteResume: (id) => {
          set((state) => {
            const resumes = state.resumes.filter((resume) => resume.id !== id)
            if (resumes.length === 0) {
              const fresh = createBlankResume()
              return { resumes: [fresh], activeResumeId: fresh.id }
            }
            return {
              resumes,
              activeResumeId:
                state.activeResumeId === id ? resumes[0].id : state.activeResumeId,
            }
          })
          useSettingsStore.getState().removeSettings(id)
        },

        duplicateResume: (id) => {
          const source = get().resumes.find((resume) => resume.id === id)
          if (!source) return ''
          const copy: Resume = {
            ...source,
            id: createId(),
            name: `${source.name} (Copy)`,
            updatedAt: new Date().toISOString(),
            sections: duplicateSections(source.sections),
          }
          set((state) => ({
            resumes: [...state.resumes, copy],
            activeResumeId: copy.id,
          }))
          const sourceSettings = useSettingsStore.getState().getSettings(id)
          useSettingsStore.getState().setSettings(copy.id, sourceSettings)
          return copy.id
        },

        renameResume: (id, name) => updateResume(id, (resume) => ({ ...resume, name })),

        setActiveResume: (id) => set({ activeResumeId: id }),

        updatePersonalInfo: (resumeId, patch) =>
          updateResume(resumeId, (resume) => ({
            ...resume,
            personalInfo: { ...resume.personalInfo, ...patch },
          })),

        loadSampleData: (resumeId, content) =>
          updateResume(resumeId, (resume) => ({
            ...resume,
            personalInfo: content.personalInfo,
            sections: content.sections,
          })),

        addSection: (resumeId, type, title) => {
          const section: Section = {
            id: createId(),
            type,
            title,
            visible: true,
            entries: [],
          }
          updateResume(resumeId, (resume) => ({
            ...resume,
            sections: [...resume.sections, section],
          }))
          return section.id
        },

        updateSection: (resumeId, sectionId, patch) =>
          updateResume(resumeId, (resume) =>
            updateSectionIn(resume, sectionId, (section) => ({ ...section, ...patch })),
          ),

        removeSection: (resumeId, sectionId) =>
          updateResume(resumeId, (resume) => ({
            ...resume,
            sections: resume.sections.filter((section) => section.id !== sectionId),
          })),

        reorderSections: (resumeId, orderedSectionIds) =>
          updateResume(resumeId, (resume) => {
            const byId = new Map(resume.sections.map((section) => [section.id, section]))
            const sections = orderedSectionIds
              .map((id) => byId.get(id))
              .filter((section): section is Section => Boolean(section))
            return { ...resume, sections }
          }),

        addEntry: (resumeId, sectionId, entry) =>
          updateResume(resumeId, (resume) =>
            updateSectionIn(resume, sectionId, (section) => ({
              ...section,
              entries: [...section.entries, entry],
            })),
          ),

        updateEntry: (resumeId, sectionId, entryId, patch) =>
          updateResume(resumeId, (resume) =>
            updateSectionIn(resume, sectionId, (section) => ({
              ...section,
              entries: section.entries.map((entry) =>
                entry.id === entryId ? ({ ...entry, ...patch } as Entry) : entry,
              ),
            })),
          ),

        removeEntry: (resumeId, sectionId, entryId) =>
          updateResume(resumeId, (resume) =>
            updateSectionIn(resume, sectionId, (section) => ({
              ...section,
              entries: section.entries.filter((entry) => entry.id !== entryId),
            })),
          ),

        duplicateEntry: (resumeId, sectionId, entryId) =>
          updateResume(resumeId, (resume) =>
            updateSectionIn(resume, sectionId, (section) => {
              const index = section.entries.findIndex((entry) => entry.id === entryId)
              if (index === -1) return section
              const copy: Entry = { ...section.entries[index], id: createId() }
              const entries = [...section.entries]
              entries.splice(index + 1, 0, copy)
              return { ...section, entries }
            }),
          ),

        reorderEntries: (resumeId, sectionId, orderedEntryIds) =>
          updateResume(resumeId, (resume) =>
            updateSectionIn(resume, sectionId, (section) => {
              const byId = new Map(section.entries.map((entry) => [entry.id, entry]))
              const entries = orderedEntryIds
                .map((id) => byId.get(id))
                .filter((entry): entry is Entry => Boolean(entry))
              return { ...section, entries }
            }),
          ),
      }
    },
    {
      name: 'resume-builder-data',
      version: SCHEMA_VERSION,
      storage: createDebouncedJSONStorage<ResumeState>(),
      migrate: (persistedState) => persistedState as ResumeState,
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
      }),
    },
  ),
)
