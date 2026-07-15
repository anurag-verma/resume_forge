import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ClassicTemplate } from './ClassicTemplate'
import { ModernTemplate } from './ModernTemplate'
import { MinimalTemplate } from './MinimalTemplate'
import { fullTestResume, testSettings } from './testFixtures'

const EXPECTED_CONTENT = [
  'Jane Doe',
  'Senior Software Engineer, Acme Corp',
  'B.Sc. Computer Science, State University',
  'ResumeForge',
  'Certified Kubernetes Administrator',
  'French (Fluent)',
  'Weekly Coding Mentor',
]

const templates = [
  { name: 'Classic', Component: ClassicTemplate, templateId: 'classic' as const },
  { name: 'Modern', Component: ModernTemplate, templateId: 'modern' as const },
  { name: 'Minimal', Component: MinimalTemplate, templateId: 'minimal' as const },
]

describe('lossless switching between templates', () => {
  it.each(templates)('$name renders every piece of the same resume data', ({ Component, templateId }) => {
    const { container } = render(
      <Component resume={fullTestResume} settings={{ ...testSettings, templateId }} />,
    )
    const text = container.textContent ?? ''

    for (const expected of EXPECTED_CONTENT) {
      expect(text).toContain(expected)
    }
  })

  it('renders identical underlying content across all three templates, given the same resume', () => {
    const renders = templates.map(({ Component, templateId }) => {
      const { container, unmount } = render(
        <Component resume={fullTestResume} settings={{ ...testSettings, templateId }} />,
      )
      const text = container.textContent ?? ''
      unmount()
      return text
    })

    for (const expected of EXPECTED_CONTENT) {
      for (const text of renders) {
        expect(text).toContain(expected)
      }
    }
  })
})
