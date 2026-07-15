import { currentYearMonth } from '../../../lib/date'
import { MonthYearPicker } from './MonthYearPicker'

interface DateRangeInputProps {
  start: string
  end: string | null
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string | null) => void
  startLabel?: string
  endLabel?: string
  presentLabel?: string
}

export function DateRangeInput({
  start,
  end,
  onChangeStart,
  onChangeEnd,
  startLabel = 'Start date',
  endLabel = 'End date',
  presentLabel = 'Present',
}: DateRangeInputProps) {
  const isPresent = end === null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MonthYearPicker legend={startLabel} value={start} onChange={onChangeStart} />
      <div className="flex flex-col gap-1">
        <MonthYearPicker
          legend={endLabel}
          value={end ?? ''}
          onChange={onChangeEnd}
          disabled={isPresent}
        />
        <label className="mt-1 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={isPresent}
            onChange={(event) =>
              onChangeEnd(event.target.checked ? null : currentYearMonth())
            }
            className="h-4 w-4 rounded border-line text-action focus:ring-action"
          />
          {presentLabel}
        </label>
      </div>
    </div>
  )
}
