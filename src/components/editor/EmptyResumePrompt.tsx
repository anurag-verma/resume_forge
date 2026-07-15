import { useResumeStore } from '../../store/useResumeStore'
import { createSampleResumeContent } from '../../lib/sampleData'

interface EmptyResumePromptProps {
  resumeId: string
}

/** Frontend spec §3.9: "Start with your name above, or load an example to
 *  see how it works." Shown only while the active resume is genuinely
 *  empty — it naturally disappears once the user types a name or adds a
 *  section, and reappears for any other resume that's still blank. */
export function EmptyResumePrompt({ resumeId }: EmptyResumePromptProps) {
  const resume = useResumeStore((state) =>
    state.resumes.find((candidate) => candidate.id === resumeId),
  )
  const loadSampleData = useResumeStore((state) => state.loadSampleData)

  const isEmpty = Boolean(
    resume && !resume.personalInfo.fullName && resume.sections.length === 0,
  )

  if (!resume || !isEmpty) return null

  return (
    <p className="mb-4 rounded-card border border-dashed border-line bg-surface p-4 text-sm text-muted">
      Start with your name above, or{' '}
      <button
        type="button"
        onClick={() => loadSampleData(resumeId, createSampleResumeContent())}
        className="font-semibold text-action underline-offset-2 hover:underline"
      >
        load an example
      </button>{' '}
      to see how it works.
    </p>
  )
}
