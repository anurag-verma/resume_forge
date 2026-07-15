import { useState } from 'react'
import { Download } from 'lucide-react'
import { printResume } from '../../lib/pdf'
import { hasSeenPdfTooltip, markPdfTooltipSeen } from '../../lib/pdfTooltip'

interface PdfDownloadButtonProps {
  fullName: string
  className: string
}

/**
 * Frontend spec §3.1/Architecture §5.3: one-time tooltip ("choose Save as
 * PDF") shown before the very first print. The hint is shown as its own
 * step — the user reads it, then explicitly continues — rather than firing
 * alongside `window.print()`, since the native print dialog would otherwise
 * immediately cover it.
 */
export function PdfDownloadButton({ fullName, className }: PdfDownloadButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  function handleClick() {
    if (!hasSeenPdfTooltip()) {
      setTooltipOpen(true)
      return
    }
    printResume(fullName)
  }

  function handleContinue() {
    markPdfTooltipSeen()
    setTooltipOpen(false)
    printResume(fullName)
  }

  return (
    <div className="relative">
      <button type="button" onClick={handleClick} className={className}>
        <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
        Download PDF
      </button>

      {tooltipOpen && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-20 mt-2 w-64 rounded-card border border-line bg-surface p-3 text-sm text-ink shadow-subtle"
        >
          <p>
            In the print dialog, choose <strong>&quot;Save as PDF&quot;</strong> as the
            destination.
          </p>
          <button
            type="button"
            onClick={handleContinue}
            className="mt-2 w-full rounded-input bg-action px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Continue to print
          </button>
        </div>
      )}
    </div>
  )
}
