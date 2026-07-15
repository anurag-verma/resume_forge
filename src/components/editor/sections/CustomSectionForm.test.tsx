import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomSectionForm } from './CustomSectionForm'
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
  return {
    id: 'section-1',
    type: 'custom',
    title: 'Awards',
    visible: true,
    entries: [],
  }
}

function ConnectedCustomSectionForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <CustomSectionForm resumeId={resumeId} section={section} />
}

describe('CustomSectionForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('shows an empty-state hint and an Add item button when there are no entries', () => {
    render(<ConnectedCustomSectionForm resumeId={resumeId} />)

    expect(screen.getByText(/doesn't fit elsewhere/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument()
  })

  it('adds an entry and fills in title, subtitle, date, and description', async () => {
    const user = userEvent.setup()
    render(<ConnectedCustomSectionForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByLabelText('Title'), 'Employee of the Year')
    await user.type(screen.getByLabelText('Subtitle'), 'Acme Corp')
    await user.type(screen.getByLabelText('Date'), '2023')
    await user.type(screen.getByLabelText('Description'), 'Recognized for **impact**')

    await user.click(screen.getByRole('button', { name: 'Collapse entry' }))

    expect(screen.getByText('Employee of the Year')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()

    const entry = useResumeStore.getState().resumes[0].sections[0].entries[0]
    expect(entry).toMatchObject({
      type: 'custom',
      title: 'Employee of the Year',
      subtitle: 'Acme Corp',
      date: '2023',
      description: 'Recognized for **impact**',
    })
  })

  it('falls back to showing the date as the subtitle line when no subtitle is set', async () => {
    const user = userEvent.setup()
    render(<ConnectedCustomSectionForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByLabelText('Title'), 'Published Article')
    await user.type(screen.getByLabelText('Date'), '2022')
    await user.click(screen.getByRole('button', { name: 'Collapse entry' }))

    expect(screen.getByText('2022')).toBeInTheDocument()
  })

  it('duplicates and deletes an entry', async () => {
    const user = userEvent.setup()
    render(<ConnectedCustomSectionForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByLabelText('Title'), 'Volunteer Work')

    await user.click(screen.getByRole('button', { name: 'Duplicate entry' }))
    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(2)

    const [deleteButton] = screen.getAllByRole('button', { name: 'Delete entry' })
    await user.click(deleteButton)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(1)
  })

  it('reorders entries via SortableList', async () => {
    const user = userEvent.setup()
    render(<ConnectedCustomSectionForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByLabelText('Title'), 'First')
    await user.click(screen.getByRole('button', { name: 'Collapse entry' }))

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByLabelText('Title'), 'Second')

    const entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries.map((e) => (e as { title: string }).title)).toEqual(['First', 'Second'])
  })
})
