import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionCard } from './SectionCard'
import { useResumeStore } from '../../../store/useResumeStore'
import { createBlankResume } from '../../../lib/defaultResume'
import type { Section } from '../../../types/resume'

function resetStore(section: Section) {
  const resume = createBlankResume()
  resume.sections = [section]
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

function makeSection(overrides: Partial<Section> = {}): Section {
  return {
    id: 'section-1',
    type: 'experience',
    title: 'Experience',
    visible: true,
    entries: [],
    ...overrides,
  }
}

/** Mirrors how SectionList subscribes to the store and passes a live section down. */
function ConnectedSectionCard({
  resumeId,
  sectionId,
}: {
  resumeId: string
  sectionId: string
}) {
  const section = useResumeStore((state) =>
    state.resumes
      .find((resume) => resume.id === resumeId)
      ?.sections.find((s) => s.id === sectionId),
  )
  if (!section) return null
  return <SectionCard section={section} resumeId={resumeId} />
}

describe('SectionCard', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the section title and expanded body by default', () => {
    resumeId = resetStore(makeSection())
    render(<ConnectedSectionCard resumeId={resumeId} sectionId="section-1" />)

    expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument()
    expect(
      screen.getByText("This section's fields will appear here."),
    ).toBeInTheDocument()
  })

  it('renames the section via inline edit', async () => {
    const user = userEvent.setup()
    resumeId = resetStore(makeSection())
    render(<ConnectedSectionCard resumeId={resumeId} sectionId="section-1" />)

    await user.click(screen.getByRole('button', { name: 'Experience' }))
    const input = screen.getByLabelText('Section title')
    await user.clear(input)
    await user.type(input, 'Work History')
    await user.tab()

    expect(useResumeStore.getState().resumes[0].sections[0].title).toBe(
      'Work History',
    )
    expect(screen.getByRole('button', { name: 'Work History' })).toBeInTheDocument()
  })

  it('reverts the edit on Escape without saving', async () => {
    const user = userEvent.setup()
    resumeId = resetStore(makeSection())
    render(<ConnectedSectionCard resumeId={resumeId} sectionId="section-1" />)

    await user.click(screen.getByRole('button', { name: 'Experience' }))
    const input = screen.getByLabelText('Section title')
    await user.clear(input)
    await user.type(input, 'Something Else{Escape}')

    expect(useResumeStore.getState().resumes[0].sections[0].title).toBe('Experience')
    expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument()
  })

  it('toggles visibility', async () => {
    const user = userEvent.setup()
    resumeId = resetStore(makeSection())
    render(<ConnectedSectionCard resumeId={resumeId} sectionId="section-1" />)

    await user.click(screen.getByRole('button', { name: 'Hide section' }))

    expect(useResumeStore.getState().resumes[0].sections[0].visible).toBe(false)
    expect(screen.getByRole('button', { name: 'Show section' })).toBeInTheDocument()
  })

  it('collapses and expands the body', async () => {
    const user = userEvent.setup()
    resumeId = resetStore(makeSection())
    render(<ConnectedSectionCard resumeId={resumeId} sectionId="section-1" />)

    await user.click(screen.getByRole('button', { name: 'Collapse section' }))
    expect(
      screen.queryByText("This section's fields will appear here."),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand section' }))
    expect(
      screen.getByText("This section's fields will appear here."),
    ).toBeInTheDocument()
  })

  it('removes the section after confirming', async () => {
    const user = userEvent.setup()
    resumeId = resetStore(makeSection())
    render(<ConnectedSectionCard resumeId={resumeId} sectionId="section-1" />)

    await user.click(screen.getByRole('button', { name: 'Remove section' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(useResumeStore.getState().resumes[0].sections).toHaveLength(0)
  })

  it('keeps the section when removal is cancelled', async () => {
    const user = userEvent.setup()
    resumeId = resetStore(makeSection())
    render(<ConnectedSectionCard resumeId={resumeId} sectionId="section-1" />)

    await user.click(screen.getByRole('button', { name: 'Remove section' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(useResumeStore.getState().resumes[0].sections).toHaveLength(1)
  })
})
