import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomizePanel } from './CustomizePanel'
import { useSettingsStore } from '../../store/useSettingsStore'
import { DEFAULT_SETTINGS } from '../../lib/defaultResume'
import type { Settings } from '../../types/resume'

const RESUME_ID = 'resume-1'

function seedSettings(overrides: Partial<Settings> = {}): Settings {
  const settings: Settings = { ...DEFAULT_SETTINGS, ...overrides }
  useSettingsStore.setState({ settings: { [RESUME_ID]: settings } })
  return settings
}

function renderWithLiveSettings() {
  function Wrapper() {
    const settings = useSettingsStore((state) => state.getSettings(RESUME_ID))
    return <CustomizePanel open onClose={() => {}} resumeId={RESUME_ID} settings={settings} />
  }
  return render(<Wrapper />)
}

describe('CustomizePanel', () => {
  beforeEach(() => {
    useSettingsStore.setState({ settings: {} })
  })

  it('clicking an accent swatch updates the settings store', async () => {
    const user = userEvent.setup()
    seedSettings()
    renderWithLiveSettings()

    await user.click(screen.getByRole('button', { name: 'Teal' }))

    expect(useSettingsStore.getState().getSettings(RESUME_ID).accentColor).toBe('#0F766E')
  })

  it('typing a custom hex and blurring (tabbing away) commits it', async () => {
    const user = userEvent.setup()
    seedSettings()
    renderWithLiveSettings()

    const hexInput = screen.getByLabelText('Custom hex')
    await user.clear(hexInput)
    await user.type(hexInput, '#123456')
    await user.tab()

    expect(useSettingsStore.getState().getSettings(RESUME_ID).accentColor).toBe('#123456')
  })

  it('rejects an invalid hex with an inline error and does not update the store', async () => {
    const user = userEvent.setup()
    seedSettings()
    renderWithLiveSettings()

    const hexInput = screen.getByLabelText('Custom hex')
    await user.clear(hexInput)
    await user.type(hexInput, 'not-a-color')
    await user.tab()

    expect(screen.getByRole('alert')).toHaveTextContent(/valid hex color/i)
    expect(useSettingsStore.getState().getSettings(RESUME_ID).accentColor).toBe(
      DEFAULT_SETTINGS.accentColor,
    )
  })

  it('warns when a valid but low-contrast custom hex is committed', async () => {
    const user = userEvent.setup()
    seedSettings()
    renderWithLiveSettings()

    const hexInput = screen.getByLabelText('Custom hex')
    await user.clear(hexInput)
    await user.type(hexInput, '#F5F5F5')
    await user.tab()

    expect(screen.getByRole('alert')).toHaveTextContent(/low contrast/i)
  })

  it('selecting a font pair radio updates the store', async () => {
    const user = userEvent.setup()
    seedSettings()
    renderWithLiveSettings()

    await user.click(screen.getByRole('radio', { name: 'Inter' }))

    expect(useSettingsStore.getState().getSettings(RESUME_ID).fontPairId).toBe('inter')
  })

  it('clicking a font size option updates the store', async () => {
    const user = userEvent.setup()
    seedSettings()
    renderWithLiveSettings()

    await user.click(screen.getByRole('button', { name: 'L' }))

    expect(useSettingsStore.getState().getSettings(RESUME_ID).fontScale).toBe('lg')
  })

  it('moving the line spacing slider updates the store', () => {
    seedSettings()
    renderWithLiveSettings()

    const slider = screen.getByLabelText(/line spacing/i)
    fireEvent.change(slider, { target: { value: '1.6' } })

    expect(useSettingsStore.getState().getSettings(RESUME_ID).lineSpacing).toBe(1.6)
  })

  it('"Reset to template defaults" restores that template\'s own defaults, keeping templateId', async () => {
    const user = userEvent.setup()
    seedSettings({
      templateId: 'modern',
      accentColor: '#123456',
      fontPairId: 'classic-serif',
      fontScale: 'lg',
      lineSpacing: 1.6,
      sectionSpacing: 32,
    })
    renderWithLiveSettings()

    await user.click(screen.getByRole('button', { name: /reset to template defaults/i }))

    const settings = useSettingsStore.getState().getSettings(RESUME_ID)
    expect(settings.templateId).toBe('modern')
    expect(settings.fontPairId).toBe('inter')
    expect(settings.fontScale).toBe('md')
  })
})
