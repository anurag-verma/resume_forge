import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ResumeDocument } from './ResumeDocument'
import { createBlankResume, DEFAULT_SETTINGS } from '../../lib/defaultResume'

const renderSpy = vi.fn(() => <div>template</div>)

vi.mock('../templates', () => ({
  getTemplateDefinition: () => ({
    id: 'classic',
    name: 'Classic',
    component: renderSpy,
  }),
}))

describe('ResumeDocument', () => {
  it('does not re-render the template when resume/settings props are referentially unchanged', () => {
    renderSpy.mockClear()
    const resume = createBlankResume()
    const settings = DEFAULT_SETTINGS

    const { rerender } = render(<ResumeDocument resume={resume} settings={settings} />)
    expect(renderSpy).toHaveBeenCalledTimes(1)

    // Same object references, as a memoized Zustand selector would pass on an
    // unrelated re-render (e.g. PreviewPane's own zoom state changing).
    rerender(<ResumeDocument resume={resume} settings={settings} />)
    expect(renderSpy).toHaveBeenCalledTimes(1)

    // A genuinely new resume reference (real content change) still re-renders.
    rerender(<ResumeDocument resume={{ ...resume }} settings={settings} />)
    expect(renderSpy).toHaveBeenCalledTimes(2)
  })
})
