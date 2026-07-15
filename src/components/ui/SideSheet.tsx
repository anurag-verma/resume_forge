import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SideSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Docked-right variant of ui/Modal for panels the Frontend spec calls a
 * "side sheet" (§3.5 Customize) rather than a centered dialog. Same native
 * <dialog> foundation as Modal/ConfirmDialog — free focus trap and
 * Esc-to-close — just positioned and sized differently via CSS, and children
 * only mount while open for the same reason as Modal (RB-024's lazy-chunk fix).
 */
export function SideSheet({ open, onClose, title, children }: SideSheetProps) {
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
      className="m-0 ml-auto h-full max-h-none w-full max-w-sm rounded-none border-l border-line bg-surface p-0 shadow-subtle backdrop:bg-ink/40"
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
      <div className="h-[calc(100%-57px)] overflow-y-auto p-4">{open && children}</div>
    </dialog>
  )
}
