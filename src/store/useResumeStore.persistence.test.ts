import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useResumeStore persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('survives a simulated page refresh', async () => {
    vi.useFakeTimers()
    const { useResumeStore } = await import('./useResumeStore')

    const id = useResumeStore.getState().activeResumeId
    useResumeStore.getState().renameResume(id, 'Refreshed Resume')

    // flush the debounced write (Architecture doc §5.1: ~500ms)
    vi.advanceTimersByTime(600)
    vi.useRealTimers()

    vi.resetModules()
    const { useResumeStore: reloadedStore } = await import('./useResumeStore')

    const resume = reloadedStore.getState().resumes.find((r) => r.id === id)
    expect(resume?.name).toBe('Refreshed Resume')
    expect(reloadedStore.getState().activeResumeId).toBe(id)
  })

  it('recovers from corrupted localStorage without crashing', async () => {
    localStorage.setItem('resume-builder-data', '{not valid json')

    const { useResumeStore } = await import('./useResumeStore')

    expect(useResumeStore.getState().resumes.length).toBeGreaterThan(0)
    expect(localStorage.getItem('resume-builder-data-corrupt')).toBe(
      '{not valid json',
    )
  })
})
