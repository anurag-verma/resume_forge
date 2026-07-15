import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportConfirmDialog } from './ImportConfirmDialog'
import { fullTestResume, testSettings } from '../templates/testFixtures'
import type { AppDataImport, SingleResumeImport } from '../../lib/validateImport'

const singleResumeData: SingleResumeImport = {
  kind: 'single-resume',
  schemaVersion: 1,
  resume: fullTestResume,
  settings: testSettings,
}

const appDataData: AppDataImport = {
  kind: 'app-data',
  schemaVersion: 1,
  resumes: [fullTestResume],
  activeResumeId: fullTestResume.id,
  settings: { [fullTestResume.id]: testSettings },
}

describe('ImportConfirmDialog', () => {
  it('describes a single-resume import and offers "Add as new resume" / "Replace"', () => {
    render(
      <ImportConfirmDialog data={singleResumeData} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    )

    expect(screen.getByText(/contains one resume/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add as new resume' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument()
  })

  it('describes an app-data import and offers "Merge" / "Replace"', () => {
    render(<ImportConfirmDialog data={appDataData} onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByText(/contains 1 resume/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Merge' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Replace' })).toBeInTheDocument()
  })

  it('calls onConfirm with the right mode for each button', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ImportConfirmDialog data={singleResumeData} onCancel={vi.fn()} onConfirm={onConfirm} />,
    )

    await user.click(screen.getByRole('button', { name: 'Add as new resume' }))
    expect(onConfirm).toHaveBeenCalledWith('merge')

    await user.click(screen.getByRole('button', { name: 'Replace' }))
    expect(onConfirm).toHaveBeenCalledWith('replace')
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ImportConfirmDialog data={singleResumeData} onCancel={onCancel} onConfirm={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
