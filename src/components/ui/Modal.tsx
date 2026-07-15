import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Generic modal for arbitrary content (as opposed to ui/ConfirmDialog's
 * yes/no confirmation flow). Built on native <dialog> for the same reasons
 * as ConfirmDialog: free focus trap, Esc-to-close, and a backdrop.
 *
 * Content is only mounted while `open` — native <dialog> just toggles
 * visibility, it doesn't unmount children, so anything lazy-loaded inside
 * (e.g. the template gallery's thumbnails) would otherwise start fetching
 * its chunk the moment the modal exists in the tree, not when it's opened.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
      className="w-full max-w-2xl rounded-card border border-line bg-surface p-0 shadow-subtle backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between border-b border-line p-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-input p-1 text-muted hover:bg-paper hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-4">{open && children}</div>
    </dialog>
  )
}
