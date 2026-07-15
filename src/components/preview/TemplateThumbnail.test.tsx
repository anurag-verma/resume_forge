import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TemplateThumbnail } from './TemplateThumbnail'
import { fullTestResume, testSettings } from '../templates/testFixtures'

describe('TemplateThumbnail', () => {
  it('renders the live template content, scaled down', async () => {
    const { container } = render(
      <TemplateThumbnail resume={fullTestResume} settings={testSettings} />,
    )

    expect(await screen.findByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument()

    const scaledWrapper = container.querySelector('[style*="scale"]') as HTMLElement
    expect(scaledWrapper).not.toBeNull()
    expect(scaledWrapper.style.transform).toMatch(/scale\(0\.\d+\)/)
  })

  it('renders the requested template variant', async () => {
    render(
      <TemplateThumbnail
        resume={fullTestResume}
        settings={{ ...testSettings, templateId: 'modern' }}
      />,
    )

    // Modern's sidebar renders a "Contact" heading; Classic does not.
    expect(await screen.findByText('Contact')).toBeInTheDocument()
  })
})
