interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  type?: string
  placeholder?: string
  hint?: string
  error?: string
}

export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  hint,
  error,
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`rounded-input border px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action ${
          error ? 'border-danger' : 'border-line'
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}
