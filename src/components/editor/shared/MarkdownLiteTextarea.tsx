import { useRef } from 'react'
import { Bold, Italic, List, type LucideIcon } from 'lucide-react'

interface MarkdownLiteTextareaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}

export function MarkdownLiteTextarea({
  id,
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: MarkdownLiteTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function wrapSelection(marker: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const before = value.slice(0, selectionStart)
    const selected = value.slice(selectionStart, selectionEnd) || 'text'
    const after = value.slice(selectionEnd)
    const next = `${before}${marker}${selected}${marker}${after}`

    onChange(next)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursorStart = selectionStart + marker.length
      textarea.setSelectionRange(cursorStart, cursorStart + selected.length)
    })
  }

  function toggleBullet() {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const nextNewline = value.indexOf('\n', selectionEnd)
    const lineEnd = nextNewline === -1 ? value.length : nextNewline

    const block = value.slice(lineStart, lineEnd)
    const lines = block.split('\n')
    const alreadyBulleted = lines.every(
      (line) => line.trim() === '' || /^[-*]\s/.test(line),
    )

    const nextLines = lines.map((line) => {
      if (line.trim() === '') return line
      return alreadyBulleted ? line.replace(/^[-*]\s+/, '') : `- ${line}`
    })

    const next = value.slice(0, lineStart) + nextLines.join('\n') + value.slice(lineEnd)
    onChange(next)

    requestAnimationFrame(() => textarea.focus())
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="flex gap-1 rounded-t-input border border-b-0 border-line bg-paper p-1">
        <ToolbarButton icon={Bold} label="Bold" onClick={() => wrapSelection('**')} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => wrapSelection('*')} />
        <ToolbarButton icon={List} label="Bullet list" onClick={toggleBullet} />
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="rounded-b-input border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action"
      />
    </div>
  )
}

interface ToolbarButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
}

function ToolbarButton({ icon: Icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-input p-1.5 text-muted hover:bg-surface hover:text-ink"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
