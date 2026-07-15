import { Plus } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import { EntryCard } from '../shared/EntryCard'
import { SortableList } from '../shared/SortableList'
import { SelectField } from '../../ui/SelectField'
import { TextField } from '../../ui/TextField'
import type { LanguageEntry, Section } from '../../../types/resume'

interface LanguagesFormProps {
  resumeId: string
  section: Section
}

const PROFICIENCY_OPTIONS = [
  { value: 'Native', label: 'Native' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Conversational', label: 'Conversational' },
  { value: 'Basic', label: 'Basic' },
]

function createBlankLanguageEntry(): LanguageEntry {
  return {
    id: createId(),
    type: 'languages',
    name: '',
    proficiency: 'Conversational',
  }
}

export function LanguagesForm({ resumeId, section }: LanguagesFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)
  const removeEntry = useResumeStore((state) => state.removeEntry)
  const duplicateEntry = useResumeStore((state) => state.duplicateEntry)
  const reorderEntries = useResumeStore((state) => state.reorderEntries)

  const entries = section.entries.filter(
    (entry): entry is LanguageEntry => entry.type === 'languages',
  )

  function handleAdd() {
    addEntry(resumeId, section.id, createBlankLanguageEntry())
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 && (
        <p className="text-sm text-muted">Add a language and how well you speak it.</p>
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
              summaryTitle={entry.name || 'New language'}
              summarySubtitle={entry.proficiency}
              defaultExpanded={!entry.name}
              onDuplicate={() => duplicateEntry(resumeId, section.id, entry.id)}
              onDelete={() => removeEntry(resumeId, section.id, entry.id)}
              deleteConfirmTitle="Delete this language?"
              deleteConfirmDescription="This can't be undone."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  id={`${entry.id}-name`}
                  label="Language"
                  value={entry.name}
                  onChange={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { name: value })
                  }
                  placeholder="Spanish"
                />
                <SelectField
                  id={`${entry.id}-proficiency`}
                  label="Proficiency"
                  value={entry.proficiency}
                  onChange={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { proficiency: value })
                  }
                  options={PROFICIENCY_OPTIONS}
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
        Add language
      </button>
    </div>
  )
}
