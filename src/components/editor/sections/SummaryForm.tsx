import { useEffect } from 'react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import type { Section, SummaryEntry } from '../../../types/resume'

interface SummaryFormProps {
  resumeId: string
  section: Section
}

export function SummaryForm({ resumeId, section }: SummaryFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)

  const entry = section.entries.find(
    (candidate): candidate is SummaryEntry => candidate.type === 'summary',
  )

  useEffect(() => {
    if (!entry) {
      addEntry(resumeId, section.id, { id: createId(), type: 'summary', content: '' })
    }
  }, [entry, resumeId, section.id, addEntry])

  if (!entry) return null

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`${section.id}-summary`} className="text-sm font-medium text-ink">
        Summary
      </label>
      <textarea
        id={`${section.id}-summary`}
        value={entry.content}
        onChange={(event) =>
          updateEntry(resumeId, section.id, entry.id, { content: event.target.value })
        }
        rows={4}
        placeholder="A concise 2-3 sentence overview of your experience and goals."
        className="rounded-input border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action"
      />
    </div>
  )
}
