import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSettingsStore } from './useSettingsStore'
import { DEFAULT_SETTINGS } from '../lib/defaultResume'

describe('useSettingsStore reducers', () => {
  beforeEach(() => {
    localStorage.clear()
    useSettingsStore.setState({ settings: {} }, false)
  })

  it('returns default settings for an unknown resume', () => {
    expect(useSettingsStore.getState().getSettings('unknown-id')).toEqual(
      DEFAULT_SETTINGS,
    )
  })

  it('updates settings for a resume without affecting others', () => {
    useSettingsStore.getState().updateSettings('resume-a', { templateId: 'modern' })
    useSettingsStore.getState().updateSettings('resume-b', { accentColor: '#000000' })

    expect(useSettingsStore.getState().getSettings('resume-a')).toMatchObject({
      templateId: 'modern',
    })
    expect(useSettingsStore.getState().getSettings('resume-b')).toMatchObject({
      accentColor: '#000000',
      templateId: 'classic',
    })
  })

  it('resets settings back to defaults', () => {
    useSettingsStore.getState().updateSettings('resume-a', { templateId: 'minimal' })
    useSettingsStore.getState().resetSettings('resume-a')

    expect(useSettingsStore.getState().getSettings('resume-a')).toEqual(
      DEFAULT_SETTINGS,
    )
  })

  it('removes settings for a resume', () => {
    useSettingsStore.getState().updateSettings('resume-a', { templateId: 'modern' })
    useSettingsStore.getState().removeSettings('resume-a')

    expect(useSettingsStore.getState().settings['resume-a']).toBeUndefined()
  })
})

describe('useSettingsStore persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('survives a simulated page refresh', async () => {
    vi.useFakeTimers()
    const { useSettingsStore: store } = await import('./useSettingsStore')

    store.getState().updateSettings('resume-a', { templateId: 'modern' })
    vi.advanceTimersByTime(600)
    vi.useRealTimers()

    vi.resetModules()
    const { useSettingsStore: reloadedStore } = await import('./useSettingsStore')

    expect(reloadedStore.getState().getSettings('resume-a')).toMatchObject({
      templateId: 'modern',
    })
  })

  it('recovers from corrupted localStorage without crashing', async () => {
    localStorage.setItem('resume-builder-settings', '{not valid json')

    const { useSettingsStore: store } = await import('./useSettingsStore')

    expect(store.getState().settings).toEqual({})
    expect(localStorage.getItem('resume-builder-settings-corrupt')).toBe(
      '{not valid json',
    )
  })
})
