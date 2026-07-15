import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import { formatDateRange } from '../../../lib/date'
import { DateRangeInput } from '../shared/DateRangeInput'
import { EntryCard } from '../shared/EntryCard'
import { MarkdownLiteTextarea } from '../shared/MarkdownLiteTextarea'
import { SortableList } from '../shared/SortableList'
import { TextField } from '../../ui/TextField'
import type { ProjectEntry, Section } from '../../../types/resume'

interface ProjectsFormProps {
  resumeId: string
  section: Section
}

function createBlankProjectEntry(): ProjectEntry {
  return {
    id: createId(),
    type: 'projects',
    name: '',
    role: '',
    url: '',
    startDate: '',
    endDate: null,
    description: '',
    technologies: [],
  }
}

function parseTechnologies(raw: string): string[] {
  return raw
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean)
}

interface TechnologiesFieldProps {
  id: string
  value: string[]
  onCommit: (value: string[]) => void
}

function TechnologiesField({ id, value, onCommit }: TechnologiesFieldProps) {
  const [draft, setDraft] = useState(value.join(', '))

  return (
    <TextField
      id={id}
      label="Technologies"
      value={draft}
      onChange={setDraft}
      onBlur={() => onCommit(parseTechnologies(draft))}
      placeholder="React, TypeScript, Node.js"
      hint="Comma-separated"
    />
  )
}

export function ProjectsForm({ resumeId, section }: ProjectsFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)
  const removeEntry = useResumeStore((state) => state.removeEntry)
  const duplicateEntry = useResumeStore((state) => state.duplicateEntry)
  const reorderEntries = useResumeStore((state) => state.reorderEntries)

  const entries = section.entries.filter(
    (entry): entry is ProjectEntry => entry.type === 'projects',
  )

  function handleAdd() {
    addEntry(resumeId, section.id, createBlankProjectEntry())
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 && (
        <p className="text-sm text-muted">
          Showcase a project that demonstrates your skills.
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
              summaryTitle={entry.name || 'New project'}
              summarySubtitle={
                entry.startDate
                  ? formatDateRange(entry.startDate, entry.endDate ?? null)
                  : undefined
              }
              defaultExpanded={!entry.name}
              onDuplicate={() => duplicateEntry(resumeId, section.id, entry.id)}
              onDelete={() => removeEntry(resumeId, section.id, entry.id)}
              deleteConfirmTitle="Delete this project?"
              deleteConfirmDescription="This can't be undone."
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`${entry.id}-name`}
                    label="Project Name"
                    value={entry.name}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { name: value })
                    }
                    placeholder="ResumeForge"
                  />
                  <TextField
                    id={`${entry.id}-role`}
                    label="Role"
                    value={entry.role ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { role: value })
                    }
                    placeholder="Creator"
                  />
                  <TextField
                    id={`${entry.id}-url`}
                    label="URL"
                    type="url"
                    value={entry.url ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { url: value })
                    }
                    placeholder="https://example.com"
                  />
                  <TechnologiesField
                    id={`${entry.id}-technologies`}
                    value={entry.technologies ?? []}
                    onCommit={(technologies) =>
                      updateEntry(resumeId, section.id, entry.id, { technologies })
                    }
                  />
                </div>

                <DateRangeInput
                  start={entry.startDate ?? ''}
                  end={entry.endDate ?? null}
                  onChangeStart={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { startDate: value })
                  }
                  onChangeEnd={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { endDate: value })
                  }
                  presentLabel="Ongoing"
                />

                <MarkdownLiteTextarea
                  id={`${entry.id}-description`}
                  label="Description"
                  value={entry.description}
                  onChange={(value) =>
                    updateEntry(resumeId, section.id, entry.id, { description: value })
                  }
                  rows={3}
                  placeholder="What the project does and the impact it had"
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
        Add project
      </button>
    </div>
  )
}
