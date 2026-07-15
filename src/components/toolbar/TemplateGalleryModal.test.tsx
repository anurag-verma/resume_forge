import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateGalleryModal } from './TemplateGalleryModal'
import { useSettingsStore } from '../../store/useSettingsStore'
import { fullTestResume, testSettings } from '../templates/testFixtures'

describe('TemplateGalleryModal', () => {
  beforeEach(() => {
    localStorage.clear()
    useSettingsStore.setState({ settings: {} }, false)
  })

  it('lists all three templates with Classic marked ATS-friendly', async () => {
    render(
      <TemplateGalleryModal
        open
        onClose={() => {}}
        resume={fullTestResume}
        settings={testSettings}
      />,
    )

    expect(await screen.findByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Modern')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()

    const classicCard = screen.getByText('Classic').closest('button') as HTMLElement
    expect(within(classicCard).getByText('ATS-friendly')).toBeInTheDocument()

    const modernCard = screen.getByText('Modern').closest('button') as HTMLElement
    expect(within(modernCard).queryByText('ATS-friendly')).not.toBeInTheDocument()
  })

  it('marks the currently active template as pressed', async () => {
    render(
      <TemplateGalleryModal
        open
        onClose={() => {}}
        resume={fullTestResume}
        settings={testSettings}
      />,
    )
    await screen.findByText('Classic')

    const classicCard = screen.getByText('Classic').closest('button') as HTMLElement
    const modernCard = screen.getByText('Modern').closest('button') as HTMLElement
    expect(classicCard).toHaveAttribute('aria-pressed', 'true')
    expect(modernCard).toHaveAttribute('aria-pressed', 'false')
  })

  it('selecting a template updates settings and closes the modal, without touching resume content', async () => {
    const user = userEvent.setup()
    let closed = false
    render(
      <TemplateGalleryModal
        open
        onClose={() => {
          closed = true
        }}
        resume={fullTestResume}
        settings={testSettings}
      />,
    )
    await screen.findByText('Modern')

    const modernCard = screen.getByText('Modern').closest('button') as HTMLElement
    await user.click(modernCard)

    expect(useSettingsStore.getState().getSettings(fullTestResume.id).templateId).toBe(
      'modern',
    )
    expect(closed).toBe(true)
    // Resume content is untouched — the fixture object itself never changes.
    expect(fullTestResume.personalInfo.fullName).toBe('Jane Doe')
  })
})
