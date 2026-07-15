import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModernTemplate } from './ModernTemplate'
import { fullTestResume, testSettings } from './testFixtures'

const modernSettings = { ...testSettings, templateId: 'modern' as const }

describe('ModernTemplate', () => {
  it('renders the full sample resume correctly', () => {
    render(<ModernTemplate resume={fullTestResume} settings={modernSettings} />)

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

    expect(
      screen.getByRole('heading', { level: 3, name: 'Certified Kubernetes Administrator' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 3, name: 'Weekly Coding Mentor' }),
    ).toBeInTheDocument()

    expect(screen.queryByText('Hidden Section')).not.toBeInTheDocument()
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument()
  })

  it('puts Skills and Languages in the sidebar, alongside contact info', () => {
    const { container } = render(
      <ModernTemplate resume={fullTestResume} settings={modernSettings} />,
    )
    const aside = container.querySelector('aside') as HTMLElement
    const main = container.querySelector('main') as HTMLElement

    expect(aside).not.toBeNull()
    expect(main).not.toBeNull()

    // Contact info is in the sidebar
    expect(aside.textContent).toContain('jane@example.com')
    expect(aside.textContent).toContain('Contact')

    // Skills and Languages are in the sidebar
    expect(aside.textContent).toContain('French (Fluent)')
    expect(aside.textContent).toMatch(/Languages:.*TypeScript, React/)

    // Everything else stays in the main column
    expect(main.textContent).toContain('Senior Software Engineer, Acme Corp')
    expect(main.textContent).toContain('ResumeForge')
    expect(main.textContent).not.toContain('French (Fluent)')
  })

  it('applies accent/font CSS variables to the root element', () => {
    const { container } = render(
      <ModernTemplate resume={fullTestResume} settings={modernSettings} />,
    )
    const root = container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--accent')).toBe('#2456A6')
  })

  it('marks section headings and entries as break-safe for print pagination', () => {
    const { container } = render(
      <ModernTemplate resume={fullTestResume} settings={modernSettings} />,
    )

    expect(container.querySelectorAll('h2.break-after-avoid-page').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('h3.break-after-avoid-page').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.break-inside-avoid').length).toBeGreaterThan(0)
  })
})
