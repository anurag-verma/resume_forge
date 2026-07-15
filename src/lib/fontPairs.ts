export interface FontPair {
  id: string
  label: string
  heading: string
  body: string
}

export const FONT_PAIRS: Record<string, FontPair> = {
  'classic-serif': {
    id: 'classic-serif',
    label: 'Source Serif / Source Sans',
    heading: '"Source Serif 4", Georgia, serif',
    body: '"Source Sans 3", system-ui, sans-serif',
  },
  inter: {
    id: 'inter',
    label: 'Inter',
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  'spectral-inter': {
    id: 'spectral-inter',
    label: 'Spectral / Inter',
    heading: '"Spectral", Georgia, serif',
    body: 'Inter, system-ui, sans-serif',
  },
}

const DEFAULT_FONT_PAIR = FONT_PAIRS['classic-serif']

export function getFontPair(id: string): FontPair {
  return FONT_PAIRS[id] ?? DEFAULT_FONT_PAIR
}
