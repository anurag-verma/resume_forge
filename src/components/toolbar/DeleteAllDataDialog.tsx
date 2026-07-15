import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { deleteAllData } from '../../lib/deleteAllData'

interface DeleteAllDataDialogProps {
  open: boolean
  onClose: () => void
}

const CONFIRM_WORD = 'DELETE'

/** Security doc §5/§6, Frontend spec §3.8: destructive enough to need a
 *  typed confirmation, not just a click-through Yes/No. */
export function DeleteAllDataDialog({ open, onClose }: DeleteAllDataDialogProps) {
  const [typed, setTyped] = useState('')
  const canDelete = typed === CONFIRM_WORD

  return (
    <Modal open={open} onClose={onClose} title="Delete all my data">
      <p className="text-sm text-ink">
        This permanently deletes every resume, all settings, and everything else stored
        in this browser. This can&apos;t be undone.
      </p>
      <label htmlFor="delete-all-confirm" className="mt-4 block text-sm font-medium text-ink">
        Type <strong>DELETE</strong> to confirm
      </label>
      <input
        id="delete-all-confirm"
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        autoComplete="off"
        autoFocus
        className="mt-1 w-full rounded-input border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-action"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-input border border-line px-3 py-1.5 text-sm text-ink hover:bg-line"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={deleteAllData}
          disabled={!canDelete}
          className="rounded-input bg-danger px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete everything
        </button>
      </div>
    </Modal>
  )
}
