import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExperienceForm } from './ExperienceForm'
import { useResumeStore } from '../../../store/useResumeStore'
import { createBlankResume } from '../../../lib/defaultResume'
import type { ExperienceEntry, Section } from '../../../types/resume'

function resetStore(section: Section) {
  const resume = createBlankResume()
  resume.sections = [section]
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

function makeSection(): Section {
  return { id: 'section-1', type: 'experience', title: 'Experience', visible: true, entries: [] }
}

function getFirstExperienceEntry(): ExperienceEntry {
  return useResumeStore.getState().resumes[0].sections[0].entries[0] as ExperienceEntry
}

/** Mirrors SectionList/SectionBody subscribing to the live section from the store. */
function ConnectedExperienceForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <ExperienceForm resumeId={resumeId} section={section} />
}

describe('ExperienceForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('shows an empty-state hint and an Add experience button when there are no entries', () => {
    render(<ConnectedExperienceForm resumeId={resumeId} />)

    expect(screen.getByText(/add your most recent role first/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument()
  })

  it('adds a new entry, expanded by default, and fills it in', async () => {
    const user = userEvent.setup()
    render(<ConnectedExperienceForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add experience/i }))

    expect(screen.getByLabelText('Role')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Role'), 'Software Engineer')
    await user.type(screen.getByLabelText('Company'), 'Acme Corp')

    const entry = useResumeStore.getState().resumes[0].sections[0].entries[0]
    expect(entry).toMatchObject({ role: 'Software Engineer', company: 'Acme Corp' })
  })

  it('renders the date range as "Mon YYYY – Present" in the collapsed summary', async () => {
    const user = userEvent.setup()
    render(<ConnectedExperienceForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add experience/i }))
    await user.type(screen.getByLabelText('Role'), 'Engineer')
    await user.selectOptions(screen.getByLabelText('Start date month'), '04')
    await user.selectOptions(screen.getByLabelText('Start date year'), '2023')

    await user.click(screen.getByRole('button', { name: 'Collapse entry' }))

    expect(screen.getByText('Apr 2023 – Present')).toBeInTheDocument()
  })

  it('sets endDate to null when "Currently working here" is checked, and back to a date when unchecked', async () => {
    const user = userEvent.setup()
    render(<ConnectedExperienceForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add experience/i }))

    const checkbox = screen.getByRole('checkbox', { name: /currently working here/i })
    expect(checkbox).toBeChecked()
    expect(getFirstExperienceEntry().endDate).toBeNull()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(getFirstExperienceEntry().endDate).not.toBeNull()
  })

  it('duplicates an entry', async () => {
    const user = userEvent.setup()
    render(<ConnectedExperienceForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add experience/i }))
    await user.type(screen.getByLabelText('Role'), 'Engineer')

    await user.click(screen.getByRole('button', { name: 'Duplicate entry' }))

    const entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries).toHaveLength(2)
    expect(entries[1]).toMatchObject({ role: 'Engineer' })
    expect(entries[1].id).not.toBe(entries[0].id)
  })

  it('deletes an entry after confirming', async () => {
    const user = userEvent.setup()
    render(<ConnectedExperienceForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add experience/i }))
    await user.click(screen.getByRole('button', { name: 'Delete entry' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(0)
    expect(screen.getByText(/add your most recent role first/i)).toBeInTheDocument()
  })
})
