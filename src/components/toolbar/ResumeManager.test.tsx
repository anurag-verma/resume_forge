import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResumeManager } from './ResumeManager'
import { useResumeStore } from '../../store/useResumeStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { createBlankResume } from '../../lib/defaultResume'

function resetStore() {
  const resume = createBlankResume('First Resume')
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  useSettingsStore.setState({ settings: {} }, false)
  return resume.id
}

describe('ResumeManager', () => {
  beforeEach(() => {
    localStorage.clear()
    resetStore()
  })

  it('shows the active resume name on the trigger button', () => {
    render(<ResumeManager />)
    expect(screen.getByRole('button', { name: /first resume/i })).toBeInTheDocument()
  })

  it('opens a menu listing all resumes, with the active one marked', async () => {
    const user = userEvent.setup()
    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /first resume/i }))

    const item = screen.getByRole('menuitemradio', { name: 'First Resume' })
    expect(item).toHaveAttribute('aria-checked', 'true')
  })

  it('creates a new resume and makes it active', async () => {
    const user = userEvent.setup()
    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /first resume/i }))
    await user.click(screen.getByRole('menuitem', { name: /new resume/i }))

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(2)
    expect(state.activeResumeId).toBe(state.resumes[1].id)
  })

  it('switches the active resume when another one is selected', async () => {
    const user = userEvent.setup()
    const firstId = useResumeStore.getState().activeResumeId
    // createResume makes the new resume active, so the trigger now shows "Second Resume".
    useResumeStore.getState().createResume('Second Resume')
    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /second resume/i }))
    await user.click(screen.getByRole('menuitemradio', { name: 'First Resume' }))

    expect(useResumeStore.getState().activeResumeId).toBe(firstId)
  })

  it('renames a resume via the pencil icon', async () => {
    const user = userEvent.setup()
    const resumeId = useResumeStore.getState().activeResumeId
    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /first resume/i }))
    await user.click(screen.getByRole('button', { name: 'Rename First Resume' }))

    const input = screen.getByLabelText('Resume name')
    await user.clear(input)
    await user.type(input, 'Renamed Resume')
    await user.tab()

    expect(
      useResumeStore.getState().resumes.find((r) => r.id === resumeId)?.name,
    ).toBe('Renamed Resume')
  })

  it('duplicates a resume', async () => {
    const user = userEvent.setup()
    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /first resume/i }))
    await user.click(screen.getByRole('button', { name: 'Duplicate First Resume' }))

    const state = useResumeStore.getState()
    expect(state.resumes).toHaveLength(2)
    expect(state.resumes[1].name).toBe('First Resume (Copy)')
  })

  it('deletes a resume only after confirming', async () => {
    const user = userEvent.setup()
    useResumeStore.getState().createResume('Second Resume')
    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /second resume/i }))
    await user.click(screen.getByRole('button', { name: 'Delete First Resume' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(useResumeStore.getState().resumes).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useResumeStore.getState().resumes).toHaveLength(1)
    expect(
      useResumeStore.getState().resumes.some((r) => r.name === 'First Resume'),
    ).toBe(false)
  })

  it('keeps the resume when deletion is cancelled', async () => {
    const user = userEvent.setup()
    render(<ResumeManager />)

    await user.click(screen.getByRole('button', { name: /first resume/i }))
    await user.click(screen.getByRole('button', { name: 'Delete First Resume' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(useResumeStore.getState().resumes).toHaveLength(1)
  })
})
