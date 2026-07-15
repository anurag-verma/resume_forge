import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillsForm } from './SkillsForm'
import { useResumeStore } from '../../../store/useResumeStore'
import { createBlankResume } from '../../../lib/defaultResume'
import type { Section, SkillEntry } from '../../../types/resume'

function resetStore(section: Section) {
  const resume = createBlankResume()
  resume.sections = [section]
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

function makeSection(): Section {
  return { id: 'section-1', type: 'skills', title: 'Skills', visible: true, entries: [] }
}

function getSkills(): SkillEntry[] {
  return useResumeStore.getState().resumes[0].sections[0].entries as SkillEntry[]
}

function ConnectedSkillsForm({ resumeId }: { resumeId: string }) {
  const section = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId)?.sections[0],
  )
  if (!section) return null
  return <SkillsForm resumeId={resumeId} section={section} />
}

describe('SkillsForm', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore(makeSection())
  })

  it('shows an empty-state hint when there are no skills', () => {
    render(<ConnectedSkillsForm resumeId={resumeId} />)
    expect(screen.getByText(/type a skill and press enter/i)).toBeInTheDocument()
  })

  it('adds a skill on Enter and clears the input', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    const input = screen.getByLabelText('Add a skill')
    await user.type(input, 'TypeScript{Enter}')

    expect(getSkills()).toMatchObject([{ name: 'TypeScript' }])
    expect(input).toHaveValue('')
  })

  it('adds a skill via the Add button and ignores empty input', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(getSkills()).toHaveLength(0)

    await user.type(screen.getByLabelText('Add a skill'), 'React')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(getSkills()).toMatchObject([{ name: 'React' }])
  })

  it('removes a skill via its × button', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.type(screen.getByLabelText('Add a skill'), 'React{Enter}')
    await user.click(screen.getByRole('button', { name: 'Remove React' }))

    expect(getSkills()).toHaveLength(0)
  })

  it('reorders flat skills with the move left/right buttons', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.type(screen.getByLabelText('Add a skill'), 'React{Enter}')
    await user.type(screen.getByLabelText('Add a skill'), 'Vue{Enter}')
    expect(getSkills().map((s) => s.name)).toEqual(['React', 'Vue'])

    await user.click(screen.getByRole('button', { name: 'Move React later' }))
    expect(getSkills().map((s) => s.name)).toEqual(['Vue', 'React'])

    await user.click(screen.getByRole('button', { name: 'Move React earlier' }))
    expect(getSkills().map((s) => s.name)).toEqual(['React', 'Vue'])
  })

  it('disables the move-earlier button on the first tag and move-later on the last', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.type(screen.getByLabelText('Add a skill'), 'React{Enter}')

    expect(screen.getByRole('button', { name: 'Move React earlier' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move React later' })).toBeDisabled()
  })

  it('groups skills under a named group when grouping is enabled', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('checkbox', { name: /group skills/i }))
    await user.type(screen.getByLabelText('Group'), 'Languages')
    await user.type(screen.getByLabelText('Add a skill'), 'TypeScript{Enter}')

    expect(getSkills()).toMatchObject([{ name: 'TypeScript', group: 'Languages' }])
    expect(screen.getByRole('button', { name: 'Languages' })).toBeInTheDocument()
  })

  it('puts skills without a group into "Ungrouped" when grouping is enabled', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('checkbox', { name: /group skills/i }))
    await user.type(screen.getByLabelText('Add a skill'), 'Git{Enter}')

    expect(screen.getByRole('button', { name: 'Ungrouped' })).toBeInTheDocument()
  })

  it('renames a group, updating every skill that belonged to it', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('checkbox', { name: /group skills/i }))
    await user.type(screen.getByLabelText('Group'), 'Languages')
    await user.type(screen.getByLabelText('Add a skill'), 'TypeScript{Enter}')
    await user.type(screen.getByLabelText('Add a skill'), 'Python{Enter}')

    await user.click(screen.getByRole('button', { name: 'Languages' }))
    const groupInput = screen.getByLabelText('Group name')
    await user.clear(groupInput)
    await user.type(groupInput, 'Programming Languages{Enter}')

    expect(getSkills()).toMatchObject([
      { name: 'TypeScript', group: 'Programming Languages' },
      { name: 'Python', group: 'Programming Languages' },
    ])
  })

  it('reordering within one group does not affect another group', async () => {
    const user = userEvent.setup()
    render(<ConnectedSkillsForm resumeId={resumeId} />)

    await user.click(screen.getByRole('checkbox', { name: /group skills/i }))
    await user.type(screen.getByLabelText('Group'), 'Languages')
    await user.type(screen.getByLabelText('Add a skill'), 'TypeScript{Enter}')

    await user.clear(screen.getByLabelText('Group'))
    await user.type(screen.getByLabelText('Group'), 'Tools')
    await user.type(screen.getByLabelText('Add a skill'), 'Git{Enter}')

    await user.clear(screen.getByLabelText('Group'))
    await user.type(screen.getByLabelText('Group'), 'Languages')
    await user.type(screen.getByLabelText('Add a skill'), 'Python{Enter}')

    // Languages group: [TypeScript, Python] -> move Python earlier -> [Python, TypeScript]
    await user.click(screen.getByRole('button', { name: 'Move Python earlier' }))

    const skills = getSkills()
    expect(skills.find((s) => s.name === 'Git')).toMatchObject({ group: 'Tools' })
    const languageSkills = skills.filter((s) => s.group === 'Languages')
    expect(languageSkills.map((s) => s.name)).toEqual(['Python', 'TypeScript'])
  })
})
