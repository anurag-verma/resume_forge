import { useSaveStatusStore } from '../../store/useSaveStatusStore'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function SaveStatusChip() {
  const status = useSaveStatusStore((state) => state.status)
  const lastSavedAt = useSaveStatusStore((state) => state.lastSavedAt)

  const label =
    status === 'saving' ? 'Saving…' : `Saved${lastSavedAt ? ` ✓ ${formatTime(lastSavedAt)}` : ' ✓'}`

  return (
    <span
      role="status"
      aria-live="polite"
      className="flex w-fit items-center gap-1 rounded-input bg-paper px-2 py-1 font-mono text-xs text-success"
    >
      {label}
    </span>
  )
}
