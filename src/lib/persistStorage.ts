import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { useSaveStatusStore } from '../store/useSaveStatusStore'

const DEFAULT_DEBOUNCE_MS = 500

export interface DebouncedJSONStorageOptions {
  delay?: number
  onCorruptData?: (name: string) => void
  onQuotaExceeded?: (name: string) => void
}

/**
 * A zustand persist storage adapter backed by localStorage that:
 * - debounces writes (Architecture doc §5.1: ~500ms) to avoid excessive serialization
 * - recovers from corrupt JSON by backing up the raw string under `${name}-corrupt`
 *   and starting fresh, rather than throwing and crashing the app (Security doc §5)
 * - swallows QuotaExceededError so a full disk doesn't crash the app (Security doc §4.2 risk)
 */
export function createDebouncedJSONStorage<S>(
  options: DebouncedJSONStorageOptions = {},
): PersistStorage<S> {
  const {
    delay = DEFAULT_DEBOUNCE_MS,
    onCorruptData = (name) =>
      console.warn(`[ResumeForge] Corrupt data recovered for "${name}"; backed up and reset.`),
    onQuotaExceeded = (name) =>
      console.warn(`[ResumeForge] Storage quota exceeded saving "${name}". Export a backup.`),
  } = options
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  return {
    getItem: (name) => {
      const raw = localStorage.getItem(name)
      if (raw === null) return null
      try {
        return JSON.parse(raw) as StorageValue<S>
      } catch {
        try {
          localStorage.setItem(`${name}-corrupt`, raw)
        } catch {
          // best-effort backup only; ignore if quota is also exceeded here
        }
        localStorage.removeItem(name)
        onCorruptData?.(name)
        return null
      }
    },
    setItem: (name, value) => {
      const pending = timers.get(name)
      if (pending) {
        clearTimeout(pending)
      } else {
        useSaveStatusStore.getState().beginSave()
      }

      const timer = setTimeout(() => {
        timers.delete(name)
        try {
          localStorage.setItem(name, JSON.stringify(value))
          useSaveStatusStore.getState().endSave(true)
        } catch (err) {
          if (err instanceof DOMException && err.name === 'QuotaExceededError') {
            onQuotaExceeded?.(name)
            useSaveStatusStore.getState().endSave(false)
          } else {
            useSaveStatusStore.getState().endSave(false)
            throw err
          }
        }
      }, delay)

      timers.set(name, timer)
    },
    removeItem: (name) => {
      const pending = timers.get(name)
      if (pending) {
        clearTimeout(pending)
        useSaveStatusStore.getState().endSave(false)
      }
      timers.delete(name)
      localStorage.removeItem(name)
    },
  }
}
