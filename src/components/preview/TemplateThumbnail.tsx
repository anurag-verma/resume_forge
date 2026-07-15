import { Suspense } from 'react'
import { PAGE_HEIGHT_PX, PAGE_WIDTH_PX } from '../../lib/pagination'
import { getTemplateDefinition } from '../templates'
import type { Resume, Settings } from '../../types/resume'

const THUMBNAIL_WIDTH_PX = 180
const THUMBNAIL_SCALE = THUMBNAIL_WIDTH_PX / PAGE_WIDTH_PX

interface TemplateThumbnailProps {
  resume: Resume
  settings: Settings
}

/**
 * A live-rendered, scaled-down instance of the actual template component —
 * not a static image (Frontend spec §3.7) — so the gallery always reflects
 * the user's real content and current settings.
 */
export function TemplateThumbnail({ resume, settings }: TemplateThumbnailProps) {
  const template = getTemplateDefinition(settings.templateId)
  const TemplateComponent = template.component

  return (
    <div
      className="relative w-full overflow-hidden rounded-input border border-line bg-surface"
      style={{ aspectRatio: `${PAGE_WIDTH_PX} / ${PAGE_HEIGHT_PX}` }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: PAGE_WIDTH_PX, transform: `scale(${THUMBNAIL_SCALE})` }}
      >
        <Suspense fallback={null}>
          <TemplateComponent resume={resume} settings={settings} />
        </Suspense>
      </div>
    </div>
  )
}
