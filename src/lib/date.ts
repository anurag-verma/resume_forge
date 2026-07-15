const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const MONTH_OPTIONS = MONTH_NAMES.map((label, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label,
}))

export function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let year = currentYear + 1; year >= currentYear - 60; year--) {
    years.push(year)
  }
  return years
}

export function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonthYear(value: string): string {
  const [yearStr, monthStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  if (!year || !month || month < 1 || month > 12) return ''
  return `${MONTH_ABBR[month - 1]} ${year}`
}

export function formatDateRange(start: string, end: string | null): string {
  const startLabel = start ? formatMonthYear(start) : ''
  const endLabel = end === null ? 'Present' : formatMonthYear(end)
  return `${startLabel} – ${endLabel}`
}
