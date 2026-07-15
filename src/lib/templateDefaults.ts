import { DEFAULT_SETTINGS } from './defaultResume'
import type { Settings } from '../types/resume'

type Customization = Omit<Settings, 'templateId'>

/**
 * Per-template "recommended defaults" for the Customize panel's
 * "Reset to template defaults" link (Frontend spec §3.5) — deliberately
 * distinct from the single global `DEFAULT_SETTINGS` (which is Classic's
 * look), since resetting while on Modern or Minimal should restore *that*
 * template's own recommended pairing (RB-022/RB-023), not silently revert
 * accent/font/spacing to Classic's values.
 */
export const TEMPLATE_DEFAULT_CUSTOMIZATION: Record<Settings['templateId'], Customization> = {
  classic: {
    accentColor: DEFAULT_SETTINGS.accentColor,
    fontPairId: 'classic-serif',
    fontScale: 'md',
    lineSpacing: 1.4,
    sectionSpacing: 16,
  },
  modern: {
    accentColor: DEFAULT_SETTINGS.accentColor,
    fontPairId: 'inter',
    fontScale: 'md',
    lineSpacing: 1.4,
    sectionSpacing: 16,
  },
  minimal: {
    accentColor: DEFAULT_SETTINGS.accentColor,
    fontPairId: 'spectral-inter',
    fontScale: 'md',
    lineSpacing: 1.4,
    sectionSpacing: 16,
  },
}
