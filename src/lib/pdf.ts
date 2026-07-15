// eslint-disable-next-line no-control-regex
const UNSAFE_FILENAME_CHARS = /[\\/:*?"<>|\x00-\x1F]/g

/**
 * Strips path separators and control characters (Security doc §4.4).
 * Deliberately keeps spaces and hyphens — buildResumeFilename splits on
 * whitespace to join name parts with its own hyphens afterward.
 */
export function sanitizeFilenameSegment(segment: string): string {
  return segment.replace(UNSAFE_FILENAME_CHARS, '').trim()
}

/** "Jane Doe" -> "Jane-Doe-Resume" (PRD F5's FirstName-LastName-Resume pattern). */
export function buildResumeFilename(fullName: string): string {
  const cleaned = sanitizeFilenameSegment(fullName)
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Resume'
  return `${parts.join('-')}-Resume`
}

/**
 * Triggers the browser's print dialog against the print-only resume markup
 * (App.tsx renders it under `print:block`, hidden otherwise). Most browsers
 * suggest `document.title` as the default filename when the user picks
 * "Save as PDF", so the title is swapped to the resume's filename for the
 * duration of the print flow and restored via `afterprint` (which fires
 * whether the user saves or cancels).
 */
export function printResume(fullName: string): void {
  const originalTitle = document.title
  document.title = buildResumeFilename(fullName)

  const restoreTitle = () => {
    document.title = originalTitle
    window.removeEventListener('afterprint', restoreTitle)
  }
  window.addEventListener('afterprint', restoreTitle)

  window.print()
}
