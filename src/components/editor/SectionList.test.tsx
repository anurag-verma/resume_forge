import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionList } from './SectionList'
import { useResumeStore } from '../../store/useResumeStore'
import { createBlankResume } from '../../lib/defaultResume'

function resetStore() {
  const resume = createBlankResume()
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  return resume.id
}

describe('SectionList', () => {
  let resumeId: string

  beforeEach(() => {
    localStorage.clear()
    resumeId = resetStore()
  })

  it('starts with no sections and an Add section button', () => {
    render(<SectionList resumeId={resumeId} />)

    expect(screen.queryByRole('button', { name: 'Experience' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument()
  })

  it('lists every section type in the add-section menu', async () => {
    const user = userEvent.setup()
    render(<SectionList resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add section/i }))

    for (const label of [
      'Summary',
      'Experience',
      'Education',
      'Skills',
      'Projects',
      'Certifications',
      'Languages',
      'Custom Section',
    ]) {
      expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument()
    }
  })

  it('adds a section, closes the menu, and persists it to the store', async () => {
    const user = userEvent.setup()
    render(<SectionList resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add section/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Experience' }))

    expect(screen.getByRole('button', { name: 'Experience' })).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(useResumeStore.getState().resumes[0].sections).toMatchObject([
      { type: 'experience', title: 'Experience' },
    ])
  })

  it('removes a non-custom type from the menu once it has been added', async () => {
    const user = userEvent.setup()
    render(<SectionList resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add section/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Skills' }))

    await user.click(screen.getByRole('button', { name: /add section/i }))
    expect(screen.queryByRole('menuitem', { name: 'Skills' })).not.toBeInTheDocument()
  })

  it('allows adding the custom section type multiple times', async () => {
    const user = userEvent.setup()
    render(<SectionList resumeId={resumeId} />)

    await user.click(screen.getByRole('button', { name: /add section/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Custom Section' }))

    await user.click(screen.getByRole('button', { name: /add section/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Custom Section' }))

    const customSections = useResumeStore
      .getState()
      .resumes[0].sections.filter((section) => section.type === 'custom')
    expect(customSections).toHaveLength(2)
  })
})
