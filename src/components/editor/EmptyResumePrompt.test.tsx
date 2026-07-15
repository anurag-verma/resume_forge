import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyResumePrompt } from './EmptyResumePrompt'
import { useResumeStore } from '../../store/useResumeStore'
import { createBlankResume } from '../../lib/defaultResume'

function resetStore() {
  const resume = createBlankResume()
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

describe('EmptyResumePrompt', () => {
  let resumeId: string

  beforeEach(() => {
    resumeId = resetStore()
  })

  it('shows the prompt when the resume has no name and no sections', () => {
    render(<EmptyResumePrompt resumeId={resumeId} />)
    expect(screen.getByText(/load an example/i)).toBeInTheDocument()
  })

  it('hides the prompt once the resume has a name', () => {
    useResumeStore.getState().updatePersonalInfo(resumeId, { fullName: 'Jane Doe' })
    render(<EmptyResumePrompt resumeId={resumeId} />)
    expect(screen.queryByText(/load an example/i)).not.toBeInTheDocument()
  })

  it('hides the prompt once the resume has a section', () => {
    useResumeStore.getState().addSection(resumeId, 'experience', 'Experience')
    render(<EmptyResumePrompt resumeId={resumeId} />)
    expect(screen.queryByText(/load an example/i)).not.toBeInTheDocument()
  })

  it('clicking "load an example" fills a complete believable resume in one click', async () => {
    const user = userEvent.setup()
    render(<EmptyResumePrompt resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /load an example/i }))

    const resume = useResumeStore.getState().resumes.find((r) => r.id === resumeId)!
    expect(resume.personalInfo.fullName).toBeTruthy()
    expect(resume.personalInfo.jobTitle).toBeTruthy()
    expect(resume.sections.length).toBeGreaterThan(0)
    for (const section of resume.sections) {
      expect(section.entries.length).toBeGreaterThan(0)
    }
  })

  it('returns null for a resume id that does not exist', () => {
    const { container } = render(<EmptyResumePrompt resumeId="nonexistent" />)
    expect(container).toBeEmptyDOMElement()
  })
})
