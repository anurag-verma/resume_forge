import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS } from '../lib/defaultResume'
import { createDebouncedJSONStorage } from '../lib/persistStorage'
import { SCHEMA_VERSION } from '../lib/schemaVersion'
import type { Settings } from '../types/resume'

interface SettingsState {
  schemaVersion: number
  settings: Record<string, Settings>

  getSettings: (resumeId: string) => Settings
  updateSettings: (resumeId: string, patch: Partial<Settings>) => void
  setSettings: (resumeId: string, settings: Settings) => void
  resetSettings: (resumeId: string) => void
  removeSettings: (resumeId: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      schemaVersion: SCHEMA_VERSION,
      settings: {},

      getSettings: (resumeId) => get().settings[resumeId] ?? DEFAULT_SETTINGS,

      updateSettings: (resumeId, patch) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [resumeId]: { ...(state.settings[resumeId] ?? DEFAULT_SETTINGS), ...patch },
          },
        })),

      setSettings: (resumeId, settings) =>
        set((state) => ({
          settings: { ...state.settings, [resumeId]: settings },
        })),

      resetSettings: (resumeId) =>
        set((state) => ({
          settings: { ...state.settings, [resumeId]: DEFAULT_SETTINGS },
        })),

      removeSettings: (resumeId) =>
        set((state) => {
          const rest = { ...state.settings }
          delete rest[resumeId]
          return { settings: rest }
        }),
    }),
    {
      name: 'resume-builder-settings',
      version: SCHEMA_VERSION,
      storage: createDebouncedJSONStorage<SettingsState>(),
      migrate: (persistedState) => persistedState as SettingsState,
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        settings: state.settings,
      }),
    },
  ),
)
