import { describe, it, expect } from 'vitest'
import { formatDateRange, formatMonthYear, getYearOptions } from './date'

describe('formatMonthYear', () => {
  it('formats a YYYY-MM value as "Mon YYYY"', () => {
    expect(formatMonthYear('2023-04')).toBe('Apr 2023')
    expect(formatMonthYear('2020-12')).toBe('Dec 2020')
    expect(formatMonthYear('1999-01')).toBe('Jan 1999')
  })

  it('returns an empty string for invalid input', () => {
    expect(formatMonthYear('')).toBe('')
    expect(formatMonthYear('not-a-date')).toBe('')
    expect(formatMonthYear('2023-13')).toBe('')
  })
})

describe('formatDateRange', () => {
  it('formats an ongoing range as "Mon YYYY – Present"', () => {
    expect(formatDateRange('2023-04', null)).toBe('Apr 2023 – Present')
  })

  it('formats a closed range with both ends', () => {
    expect(formatDateRange('2020-01', '2022-06')).toBe('Jan 2020 – Jun 2022')
  })
})

describe('getYearOptions', () => {
  it('includes the current year and is sorted descending', () => {
    const years = getYearOptions()
    const currentYear = new Date().getFullYear()
    expect(years[0]).toBe(currentYear + 1)
    expect(years).toContain(currentYear)
    expect(years).toEqual([...years].sort((a, b) => b - a))
  })
})
