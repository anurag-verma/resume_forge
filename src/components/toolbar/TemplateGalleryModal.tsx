import { useSettingsStore } from '../../store/useSettingsStore'
import { Modal } from '../ui/Modal'
import { TemplateThumbnail } from '../preview/TemplateThumbnail'
import { TEMPLATES } from '../templates'
import type { Resume, Settings } from '../../types/resume'

interface TemplateGalleryModalProps {
  open: boolean
  onClose: () => void
  resume: Resume
  settings: Settings
}

/** Frontend spec §3.7: grid of live-rendered template thumbnails; selecting
 *  one applies instantly and never touches resume content, only Settings. */
export function TemplateGalleryModal({
  open,
  onClose,
  resume,
  settings,
}: TemplateGalleryModalProps) {
  const updateSettings = useSettingsStore((state) => state.updateSettings)

  function handleSelect(templateId: Settings['templateId']) {
    updateSettings(resume.id, { templateId })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Choose a template">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TEMPLATES.map((template) => {
          const isActive = settings.templateId === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template.id)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-2 rounded-card border p-2 text-left hover:border-action ${
                isActive ? 'border-action ring-2 ring-action' : 'border-line'
              }`}
            >
              <TemplateThumbnail
                resume={resume}
                settings={{ ...settings, templateId: template.id }}
              />
              <div className="flex w-full items-center justify-between px-1">
                <span className="text-sm font-medium text-ink">{template.name}</span>
                {template.atsFriendly && (
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                    ATS-friendly
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
