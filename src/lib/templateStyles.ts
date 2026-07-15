import { getFontPair } from './fontPairs'
import type { Settings } from '../types/resume'

const FONT_SCALE_PX: Record<Settings['fontScale'], number> = {
  sm: 13,
  md: 14,
  lg: 16,
}

/**
 * Resolves per-resume Settings into the CSS custom properties every template
 * consumes (Architecture doc §5.2: --accent, --font-body, --font-heading,
 * --line-height, driven by Settings). Using real CSS variables — rather than
 * baking computed values into each element inline — means every template
 * reads the same handful of variables off the root, and a future Customize
 * panel (RB-025) update just changes these values without touching markup.
 */
export function getTemplateCssVars(settings: Settings): Record<string, string> {
  const fontPair = getFontPair(settings.fontPairId)
  return {
    '--accent': settings.accentColor,
    '--font-heading': fontPair.heading,
    '--font-body': fontPair.body,
    '--line-height': String(settings.lineSpacing),
    '--section-spacing': `${settings.sectionSpacing}px`,
    '--font-size-base': `${FONT_SCALE_PX[settings.fontScale]}px`,
  }
}
