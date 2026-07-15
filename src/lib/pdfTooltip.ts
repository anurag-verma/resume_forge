const SEEN_KEY = 'resume-builder-pdf-tooltip-seen'

/** Whether the one-time "choose Save as PDF" hint has already been shown. */
export function hasSeenPdfTooltip(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === 'true'
  } catch {
    return true
  }
}

export function markPdfTooltipSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, 'true')
  } catch {
    // Best-effort only — worst case the tooltip reappears next session.
  }
}
