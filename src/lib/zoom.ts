export type ZoomLevel = 'fit' | number

export const MIN_ZOOM_PERCENT = 25
export const MAX_ZOOM_PERCENT = 200

export function clampZoomPercent(percent: number): number {
  return Math.min(MAX_ZOOM_PERCENT, Math.max(MIN_ZOOM_PERCENT, Math.round(percent)))
}
