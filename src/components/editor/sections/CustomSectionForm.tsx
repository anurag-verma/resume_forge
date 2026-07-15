import { Plus } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import { EntryCard } from '../shared/EntryCard'
import { MarkdownLiteTextarea } from '../shared/MarkdownLiteTextarea'
import { SortableList } from '../shared/SortableList'
import { TextField } from '../../ui/TextField'
import type { CustomEntry, Section } from '../../../types/resume'

interface CustomSectionFormProps {
  resumeId: string
  section: Section
}

function createBlankCustomEntry(): CustomEntry {
  return {
    id: createId(),
    type: 'custom',
    title: '',
    subtitle: '',
    date: '',
    description: '',
  }
}

export function CustomSectionForm({ resumeId, section }: CustomSectionFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)
  const removeEntry = useResumeStore((state) => state.removeEntry)
  const duplicateEntry = useResumeStore((state) => state.duplicateEntry)
  const reorderEntries = useResumeStore((state) => state.reorderEntries)

  const entries = section.entries.filter(
    (entry): entry is CustomEntry => entry.type === 'custom',
  )

  function handleAdd() {
    addEntry(resumeId, section.id, createBlankCustomEntry())
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 && (
        <p className="text-sm text-muted">
          Add anything that doesn't fit elsewhere — an award, a publication, volunteer
          work.
        </p>
      )}

      {entries.length > 0 && (
        <SortableList
          items={entries}
          onReorder={(orderedIds) => reorderEntries(resumeId, section.id, orderedIds)}
          className="flex flex-col gap-3"
        >
          {(entry) => (
            <EntryCard
              key={entry.id}
              id={entry.id}
              summaryTitle={entry.title || 'New item'}
              summarySubtitle={entry.subtitle || entry.date || undefined}
              defaultExpanded={!entry.title}
              onDuplicate={() => duplicateEntry(resumeId, section.id, entry.id)}
              onDelete={() => removeEntry(resumeId, section.id, entry.id)}
              deleteConfirmTitle="Delete this item?"
              deleteConfirmDescription="This can't be undone."
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`${entry.id}-title`}
                    label="Title"
                    value={entry.title}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { title: value })
                    }
                    placeholder="Employee of the Year"
                  />
                  <TextField
                    id={`${entry.id}-subtitle`}
                    label="Subtitle"
                    value={entry.subtitle ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { subtitle: value })
                    }
                    placeholder="Acme Corp"
                  />
                  <TextField
                    id={`${entry.id}-date`}
                    label="Date"
                    value={entry.date ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { date: value })
                    }
                    placeholder="2023"
                  />
                </div>

                <MarkdownLiteTextarea
                  id={`${entry.id}-description`}
                  label="Description"
                  value={entry.description}
                  onChange={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { description: value })
                  }
                  rows={3}
                  placeholder="Any relevant detail"
                />
              </div>
            </EntryCard>
          )}
        </SortableList>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center justify-center gap-1.5 rounded-input border border-dashed border-line px-3 py-2 text-sm text-muted hover:border-action hover:text-action"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add item
      </button>
    </div>
  )
}
