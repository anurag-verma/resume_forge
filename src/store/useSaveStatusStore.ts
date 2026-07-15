import { create } from 'zustand'

interface SaveStatusState {
  status: 'saving' | 'saved'
  lastSavedAt: string | null
  pendingCount: number
  beginSave: () => void
  endSave: (success: boolean) => void
}

/**
 * Tracks debounced-persistence status across every store using
 * `createDebouncedJSONStorage` (resume + settings). `pendingCount` lets
 * multiple stores debounce independently while the chip only reports
 * "saved" once every in-flight write has actually landed.
 */
export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  status: 'saved',
  lastSavedAt: null,
  pendingCount: 0,

  beginSave: () =>
    set((state) => ({ pendingCount: state.pendingCount + 1, status: 'saving' })),

  endSave: (success) =>
    set((state) => {
      const pendingCount = Math.max(0, state.pendingCount - 1)
      if (pendingCount > 0) return { pendingCount }
      return success
        ? { pendingCount, status: 'saved', lastSavedAt: new Date().toISOString() }
        : { pendingCount, status: 'saved' }
    }),
}))
