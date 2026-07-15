import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonalInfoForm } from './PersonalInfoForm'
import { useResumeStore } from '../../../store/useResumeStore'
import { createBlankResume } from '../../../lib/defaultResume'

function resetStore() {
  const resume = createBlankResume()
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

describe('PersonalInfoForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore()
  })

  it('renders all personal info fields', () => {
    render(<PersonalInfoForm resumeId={resumeId} />)

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
  })

  it('updates the store when typing into a field', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoForm resumeId={resumeId} />)

    await user.type(screen.getByLabelText('Full Name'), 'Jane Doe')

    expect(
      useResumeStore
        .getState()
        .resumes.find((resume) => resume.id === resumeId)?.personalInfo.fullName,
    ).toBe('Jane Doe')
  })

  it('updates the store for every field', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoForm resumeId={resumeId} />)

    await user.type(screen.getByLabelText('Job Title'), 'Engineer')
    await user.type(screen.getByLabelText('Phone'), '555-0100')
    await user.type(screen.getByLabelText('Location'), 'Remote')
    await user.type(screen.getByLabelText('Website'), 'https://example.com')
    await user.type(screen.getByLabelText('LinkedIn'), 'linkedin.com/in/jane')
    await user.type(screen.getByLabelText('GitHub'), 'github.com/jane')

    const info = useResumeStore
      .getState()
      .resumes.find((resume) => resume.id === resumeId)!.personalInfo

    expect(info).toMatchObject({
      jobTitle: 'Engineer',
      phone: '555-0100',
      location: 'Remote',
      website: 'https://example.com',
      linkedin: 'linkedin.com/in/jane',
      github: 'github.com/jane',
    })
  })

  it('shows a soft warning for an invalid email but still updates the store', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoForm resumeId={resumeId} />)

    await user.type(screen.getByLabelText('Email'), 'not-an-email')

    expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i)
    expect(
      useResumeStore
        .getState()
        .resumes.find((resume) => resume.id === resumeId)?.personalInfo.email,
    ).toBe('not-an-email')
  })

  it('does not show a warning for a valid email', async () => {
    const user = userEvent.setup()
    render(<PersonalInfoForm resumeId={resumeId} />)

    await user.type(screen.getByLabelText('Email'), 'jane@example.com')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not show a warning while the email field is empty', () => {
    render(<PersonalInfoForm resumeId={resumeId} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
