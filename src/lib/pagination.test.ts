import { describe, it, expect } from 'vitest'
import { computePagination } from './pagination'

const PAGE_HEIGHT = 300

describe('computePagination', () => {
  it('is a single page with no breaks for zero or negative height', () => {
    expect(computePagination(0, PAGE_HEIGHT)).toEqual({ pageCount: 1, breakOffsetsPx: [] })
    expect(computePagination(-50, PAGE_HEIGHT)).toEqual({
      pageCount: 1,
      breakOffsetsPx: [],
    })
  })

  it('is a single page when content exactly fills one page', () => {
    expect(computePagination(300, PAGE_HEIGHT)).toEqual({
      pageCount: 1,
      breakOffsetsPx: [],
    })
  })

  it('overflows to a second page by even one pixel', () => {
    expect(computePagination(301, PAGE_HEIGHT)).toEqual({
      pageCount: 2,
      breakOffsetsPx: [300],
    })
  })

  it('computes multiple breaks for content spanning several pages', () => {
    expect(computePagination(750, PAGE_HEIGHT)).toEqual({
      pageCount: 3,
      breakOffsetsPx: [300, 600],
    })
  })

  it('uses the real A4 page height by default', () => {
    const result = computePagination(2000)
    // 297mm at 96dpi ≈ 1122.5px, so 2000px should span 2 pages
    expect(result.pageCount).toBe(2)
    expect(result.breakOffsetsPx).toHaveLength(1)
  })
})
