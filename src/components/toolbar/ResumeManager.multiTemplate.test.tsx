import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResumeManager } from './ResumeManager'
import { useResumeStore } from '../../store/useResumeStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { createBlankResume, DEFAULT_SETTINGS } from '../../lib/defaultResume'

function resetStore() {
  const resume = createBlankResume('Resume A')
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  useSettingsStore.setState({ settings: { [resume.id]: DEFAULT_SETTINGS } }, false)
  return resume.id
}

describe('Two resumes with different templates coexist', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('each resume keeps its own templateId independently', async () => {
    const user = userEvent.setup()
    const idA = resetStore()

    const idB = useResumeStore.getState().createResume('Resume B')
    useSettingsStore.getState().updateSettings(idB, { templateId: 'modern' })
    useSettingsStore.getState().updateSettings(idA, { templateId: 'classic' })

    expect(useSettingsStore.getState().getSettings(idA).templateId).toBe('classic')
    expect(useSettingsStore.getState().getSettings(idB).templateId).toBe('modern')

    render(<ResumeManager />)

    // switching is instant: no async wait needed beyond the click itself
    await user.click(screen.getByRole('button', { name: /resume b/i }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Resume A' }))

    expect(useResumeStore.getState().activeResumeId).toBe(idA)
    // settings for both resumes remain untouched by the switch
    expect(useSettingsStore.getState().getSettings(idA).templateId).toBe('classic')
    expect(useSettingsStore.getState().getSettings(idB).templateId).toBe('modern')
  })

  it('switching back and forth never mixes up settings between resumes', async () => {
    const user = userEvent.setup()
    const idA = resetStore()
    const idB = useResumeStore.getState().createResume('Resume B')
    useSettingsStore.getState().updateSettings(idA, { templateId: 'classic', accentColor: '#111111' })
    useSettingsStore.getState().updateSettings(idB, { templateId: 'minimal', accentColor: '#222222' })

    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /resume b/i }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Resume A' }))
    expect(useResumeStore.getState().activeResumeId).toBe(idA)

    await user.click(screen.getByRole('button', { name: /resume a/i }))
    await user.click(screen.getByRole('menuitemradio', { name: 'Resume B' }))
    expect(useResumeStore.getState().activeResumeId).toBe(idB)

    expect(useSettingsStore.getState().getSettings(idA)).toMatchObject({
      templateId: 'classic',
      accentColor: '#111111',
    })
    expect(useSettingsStore.getState().getSettings(idB)).toMatchObject({
      templateId: 'minimal',
      accentColor: '#222222',
    })
  })
})
