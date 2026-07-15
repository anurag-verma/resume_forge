import { describe, it, expect, beforeEach } from 'vitest'
import { useSaveStatusStore } from './useSaveStatusStore'

describe('useSaveStatusStore', () => {
  beforeEach(() => {
    useSaveStatusStore.setState({ status: 'saved', lastSavedAt: null, pendingCount: 0 })
  })

  it('starts saved with no timestamp', () => {
    const state = useSaveStatusStore.getState()
    expect(state.status).toBe('saved')
    expect(state.lastSavedAt).toBeNull()
  })

  it('flips to saving as soon as a save begins', () => {
    useSaveStatusStore.getState().beginSave()
    expect(useSaveStatusStore.getState().status).toBe('saving')
  })

  it('flips back to saved with a timestamp once the save completes successfully', () => {
    useSaveStatusStore.getState().beginSave()
    useSaveStatusStore.getState().endSave(true)

    const state = useSaveStatusStore.getState()
    expect(state.status).toBe('saved')
    expect(state.lastSavedAt).not.toBeNull()
  })

  it('stays saving until every overlapping in-flight save has ended', () => {
    useSaveStatusStore.getState().beginSave()
    useSaveStatusStore.getState().beginSave()

    useSaveStatusStore.getState().endSave(true)
    expect(useSaveStatusStore.getState().status).toBe('saving')

    useSaveStatusStore.getState().endSave(true)
    expect(useSaveStatusStore.getState().status).toBe('saved')
  })

  it('does not stamp a new lastSavedAt when the save failed', () => {
    useSaveStatusStore.getState().beginSave()
    useSaveStatusStore.getState().endSave(false)

    const state = useSaveStatusStore.getState()
    expect(state.status).toBe('saved')
    expect(state.lastSavedAt).toBeNull()
  })

  it('pendingCount never goes negative from an unmatched endSave', () => {
    useSaveStatusStore.getState().endSave(true)
    expect(useSaveStatusStore.getState().pendingCount).toBe(0)
  })
})
