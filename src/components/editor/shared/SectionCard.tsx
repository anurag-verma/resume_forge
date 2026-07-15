import { useState, type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { ConfirmDialog } from '../../ui/ConfirmDialog'
import type { Section } from '../../../types/resume'

interface SectionCardProps {
  section: Section
  resumeId: string
  children?: ReactNode
}

export function SectionCard({ section, resumeId, children }: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(section.title)
  const [confirmingRemove, setConfirmingRemove] = useState(false)

  const updateSection = useResumeStore((state) => state.updateSection)
  const removeSection = useResumeStore((state) => state.removeSection)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  function commitTitle() {
    const trimmed = titleDraft.trim()
    updateSection(resumeId, section.id, { title: trimmed || section.title })
    setEditingTitle(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-card border border-line bg-surface shadow-subtle ${isDragging ? 'z-10 opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder section"
          className="shrink-0 cursor-grab touch-none rounded-input p-1 text-muted hover:bg-paper hover:text-ink active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitTitle()
              if (event.key === 'Escape') {
                setTitleDraft(section.title)
                setEditingTitle(false)
              }
            }}
            aria-label="Section title"
            className="min-w-0 flex-1 rounded-input border border-line px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-action"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setTitleDraft(section.title)
              setEditingTitle(true)
            }}
            className="min-w-0 flex-1 truncate text-left text-sm font-medium text-ink hover:underline"
          >
            {section.title}
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            updateSection(resumeId, section.id, { visible: !section.visible })
          }
          aria-label={section.visible ? 'Hide section' : 'Show section'}
          aria-pressed={section.visible}
          className="shrink-0 rounded-input p-1.5 text-muted hover:bg-paper hover:text-ink"
        >
          {section.visible ? (
            <Eye className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand section' : 'Collapse section'}
          className="shrink-0 rounded-input p-1.5 text-muted hover:bg-paper hover:text-ink"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => setConfirmingRemove(true)}
          aria-label="Remove section"
          className="shrink-0 rounded-input p-1.5 text-muted hover:bg-paper hover:text-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {!collapsed && (
        <div className="border-t border-line p-3">
          {children ?? (
            <p className="text-sm text-muted">This section's fields will appear here.</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmingRemove}
        title={`Remove "${section.title}"?`}
        description="This will delete the section and all its entries. This can't be undone."
        confirmLabel="Remove"
        danger
        onConfirm={() => {
          removeSection(resumeId, section.id)
          setConfirmingRemove(false)
        }}
        onCancel={() => setConfirmingRemove(false)}
      />
    </div>
  )
}
