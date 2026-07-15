import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryForm } from './SummaryForm'
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
  return { id: 'section-1', type: 'summary', title: 'Summary', visible: true, entries: [] }
}

function ConnectedSummaryForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <SummaryForm resumeId={resumeId} section={section} />
}

describe('SummaryForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('auto-creates a single summary entry when the section has none', () => {
    render(<ConnectedSummaryForm resumeId={resumeId} />)

    const entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ type: 'summary', content: '' })
  })

  it('renders a single textarea bound to the store', async () => {
    const user = userEvent.setup()
    render(<ConnectedSummaryForm resumeId={resumeId} />)

    const textarea = screen.getByLabelText('Summary')
    await user.type(textarea, 'Experienced engineer.')

    const entries = useResumeStore.getState().resumes[0].sections[0].entries
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ content: 'Experienced engineer.' })
  })

  it('does not create a second entry on re-render', () => {
    const { rerender } = render(<ConnectedSummaryForm resumeId={resumeId} />)
    rerender(<ConnectedSummaryForm resumeId={resumeId} />)

    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(1)
  })
})
