import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertificationsForm } from './CertificationsForm'
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
    type: 'certifications',
    title: 'Certifications',
    visible: true,
    entries: [],
  }
}

function ConnectedCertificationsForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <CertificationsForm resumeId={resumeId} section={section} />
}

describe('CertificationsForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('shows an empty-state hint and an Add certification button when there are no entries', () => {
    render(<ConnectedCertificationsForm resumeId={resumeId} />)

    expect(screen.getByText(/add a certification/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add certification/i }),
    ).toBeInTheDocument()
  })

  it('adds, fills in, and shows the formatted date once collapsed', async () => {
    const user = userEvent.setup()
    render(<ConnectedCertificationsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add certification/i }))
    await user.type(
      screen.getByLabelText('Name'),
      'Certified Kubernetes Administrator',
    )
    await user.type(screen.getByLabelText('Issuer'), 'CNCF')
    await user.selectOptions(screen.getByLabelText('Date month'), '01')
    await user.selectOptions(screen.getByLabelText('Date year'), '2024')

    await user.click(screen.getByRole('button', { name: 'Collapse entry' }))

    expect(
      screen.getByText('Certified Kubernetes Administrator'),
    ).toBeInTheDocument()
    expect(screen.getByText('Jan 2024')).toBeInTheDocument()
  })

  it('duplicates and deletes an entry', async () => {
    const user = userEvent.setup()
    render(<ConnectedCertificationsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add certification/i }))
    await user.type(screen.getByLabelText('Name'), 'AWS Certified')

    await user.click(screen.getByRole('button', { name: 'Duplicate entry' }))
    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(2)

    const [deleteButton] = screen.getAllByRole('button', { name: 'Delete entry' })
    await user.click(deleteButton)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(1)
  })
})
