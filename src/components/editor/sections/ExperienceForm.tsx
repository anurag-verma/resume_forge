import { Plus } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import { formatDateRange } from '../../../lib/date'
import { DateRangeInput } from '../shared/DateRangeInput'
import { EntryCard } from '../shared/EntryCard'
import { MarkdownLiteTextarea } from '../shared/MarkdownLiteTextarea'
import { SortableList } from '../shared/SortableList'
import { TextField } from '../../ui/TextField'
import type { ExperienceEntry, Section } from '../../../types/resume'

interface ExperienceFormProps {
  resumeId: string
  section: Section
}

function createBlankExperienceEntry(): ExperienceEntry {
  return {
    id: createId(),
    type: 'experience',
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: null,
    description: '',
  }
}

export function ExperienceForm({ resumeId, section }: ExperienceFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)
  const removeEntry = useResumeStore((state) => state.removeEntry)
  const duplicateEntry = useResumeStore((state) => state.duplicateEntry)
  const reorderEntries = useResumeStore((state) => state.reorderEntries)

  const entries = section.entries.filter(
    (entry): entry is ExperienceEntry => entry.type === 'experience',
  )

  function handleAdd() {
    addEntry(resumeId, section.id, createBlankExperienceEntry())
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 && (
        <p className="text-sm text-muted">
          Add your most recent role first — recruiters read top-down.
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
              summaryTitle={
                entry.role || entry.company
                  ? `${entry.role || 'Untitled role'} @ ${entry.company || 'Company'}`
                  : 'New experience entry'
              }
              summarySubtitle={
                entry.startDate
                  ? formatDateRange(entry.startDate, entry.endDate)
                  : undefined
              }
              defaultExpanded={!entry.role && !entry.company}
              onDuplicate={() => duplicateEntry(resumeId, section.id, entry.id)}
              onDelete={() => removeEntry(resumeId, section.id, entry.id)}
              deleteConfirmTitle="Delete this experience entry?"
              deleteConfirmDescription="This can't be undone."
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`${entry.id}-role`}
                    label="Role"
                    value={entry.role}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { role: value })
                    }
                    placeholder="Software Engineer"
                  />
                  <TextField
                    id={`${entry.id}-company`}
                    label="Company"
                    value={entry.company}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { company: value })
                    }
                    placeholder="Acme Corp"
                  />
                  <TextField
                    id={`${entry.id}-location`}
                    label="Location"
                    value={entry.location ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { location: value })
                    }
                    placeholder="Remote"
                  />
                </div>

                <DateRangeInput
                  start={entry.startDate}
                  end={entry.endDate}
                  onChangeStart={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { startDate: value })
                  }
                  onChangeEnd={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { endDate: value })
                  }
                  presentLabel="Currently working here"
                />

                <MarkdownLiteTextarea
                  id={`${entry.id}-description`}
                  label="Description"
                  value={entry.description}
                  onChange={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { description: value })
                  }
                  rows={4}
                  placeholder="Led a team of 4 engineers; shipped X, improving Y by Z%"
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
        Add experience
      </button>
    </div>
  )
}
