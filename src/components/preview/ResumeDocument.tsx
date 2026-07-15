import { Suspense, memo } from 'react'
import { getTemplateDefinition } from '../templates'
import type { Resume, Settings } from '../../types/resume'

interface ResumeDocumentProps {
  resume: Resume
  settings: Settings
}

/**
 * Each template is React.lazy-loaded (templates/index.ts), so only the
 * active template's chunk is fetched — switching templates (or opening the
 * gallery, which previews all three) is what triggers the others to load.
 *
 * Wrapped in React.memo (RB-043): this is the boundary above the markdown-lite
 * parsing and per-entry rendering every template does, and `resume`/`settings`
 * are the exact Zustand-selector values that only change reference when their
 * content actually changes. Without this, any unrelated re-render higher up
 * (e.g. PreviewPane's own zoom/container-width state, or the mobile tab
 * switching) would redo that work for no reason.
 */
function ResumeDocumentComponent({ resume, settings }: ResumeDocumentProps) {
  const template = getTemplateDefinition(settings.templateId)
  const TemplateComponent = template.component

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading template…</div>}>
      <TemplateComponent resume={resume} settings={settings} />
    </Suspense>
  )
}

export const ResumeDocument = memo(ResumeDocumentComponent)
