import { Plus } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import { formatDateRange } from '../../../lib/date'
import { DateRangeInput } from '../shared/DateRangeInput'
import { EntryCard } from '../shared/EntryCard'
import { MarkdownLiteTextarea } from '../shared/MarkdownLiteTextarea'
import { SortableList } from '../shared/SortableList'
import { TextField } from '../../ui/TextField'
import type { EducationEntry, Section } from '../../../types/resume'

interface EducationFormProps {
  resumeId: string
  section: Section
}

function createBlankEducationEntry(): EducationEntry {
  return {
    id: createId(),
    type: 'education',
    institution: '',
    degree: '',
    fieldOfStudy: '',
    location: '',
    startDate: '',
    endDate: null,
    description: '',
  }
}

export function EducationForm({ resumeId, section }: EducationFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)
  const removeEntry = useResumeStore((state) => state.removeEntry)
  const duplicateEntry = useResumeStore((state) => state.duplicateEntry)
  const reorderEntries = useResumeStore((state) => state.reorderEntries)

  const entries = section.entries.filter(
    (entry): entry is EducationEntry => entry.type === 'education',
  )

  function handleAdd() {
    addEntry(resumeId, section.id, createBlankEducationEntry())
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 && (
        <p className="text-sm text-muted">Add your most recent degree or program first.</p>
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
                entry.degree || entry.institution
                  ? `${entry.degree || 'Untitled program'} @ ${entry.institution || 'Institution'}`
                  : 'New education entry'
              }
              summarySubtitle={
                entry.startDate
                  ? formatDateRange(entry.startDate, entry.endDate)
                  : undefined
              }
              defaultExpanded={!entry.degree && !entry.institution}
              onDuplicate={() => duplicateEntry(resumeId, section.id, entry.id)}
              onDelete={() => removeEntry(resumeId, section.id, entry.id)}
              deleteConfirmTitle="Delete this education entry?"
              deleteConfirmDescription="This can't be undone."
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`${entry.id}-institution`}
                    label="Institution"
                    value={entry.institution}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { institution: value })
                    }
                    placeholder="State University"
                  />
                  <TextField
                    id={`${entry.id}-degree`}
                    label="Degree"
                    value={entry.degree}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { degree: value })
                    }
                    placeholder="B.Sc. Computer Science"
                  />
                  <TextField
                    id={`${entry.id}-fieldOfStudy`}
                    label="Field of Study"
                    value={entry.fieldOfStudy ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { fieldOfStudy: value })
                    }
                    placeholder="Computer Science"
                  />
                  <TextField
                    id={`${entry.id}-location`}
                    label="Location"
                    value={entry.location ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { location: value })
                    }
                    placeholder="Boston, MA"
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
                  presentLabel="Currently studying here"
                />

                <MarkdownLiteTextarea
                  id={`${entry.id}-description`}
                  label="Description"
                  value={entry.description ?? ''}
                  onChange={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { description: value })
                  }
                  rows={3}
                  placeholder="Relevant coursework, honors, activities"
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
        Add education
      </button>
    </div>
  )
}
