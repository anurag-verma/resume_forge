import { useState, type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, Copy, GripVertical, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../../ui/ConfirmDialog'

interface EntryCardProps {
  id: string
  summaryTitle: string
  summarySubtitle?: string
  defaultExpanded?: boolean
  onDuplicate: () => void
  onDelete: () => void
  deleteConfirmTitle: string
  deleteConfirmDescription: string
  children: ReactNode
}

export function EntryCard({
  id,
  summaryTitle,
  summarySubtitle,
  defaultExpanded = false,
  onDuplicate,
  onDelete,
  deleteConfirmTitle,
  deleteConfirmDescription,
  children,
}: EntryCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-card border border-line bg-surface ${isDragging ? 'z-10 opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder entry"
          className="shrink-0 cursor-grab touch-none rounded-input p-1 text-muted hover:bg-paper hover:text-ink active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-ink">{summaryTitle}</span>
          {summarySubtitle && (
            <span className="truncate text-xs text-muted">{summarySubtitle}</span>
          )}
        </div>

        <button
          type="button"
          onClick={onDuplicate}
          aria-label="Duplicate entry"
          className="shrink-0 rounded-input p-1.5 text-muted hover:bg-paper hover:text-ink"
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Delete entry"
          className="shrink-0 rounded-input p-1.5 text-muted hover:bg-paper hover:text-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse entry' : 'Expand entry'}
          className="shrink-0 rounded-input p-1.5 text-muted hover:bg-paper hover:text-ink"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? '' : '-rotate-90'}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {expanded && <div className="border-t border-line p-3">{children}</div>}

      <ConfirmDialog
        open={confirmingDelete}
        title={deleteConfirmTitle}
        description={deleteConfirmDescription}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          onDelete()
          setConfirmingDelete(false)
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
