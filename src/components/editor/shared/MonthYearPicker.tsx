import { MONTH_OPTIONS, currentYearMonth, getYearOptions } from '../../../lib/date'

interface MonthYearPickerProps {
  legend: string
  value: string // "YYYY-MM" or ''
  onChange: (value: string) => void
  disabled?: boolean
}

export function MonthYearPicker({
  legend,
  value,
  onChange,
  disabled = false,
}: MonthYearPickerProps) {
  const [year, month] = value ? value.split('-') : ['', '']
  const years = getYearOptions()
  const defaultMonth = currentYearMonth().split('-')[1]
  const defaultYear = String(new Date().getFullYear())

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-ink">{legend}</span>
      <div className="flex gap-2">
        <select
          aria-label={`${legend} month`}
          value={month}
          disabled={disabled}
          onChange={(event) => onChange(`${year || defaultYear}-${event.target.value}`)}
          className="min-w-0 flex-1 rounded-input border border-line px-2 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-action disabled:opacity-50"
        >
          <option value="" disabled>
            Month
          </option>
          {MONTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label={`${legend} year`}
          value={year}
          disabled={disabled}
          onChange={(event) => onChange(`${event.target.value}-${month || defaultMonth}`)}
          className="min-w-0 flex-1 rounded-input border border-line px-2 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-action disabled:opacity-50"
        >
          <option value="" disabled>
            Year
          </option>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
