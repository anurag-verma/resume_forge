export const MM_TO_PX = 96 / 25.4
export const PAGE_WIDTH_MM = 210
export const PAGE_HEIGHT_MM = 297
export const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX
export const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX

export interface Pagination {
  pageCount: number
  /** Y offsets (px, from the content's top) where a page boundary falls. */
  breakOffsetsPx: number[]
}

/**
 * Given the actual rendered height of the resume content, works out how many
 * A4 pages it spans and where each page break falls. This is an on-screen
 * approximation only (a visual indicator) — real pagination for the exported
 * PDF is handled by the browser's print engine via `@page` CSS (RB-030).
 */
export function computePagination(
  contentHeightPx: number,
  pageHeightPx: number = PAGE_HEIGHT_PX,
): Pagination {
  const safeHeight = Math.max(contentHeightPx, 0)
  const pageCount = Math.max(1, Math.ceil(safeHeight / pageHeightPx))
  const breakOffsetsPx = Array.from({ length: pageCount - 1 }, (_, index) => {
    return (index + 1) * pageHeightPx
  })
  return { pageCount, breakOffsetsPx }
}
