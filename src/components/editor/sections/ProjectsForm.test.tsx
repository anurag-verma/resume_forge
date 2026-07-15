import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectsForm } from './ProjectsForm'
import { useResumeStore } from '../../../store/useResumeStore'
import { createBlankResume } from '../../../lib/defaultResume'
import type { ProjectEntry, Section } from '../../../types/resume'

function resetStore(section: Section) {
  const resume = createBlankResume()
  resume.sections = [section]
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

function makeSection(): Section {
  return { id: 'section-1', type: 'projects', title: 'Projects', visible: true, entries: [] }
}

function getFirstProjectEntry(): ProjectEntry {
  return useResumeStore.getState().resumes[0].sections[0].entries[0] as ProjectEntry
}

function ConnectedProjectsForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <ProjectsForm resumeId={resumeId} section={section} />
}

describe('ProjectsForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('shows an empty-state hint and an Add project button when there are no entries', () => {
    render(<ConnectedProjectsForm resumeId={resumeId} />)

    expect(screen.getByText(/showcase a project/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add project/i })).toBeInTheDocument()
  })

  it('adds and fills in a project entry', async () => {
    const user = userEvent.setup()
    render(<ConnectedProjectsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add project/i }))
    await user.type(screen.getByLabelText('Project Name'), 'ResumeForge')
    await user.type(screen.getByLabelText('URL'), 'https://example.com')

    expect(getFirstProjectEntry()).toMatchObject({
      name: 'ResumeForge',
      url: 'https://example.com',
    })
  })

  it('parses comma-separated technologies only once the field is blurred', async () => {
    const user = userEvent.setup()
    render(<ConnectedProjectsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add project/i }))
    const techField = screen.getByLabelText('Technologies')
    await user.type(techField, 'React, TypeScript, Node.js')

    expect(getFirstProjectEntry().technologies).toEqual([])

    await user.tab()

    expect(getFirstProjectEntry().technologies).toEqual([
      'React',
      'TypeScript',
      'Node.js',
    ])
  })

  it('duplicates and deletes a project entry', async () => {
    const user = userEvent.setup()
    render(<ConnectedProjectsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add project/i }))
    await user.type(screen.getByLabelText('Project Name'), 'ResumeForge')

    await user.click(screen.getByRole('button', { name: 'Duplicate entry' }))
    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(2)

    const [deleteButton] = screen.getAllByRole('button', { name: 'Delete entry' })
    await user.click(deleteButton)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useResumeStore.getState().resumes[0].sections[0].entries).toHaveLength(1)
  })
})
