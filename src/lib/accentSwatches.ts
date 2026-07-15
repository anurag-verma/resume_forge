export interface AccentSwatch {
  label: string
  hex: string
}

/** 8 curated swatches (Frontend spec §3.5) — all comfortably clear the 3:1
 *  accent-on-white contrast floor, so the warning only ever fires for a
 *  user's own custom hex, never for a preset. */
export const ACCENT_SWATCHES: AccentSwatch[] = [
  { label: 'Blue', hex: '#2456A6' },
  { label: 'Teal', hex: '#0F766E' },
  { label: 'Green', hex: '#166534' },
  { label: 'Amber', hex: '#B45309' },
  { label: 'Red', hex: '#B91C1C' },
  { label: 'Pink', hex: '#BE185D' },
  { label: 'Purple', hex: '#6D28D9' },
  { label: 'Slate', hex: '#334155' },
]
