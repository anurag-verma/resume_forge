import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClassicTemplate } from './ClassicTemplate'
import { fullTestResume, testSettings } from './testFixtures'
import type { Resume } from '../../types/resume'

describe('ClassicTemplate', () => {
  it('renders the full sample resume correctly', () => {
    render(<ClassicTemplate resume={fullTestResume} settings={testSettings} />)

    // Personal info
    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument()
    expect(screen.getByText(/janedoe\.com/)).toBeInTheDocument()

    // Summary (markdown-lite bold)
    expect(screen.getByText('6 years').tagName).toBe('STRONG')

    // Experience
    expect(
      screen.getByRole('heading', { level: 3, name: 'Senior Software Engineer, Acme Corp' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Remote/)).toBeInTheDocument()
    expect(screen.getByText(/Apr 2023 – Present/)).toBeInTheDocument()
    expect(screen.getByText('Led a team of 4 engineers.')).toBeInTheDocument()

    // Education
    expect(
      screen.getByRole('heading', { level: 3, name: 'B.Sc. Computer Science, State University' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Aug 2015 – May 2019/)).toBeInTheDocument()

    // Skills, grouped and ungrouped
    expect(screen.getByText(/Languages:/)).toBeInTheDocument()
    expect(screen.getByText(/TypeScript, React/)).toBeInTheDocument()
    expect(screen.getByText('Git')).toBeInTheDocument()

    // Projects
    expect(screen.getByRole('heading', { level: 3, name: 'ResumeForge' })).toBeInTheDocument()
    expect(screen.getByText(/React, TypeScript/)).toBeInTheDocument()

    // Certifications
    expect(
      screen.getByRole('heading', { level: 3, name: 'Certified Kubernetes Administrator' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/CNCF/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 2024/)).toBeInTheDocument()

    // Languages
    expect(screen.getByText('French (Fluent)')).toBeInTheDocument()

    // Custom section
    expect(
      screen.getByRole('heading', { level: 3, name: 'Weekly Coding Mentor' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Local Coding Club/)).toBeInTheDocument()

    // Hidden section is not rendered
    expect(screen.queryByText('Hidden Section')).not.toBeInTheDocument()
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument()
  })

  it('falls back to placeholder name when personal info is empty', () => {
    const blankResume: Resume = {
      ...fullTestResume,
      personalInfo: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
      },
      sections: [],
    }
    render(<ClassicTemplate resume={blankResume} settings={testSettings} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Your Name' })).toBeInTheDocument()
  })

  it('applies section spacing / accent / font CSS variables to the root element', () => {
    const { container } = render(
      <ClassicTemplate resume={fullTestResume} settings={testSettings} />,
    )
    const root = container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--accent')).toBe('#2456A6')
    expect(root.style.getPropertyValue('--font-heading')).toContain('Source Serif 4')
    expect(root.style.getPropertyValue('--section-spacing')).toBe('16px')
  })

  it('marks section headings and entries as break-safe for print pagination', () => {
    const { container } = render(
      <ClassicTemplate resume={fullTestResume} settings={testSettings} />,
    )

    const sectionHeadings = container.querySelectorAll('h2.break-after-avoid-page')
    expect(sectionHeadings.length).toBeGreaterThan(0)

    const entryHeadings = container.querySelectorAll('h3.break-after-avoid-page')
    expect(entryHeadings.length).toBeGreaterThan(0)

    const breakInsideAvoidBlocks = container.querySelectorAll('.break-inside-avoid')
    expect(breakInsideAvoidBlocks.length).toBeGreaterThan(0)
  })
})
