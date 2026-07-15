import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { PAGE_HEIGHT_PX, PAGE_WIDTH_PX, computePagination } from '../../lib/pagination'

interface PagedDocumentProps {
  children: ReactNode
}

/**
 * Renders resume content as one continuous A4-width column, with dashed
 * lines and "Page N of M" labels overlaid wherever the content would spill
 * onto another physical page. This is a visual approximation only — the
 * actual exported PDF is paginated by the browser's print engine (RB-030).
 */
export function PagedDocument({ children }: PagedDocumentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element) return

    const measure = () => setContentHeight(element.scrollHeight)
    measure()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [children])

  const { pageCount, breakOffsetsPx } = computePagination(contentHeight)
  const pageStartOffsets = [0, ...breakOffsetsPx]

  return (
    <div
      className="relative bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
      style={{ width: PAGE_WIDTH_PX, minHeight: PAGE_HEIGHT_PX }}
      aria-label={`Resume preview, ${pageCount} page${pageCount === 1 ? '' : 's'}`}
    >
      <div ref={contentRef} data-testid="paged-content">
        {children}
      </div>

      {pageStartOffsets.map((top, index) => (
        <span
          key={top}
          className="pointer-events-none absolute left-2 rounded bg-paper px-1.5 py-0.5 text-[10px] font-medium text-muted"
          style={{ top: top + 8 }}
        >
          Page {index + 1} of {pageCount}
        </span>
      ))}

      {breakOffsetsPx.map((offsetPx) => (
        <div
          key={offsetPx}
          data-testid="page-break"
          className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-action/50"
          style={{ top: offsetPx }}
        />
      ))}
    </div>
  )
}
