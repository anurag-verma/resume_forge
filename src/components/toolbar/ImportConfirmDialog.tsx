import { Modal } from '../ui/Modal'
import type { ValidatedImport } from '../../lib/validateImport'

interface ImportConfirmDialogProps {
  data: ValidatedImport
  onCancel: () => void
  onConfirm: (mode: 'merge' | 'replace') => void
}

/** Frontend spec's confirm-merge/replace step (Security doc §4.4 — imported
 *  data is only ever committed after an explicit user choice). */
export function ImportConfirmDialog({ data, onCancel, onConfirm }: ImportConfirmDialogProps) {
  const summary =
    data.kind === 'single-resume'
      ? `This file contains one resume ("${data.resume.name}").`
      : `This file contains ${data.resumes.length} resume${data.resumes.length === 1 ? '' : 's'}.`

  const question =
    data.kind === 'single-resume'
      ? 'Add it as a new resume, or replace your current resume with it?'
      : 'Add these as new resumes alongside your existing ones, or replace everything currently saved?'

  return (
    <Modal open onClose={onCancel} title="Import resume data">
      <p className="text-sm text-ink">{summary}</p>
      <p className="mt-2 text-sm text-muted">{question}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-input border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm('merge')}
          className="rounded-input border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper"
        >
          {data.kind === 'single-resume' ? 'Add as new resume' : 'Merge'}
        </button>
        <button
          type="button"
          onClick={() => onConfirm('replace')}
          className="rounded-input bg-danger px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Replace
        </button>
      </div>
    </Modal>
  )
}
