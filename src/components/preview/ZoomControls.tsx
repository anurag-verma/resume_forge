import type { ZoomLevel } from '../../lib/zoom'

interface ZoomControlsProps {
  zoom: ZoomLevel
  onChange: (zoom: ZoomLevel) => void
}

export function ZoomControls({ zoom, onChange }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-card border border-line bg-surface p-1 shadow-subtle">
      <ZoomButton label="Fit" active={zoom === 'fit'} onClick={() => onChange('fit')} />
      <ZoomButton label="75%" active={zoom === 75} onClick={() => onChange(75)} />
      <ZoomButton label="100%" active={zoom === 100} onClick={() => onChange(100)} />
    </div>
  )
}

interface ZoomButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

function ZoomButton({ label, active, onClick }: ZoomButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-input px-2.5 py-1 text-xs font-medium ${
        active ? 'bg-action text-white' : 'text-muted hover:bg-paper hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}
