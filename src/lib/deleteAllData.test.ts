import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { deleteAllData } from './deleteAllData'

describe('deleteAllData', () => {
  let reloadSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // jsdom's window.location.reload isn't configurable, so vi.spyOn can't
    // touch it directly — stub the whole `location` object instead.
    reloadSpy = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload: reloadSpy })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('clears localStorage completely', () => {
    localStorage.setItem('resume-builder-data', '{"resumes":[]}')
    localStorage.setItem('resume-builder-settings', '{"settings":{}}')
    localStorage.setItem('some-other-key', 'value')

    deleteAllData()

    expect(localStorage.length).toBe(0)
    expect(localStorage.getItem('resume-builder-data')).toBeNull()
    expect(localStorage.getItem('resume-builder-settings')).toBeNull()
  })

  it('reloads the page', () => {
    deleteAllData()
    expect(reloadSpy).toHaveBeenCalledOnce()
  })
})
