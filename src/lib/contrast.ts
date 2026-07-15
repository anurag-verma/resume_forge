const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function isValidHexColor(value: string): boolean {
  return HEX_PATTERN.test(value.trim())
}

function normalizeHex(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, '')
  if (trimmed.length === 3) {
    return trimmed
      .split('')
      .map((char) => char + char)
      .join('')
  }
  return trimmed
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex)
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return [r, g, b]
}

function channelLuminance(channel: number): number {
  const s = channel / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

/** WCAG 2.1 contrast ratio between two hex colors, in the 1–21 range. */
export function getContrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexToRgb(hexA))
  const luminanceB = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

const LOW_CONTRAST_THRESHOLD = 3

/**
 * Frontend spec §3.5: "contrast warning if accent-on-white < 3:1". 3:1 is the
 * WCAG AA floor for non-text UI components (the accent is used for borders,
 * headings, and rules — not paragraph text — so the stricter 4.5:1 text
 * threshold doesn't apply here).
 */
export function getLowContrastWarning(accentHex: string): string | null {
  if (!isValidHexColor(accentHex)) return null
  const ratio = getContrastRatio(accentHex, '#FFFFFF')
  if (ratio >= LOW_CONTRAST_THRESHOLD) return null
  return `Low contrast against white (${ratio.toFixed(1)}:1) — may be hard to see. Aim for at least 3:1.`
}
