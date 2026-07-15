import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createDebouncedJSONStorage } from './persistStorage'
import { useSaveStatusStore } from '../store/useSaveStatusStore'

describe('createDebouncedJSONStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    useSaveStatusStore.setState({ status: 'saved', lastSavedAt: null, pendingCount: 0 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces writes and only persists the latest value', () => {
    const storage = createDebouncedJSONStorage({ delay: 500 })
    storage.setItem('key', { state: { a: 1 }, version: 1 })
    storage.setItem('key', { state: { a: 2 }, version: 1 })

    expect(localStorage.getItem('key')).toBeNull()

    vi.advanceTimersByTime(500)

    expect(JSON.parse(localStorage.getItem('key')!)).toEqual({
      state: { a: 2 },
      version: 1,
    })
  })

  it('recovers from corrupt JSON by backing it up and returning null', () => {
    localStorage.setItem('key', '{not valid json')
    const onCorruptData = vi.fn()
    const storage = createDebouncedJSONStorage({ onCorruptData })

    const result = storage.getItem('key')

    expect(result).toBeNull()
    expect(localStorage.getItem('key')).toBeNull()
    expect(localStorage.getItem('key-corrupt')).toBe('{not valid json')
    expect(onCorruptData).toHaveBeenCalledWith('key')
  })

  it('returns valid parsed data untouched', () => {
    localStorage.setItem('key', JSON.stringify({ state: { a: 1 }, version: 1 }))
    const storage = createDebouncedJSONStorage()

    expect(storage.getItem('key')).toEqual({ state: { a: 1 }, version: 1 })
  })

  it('calls onQuotaExceeded and does not throw when localStorage.setItem fails', () => {
    const onQuotaExceeded = vi.fn()
    const storage = createDebouncedJSONStorage({ onQuotaExceeded })
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    storage.setItem('key', { state: {}, version: 1 })

    expect(() => vi.advanceTimersByTime(500)).not.toThrow()
    expect(onQuotaExceeded).toHaveBeenCalledWith('key')

    spy.mockRestore()
  })

  it('removeItem clears pending timers and the stored value', () => {
    const storage = createDebouncedJSONStorage()
    storage.setItem('key', { state: { a: 1 }, version: 1 })
    storage.removeItem('key')

    vi.advanceTimersByTime(500)

    expect(localStorage.getItem('key')).toBeNull()
  })

  it('reports "saving" immediately on setItem and "saved" with a timestamp once the debounced write lands', () => {
    const storage = createDebouncedJSONStorage({ delay: 500 })
    storage.setItem('key', { state: { a: 1 }, version: 1 })

    expect(useSaveStatusStore.getState().status).toBe('saving')

    vi.advanceTimersByTime(500)

    const state = useSaveStatusStore.getState()
    expect(state.status).toBe('saved')
    expect(state.lastSavedAt).not.toBeNull()
  })

  it('re-scheduling the same key before it fires does not create extra pending saves', () => {
    const storage = createDebouncedJSONStorage({ delay: 500 })
    storage.setItem('key', { state: { a: 1 }, version: 1 })
    storage.setItem('key', { state: { a: 2 }, version: 1 })

    expect(useSaveStatusStore.getState().pendingCount).toBe(1)

    vi.advanceTimersByTime(500)

    expect(useSaveStatusStore.getState().pendingCount).toBe(0)
    expect(useSaveStatusStore.getState().status).toBe('saved')
  })
})
