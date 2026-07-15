import { Plus } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import { formatMonthYear } from '../../../lib/date'
import { EntryCard } from '../shared/EntryCard'
import { MonthYearPicker } from '../shared/MonthYearPicker'
import { SortableList } from '../shared/SortableList'
import { TextField } from '../../ui/TextField'
import type { CertificationEntry, Section } from '../../../types/resume'

interface CertificationsFormProps {
  resumeId: string
  section: Section
}

function createBlankCertificationEntry(): CertificationEntry {
  return {
    id: createId(),
    type: 'certifications',
    name: '',
    issuer: '',
    date: '',
    credentialUrl: '',
  }
}

export function CertificationsForm({ resumeId, section }: CertificationsFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)
  const removeEntry = useResumeStore((state) => state.removeEntry)
  const duplicateEntry = useResumeStore((state) => state.duplicateEntry)
  const reorderEntries = useResumeStore((state) => state.reorderEntries)

  const entries = section.entries.filter(
    (entry): entry is CertificationEntry => entry.type === 'certifications',
  )

  function handleAdd() {
    addEntry(resumeId, section.id, createBlankCertificationEntry())
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length === 0 && (
        <p className="text-sm text-muted">Add a certification that's relevant to the role.</p>
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
              summaryTitle={entry.name || 'New certification'}
              summarySubtitle={entry.date ? formatMonthYear(entry.date) : undefined}
              defaultExpanded={!entry.name}
              onDuplicate={() => duplicateEntry(resumeId, section.id, entry.id)}
              onDelete={() => removeEntry(resumeId, section.id, entry.id)}
              deleteConfirmTitle="Delete this certification?"
              deleteConfirmDescription="This can't be undone."
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextField
                    id={`${entry.id}-name`}
                    label="Name"
                    value={entry.name}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { name: value })
                    }
                    placeholder="Certified Kubernetes Administrator"
                  />
                  <TextField
                    id={`${entry.id}-issuer`}
                    label="Issuer"
                    value={entry.issuer}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { issuer: value })
                    }
                    placeholder="CNCF"
                  />
                  <TextField
                    id={`${entry.id}-credentialUrl`}
                    label="Credential URL"
                    type="url"
                    value={entry.credentialUrl ?? ''}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, {
                        credentialUrl: value,
                      })
                    }
                    placeholder="https://example.com/credential"
                  />
                </div>

                <div className="max-w-[calc(50%-8px)]">
                  <MonthYearPicker
                    legend="Date"
                    value={entry.date}
                    onChange={(value) =>
                      updateEntry(resumeId, section.id, entry.id, { date: value })
                    }
                  />
                </div>
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
        Add certification
      </button>
    </div>
  )
}
