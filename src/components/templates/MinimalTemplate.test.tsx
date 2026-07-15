import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MinimalTemplate } from './MinimalTemplate'
import { fullTestResume, testSettings } from './testFixtures'

const minimalSettings = { ...testSettings, templateId: 'minimal' as const, fontPairId: 'spectral-inter' }

describe('MinimalTemplate', () => {
  it('renders the full sample resume correctly', () => {
    render(<MinimalTemplate resume={fullTestResume} settings={minimalSettings} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 3, name: 'Senior Software Engineer, Acme Corp' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Apr 2023 – Present/)).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 3, name: 'B.Sc. Computer Science, State University' }),
    ).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 3, name: 'ResumeForge' })).toBeInTheDocument()
    expect(screen.getByText('French (Fluent)')).toBeInTheDocument()

    expect(screen.queryByText('Hidden Section')).not.toBeInTheDocument()
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument()
  })

  it('applies accent color only to the name underline, not to section headings', () => {
    const { container } = render(
      <MinimalTemplate resume={fullTestResume} settings={minimalSettings} />,
    )

    const nameHeading = screen.getByRole('heading', { level: 1, name: 'Jane Doe' })
    expect(nameHeading.style.borderColor).toBe('var(--accent)')

    const sectionHeadings = container.querySelectorAll('h2')
    expect(sectionHeadings.length).toBeGreaterThan(0)
    for (const heading of Array.from(sectionHeadings)) {
      const style = (heading as HTMLElement).style
      expect(style.color).toBe('')
      expect(style.borderColor).toBe('')
    }
  })

  it('uses Spectral for headings and Inter for body text', () => {
    const { container } = render(
      <MinimalTemplate resume={fullTestResume} settings={minimalSettings} />,
    )
    const root = container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--font-heading')).toContain('Spectral')
    expect(root.style.getPropertyValue('--font-body')).toContain('Inter')
  })

  it('marks section headings and entries as break-safe for print pagination', () => {
    const { container } = render(
      <MinimalTemplate resume={fullTestResume} settings={minimalSettings} />,
    )

    expect(container.querySelectorAll('h2.break-after-avoid-page').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('h3.break-after-avoid-page').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.break-inside-avoid').length).toBeGreaterThan(0)
  })
})
