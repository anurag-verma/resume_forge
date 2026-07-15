import { useEffect, useState } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { SideSheet } from '../ui/SideSheet'
import { ACCENT_SWATCHES } from '../../lib/accentSwatches'
import { FONT_PAIRS } from '../../lib/fontPairs'
import { TEMPLATE_DEFAULT_CUSTOMIZATION } from '../../lib/templateDefaults'
import { getLowContrastWarning, isValidHexColor } from '../../lib/contrast'
import type { Settings } from '../../types/resume'

interface CustomizePanelProps {
  open: boolean
  onClose: () => void
  resumeId: string
  settings: Settings
}

const FONT_SCALE_OPTIONS: { value: Settings['fontScale']; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
]

/** Frontend spec §3.5: accent swatches + hex with contrast warning, font
 *  pair, font size, line/section spacing, reset link — every control writes
 *  straight to useSettingsStore, which templates already consume as CSS
 *  variables (RB-021 `getTemplateCssVars`), so the preview updates live with
 *  no extra plumbing here. */
export function CustomizePanel({ open, onClose, resumeId, settings }: CustomizePanelProps) {
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const [hexDraft, setHexDraft] = useState(settings.accentColor)
  const [hexError, setHexError] = useState<string | null>(null)

  useEffect(() => {
    setHexDraft(settings.accentColor)
    setHexError(null)
  }, [settings.accentColor, open])

  function commitHex() {
    if (!isValidHexColor(hexDraft)) {
      setHexError('Enter a valid hex color, e.g. #2456A6.')
      return
    }
    setHexError(null)
    const normalized = hexDraft.trim().startsWith('#') ? hexDraft.trim() : `#${hexDraft.trim()}`
    updateSettings(resumeId, { accentColor: normalized })
  }

  const contrastWarning = getLowContrastWarning(settings.accentColor)

  return (
    <SideSheet open={open} onClose={onClose} title="Customize">
      <div className="flex flex-col gap-6">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Accent color</h3>
          <div className="flex flex-wrap gap-2">
            {ACCENT_SWATCHES.map((swatch) => {
              const isActive = settings.accentColor.toLowerCase() === swatch.hex.toLowerCase()
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  aria-label={swatch.label}
                  aria-pressed={isActive}
                  onClick={() => updateSettings(resumeId, { accentColor: swatch.hex })}
                  className={`h-8 w-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2 ${
                    isActive ? 'border-action' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              )
            })}
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <label htmlFor="accent-hex" className="text-sm font-medium text-ink">
              Custom hex
            </label>
            <input
              id="accent-hex"
              type="text"
              value={hexDraft}
              onChange={(event) => setHexDraft(event.target.value)}
              onBlur={commitHex}
              aria-describedby={
                hexError ? 'accent-hex-error' : contrastWarning ? 'accent-hex-warning' : undefined
              }
              aria-invalid={Boolean(hexError)}
              className={`rounded-input border px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-action ${
                hexError ? 'border-danger' : 'border-line'
              }`}
            />
            {hexError && (
              <p id="accent-hex-error" role="alert" className="text-xs text-danger">
                {hexError}
              </p>
            )}
            {!hexError && contrastWarning && (
              <p id="accent-hex-warning" role="alert" className="text-xs text-danger">
                {contrastWarning}
              </p>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Font pair</h3>
          <div role="radiogroup" aria-label="Font pair" className="flex flex-col gap-2">
            {Object.values(FONT_PAIRS).map((pair) => (
              <label
                key={pair.id}
                className={`flex cursor-pointer items-center justify-between rounded-card border p-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-action ${
                  settings.fontPairId === pair.id ? 'border-action ring-1 ring-action' : 'border-line'
                }`}
              >
                <span className="flex flex-col">
                  <span className="text-lg" style={{ fontFamily: pair.heading }}>
                    Aa
                  </span>
                  <span className="text-xs text-muted">{pair.label}</span>
                </span>
                <input
                  type="radio"
                  name="fontPair"
                  value={pair.id}
                  aria-label={pair.label}
                  checked={settings.fontPairId === pair.id}
                  onChange={() => updateSettings(resumeId, { fontPairId: pair.id })}
                  className="h-4 w-4 accent-action"
                />
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Font size</h3>
          <div className="flex w-fit items-center gap-1 rounded-card border border-line bg-paper p-1">
            {FONT_SCALE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={settings.fontScale === option.value}
                onClick={() => updateSettings(resumeId, { fontScale: option.value })}
                className={`rounded-input px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-action ${
                  settings.fontScale === option.value
                    ? 'bg-action text-white'
                    : 'text-muted hover:bg-surface hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label htmlFor="line-spacing" className="mb-2 block text-sm font-semibold text-ink">
            Line spacing ({settings.lineSpacing.toFixed(1)})
          </label>
          <input
            id="line-spacing"
            type="range"
            min={1}
            max={1.6}
            step={0.1}
            value={settings.lineSpacing}
            onChange={(event) =>
              updateSettings(resumeId, { lineSpacing: Number(event.target.value) })
            }
            className="w-full accent-action"
          />
        </section>

        <section>
          <label htmlFor="section-spacing" className="mb-2 block text-sm font-semibold text-ink">
            Section spacing ({settings.sectionSpacing}px)
          </label>
          <input
            id="section-spacing"
            type="range"
            min={8}
            max={32}
            step={2}
            value={settings.sectionSpacing}
            onChange={(event) =>
              updateSettings(resumeId, { sectionSpacing: Number(event.target.value) })
            }
            className="w-full accent-action"
          />
        </section>

        <button
          type="button"
          onClick={() =>
            updateSettings(resumeId, TEMPLATE_DEFAULT_CUSTOMIZATION[settings.templateId])
          }
          className="self-start text-sm font-medium text-action underline-offset-2 hover:underline"
        >
          Reset to template defaults
        </button>
      </div>
    </SideSheet>
  )
}
