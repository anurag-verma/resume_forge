import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportExportMenu } from './ImportExportMenu'
import { useResumeStore } from '../../store/useResumeStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { createBlankResume } from '../../lib/defaultResume'

function resetStores() {
  const resume = createBlankResume('Jane Doe Resume')
  resume.personalInfo.fullName = 'Jane Doe'
  useResumeStore.setState({ resumes: [resume], activeResumeId: resume.id }, false)
  useSettingsStore.setState({ settings: {} }, false)
  return resume
}

describe('ImportExportMenu', () => {
  let downloadedFiles: Array<{ filename: string }> = []

  beforeEach(() => {
    localStorage.clear()
    resetStores()
    downloadedFiles = []

    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloadedFiles.push({ filename: this.download })
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('opens a menu with export options', async () => {
    const user = userEvent.setup()
    render(<ImportExportMenu className="btn" />)

    await user.click(screen.getByRole('button', { name: /import\/export/i }))

    expect(screen.getByRole('menuitem', { name: 'Export this resume' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Export all resumes' })).toBeInTheDocument()
  })

  it('downloads a single-resume JSON file and closes the menu', async () => {
    const user = userEvent.setup()
    render(<ImportExportMenu className="btn" />)

    await user.click(screen.getByRole('button', { name: /import\/export/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Export this resume' }))

    expect(downloadedFiles).toHaveLength(1)
    expect(downloadedFiles[0].filename).toBe('Jane-Doe-Resume.json')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('downloads a full app-data backup JSON file', async () => {
    const user = userEvent.setup()
    render(<ImportExportMenu className="btn" />)

    await user.click(screen.getByRole('button', { name: /import\/export/i }))
    await user.click(screen.getByRole('menuitem', { name: 'Export all resumes' }))

    expect(downloadedFiles).toHaveLength(1)
    expect(downloadedFiles[0].filename).toMatch(/^resumeforge-backup-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('selecting a valid file shows the merge/replace confirm dialog', async () => {
    const user = userEvent.setup()
    const { container } = render(<ImportExportMenu className="btn" />)

    await user.click(screen.getByRole('button', { name: /import\/export/i }))
    await user.click(screen.getByRole('menuitem', { name: /import from file/i }))

    const validPayload = {
      kind: 'single-resume',
      schemaVersion: 1,
      resume: createBlankResume('Imported Resume'),
      settings: {
        templateId: 'classic',
        accentColor: '#000000',
        fontPairId: 'classic-serif',
        fontScale: 'md',
        lineSpacing: 1.4,
        sectionSpacing: 16,
      },
    }
    const file = new File([JSON.stringify(validPayload)], 'import.json', {
      type: 'application/json',
    })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)

    expect(await screen.findByRole('heading', { name: 'Import resume data' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add as new resume' }))

    expect(useResumeStore.getState().resumes).toHaveLength(2)
    expect(
      screen.queryByRole('heading', { name: 'Import resume data' }),
    ).not.toBeInTheDocument()
  })

  it('selecting an invalid file shows a clear error and does not change any data', async () => {
    const user = userEvent.setup()
    const { container } = render(<ImportExportMenu className="btn" />)

    await user.click(screen.getByRole('button', { name: /import\/export/i }))
    await user.click(screen.getByRole('menuitem', { name: /import from file/i }))

    const file = new File(['{ not valid json'], 'bad.json', { type: 'application/json' })
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(fileInput, file)

    expect(await screen.findByRole('heading', { name: 'Import failed' })).toBeInTheDocument()
    expect(screen.getByText(/not valid json/i)).toBeInTheDocument()
    expect(useResumeStore.getState().resumes).toHaveLength(1)
  })

  it('opens the Delete all my data dialog from the menu', async () => {
    const user = userEvent.setup()
    render(<ImportExportMenu className="btn" />)

    await user.click(screen.getByRole('button', { name: /import\/export/i }))
    await user.click(screen.getByRole('menuitem', { name: /delete all my data/i }))

    expect(
      screen.getByRole('heading', { name: 'Delete all my data' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
