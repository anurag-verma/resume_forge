import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguagesForm } from './LanguagesForm'
import { useResumeStore } from '../../../store/useResumeStore'
import { createBlankResume } from '../../../lib/defaultResume'
import type { Section } from '../../../types/resume'

function resetStore(section: Section) {
  const resume = createBlankResume()
  resume.sections = [section]
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

function makeSection(): Section {
  return { id: 'section-1', type: 'languages', title: 'Languages', visible: true, entries: [] }
}

function ConnectedLanguagesForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <LanguagesForm resumeId={resumeId} section={section} />
}

describe('LanguagesForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('shows an empty-state hint and an Add language button when there are no entries', () => {
    render(<ConnectedLanguagesForm resumeId={resumeId} />)

    expect(screen.getByText(/add a language/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add language/i })).toBeInTheDocument()
  })

  it('adds an entry defaulting to Conversational, and lets proficiency be changed', async () => {
    const user = userEvent.setup()
    render(<ConnectedLanguagesForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add language/i }))
    await user.type(screen.getByLabelText('Language'), 'Spanish')

    expect(useResumeStore.getState().resumes[0].sections[0].entries[0]).toMatchObject({
      name: 'Spanish',
      proficiency: 'Conversational',
    })

    await user.selectOptions(screen.getByLabelText('Proficiency'), 'Fluent')

    expect(
      useResumeStore.getState().resumes[0].sections[0].entries[0],
    ).toMatchObject({ proficiency: 'Fluent' })
  })

  it('duplicates and deletes an entry', async () => {
    const user = userEvent.setup()
    render(<ConnectedLanguagesForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add language/i }))
    await user.type(screen.getByLabelText('Language'), 'French')

    await user.click(screen.getByRole('button', { name: 'Duplicate entry' }))
    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(2)

    const [deleteButton] = screen.getAllByRole('button', { name: 'Delete entry' })
    await user.click(deleteButton)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(1)
  })
})
