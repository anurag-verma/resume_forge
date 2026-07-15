import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EducationForm } from './EducationForm'
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
  return { id: 'section-1', type: 'education', title: 'Education', visible: true, entries: [] }
}

function ConnectedEducationForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <EducationForm resumeId={resumeId} section={section} />
}

describe('EducationForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('shows an empty-state hint and an Add education button when there are no entries', () => {
    render(<ConnectedEducationForm resumeId={resumeId} />)

    expect(screen.getByText(/add your most recent degree/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add education/i })).toBeInTheDocument()
  })

  it('adds and fills in an entry, with the date range shown once collapsed', async () => {
    const user = userEvent.setup()
    render(<ConnectedEducationForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add education/i }))
    await user.type(screen.getByLabelText('Institution'), 'State University')
    await user.type(screen.getByLabelText('Degree'), 'B.Sc. Computer Science')
    await user.selectOptions(screen.getByLabelText('Start date month'), '08')
    await user.selectOptions(screen.getByLabelText('Start date year'), '2019')

    expect(
      screen.getByRole('checkbox', { name: /currently studying here/i }),
    ).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Collapse entry' }))

    expect(
      screen.getByText('B.Sc. Computer Science @ State University'),
    ).toBeInTheDocument()
    expect(screen.getByText('Aug 2019 – Present')).toBeInTheDocument()
  })

  it('duplicates and deletes an entry', async () => {
    const user = userEvent.setup()
    render(<ConnectedEducationForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add education/i }))
    await user.type(screen.getByLabelText('Institution'), 'State University')

    await user.click(screen.getByRole('button', { name: 'Duplicate entry' }))
    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(2)

    const [deleteButton] = screen.getAllByRole('button', { name: 'Delete entry' })
    await user.click(deleteButton)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(1)
  })
})
