import { useState } from 'react'
import { LayoutGrid, Menu, Palette } from 'lucide-react'
import logo from '../../assets/resumeforge-logo.png'
import { useResumeStore } from '../../store/useResumeStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { CustomizePanel } from './CustomizePanel'
import { ImportExportMenu } from './ImportExportMenu'
import { PdfDownloadButton } from './PdfDownloadButton'
import { ResumeManager } from './ResumeManager'
import { SaveStatusChip } from './SaveStatusChip'
import { TemplateGalleryModal } from './TemplateGalleryModal'

export function Toolbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const activeResumeId = useResumeStore((state) => state.activeResumeId)
  const activeResume = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === activeResumeId),
  )
  const settings = useSettingsStore((state) => state.getSettings(activeResumeId))

  return (
    <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <img
          src={logo}
          alt="ResumeForge"
          width={186}
          height={64}
          className="h-16 w-auto shrink-0"
        />
        <ResumeManager />
      </div>

      <div className="hidden items-center gap-1.5 lg:gap-2 md:flex">
        <SaveStatusChip />
        <ToolbarActions
          fullName={activeResume?.personalInfo.fullName ?? ''}
          onOpenTemplateGallery={() => setTemplateGalleryOpen(true)}
          onOpenCustomize={() => setCustomizeOpen(true)}
        />
      </div>

      <button
        type="button"
        className="rounded-input p-2 text-ink hover:bg-paper md:hidden"
        aria-label="Open menu"
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {mobileMenuOpen && (
        <div className="absolute inset-x-0 top-14 flex flex-col gap-2 border-b border-line bg-surface p-4 shadow-subtle md:hidden">
          <SaveStatusChip />
          <ToolbarActions
            stacked
            fullName={activeResume?.personalInfo.fullName ?? ''}
            onOpenTemplateGallery={() => {
              setMobileMenuOpen(false)
              setTemplateGalleryOpen(true)
            }}
            onOpenCustomize={() => {
              setMobileMenuOpen(false)
              setCustomizeOpen(true)
            }}
          />
        </div>
      )}

      {activeResume && (
        <>
          <TemplateGalleryModal
            open={templateGalleryOpen}
            onClose={() => setTemplateGalleryOpen(false)}
            resume={activeResume}
            settings={settings}
          />
          <CustomizePanel
            open={customizeOpen}
            onClose={() => setCustomizeOpen(false)}
            resumeId={activeResume.id}
            settings={settings}
          />
        </>
      )}
    </header>
  )
}

interface ToolbarActionsProps {
  stacked?: boolean
  fullName: string
  onOpenTemplateGallery: () => void
  onOpenCustomize: () => void
}

function ToolbarActions({
  stacked = false,
  fullName,
  onOpenTemplateGallery,
  onOpenCustomize,
}: ToolbarActionsProps) {
  const buttonClass =
    'flex items-center whitespace-nowrap gap-1 lg:gap-1.5 rounded-input border border-line px-2 lg:px-3 py-1.5 text-xs lg:text-sm text-ink hover:bg-paper'

  return (
    <div className={stacked ? 'flex flex-col gap-2' : 'flex items-center gap-1.5 lg:gap-2'}>
      <button type="button" className={buttonClass} onClick={onOpenTemplateGallery}>
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden="true" />
        Template
      </button>
      <button type="button" className={buttonClass} onClick={onOpenCustomize}>
        <Palette className="h-4 w-4 shrink-0" aria-hidden="true" />
        Customize
      </button>
      <ImportExportMenu className={buttonClass} />
      <PdfDownloadButton
        fullName={fullName}
        className="flex items-center gap-1 whitespace-nowrap rounded-input bg-action px-2 py-1.5 text-xs font-medium text-white hover:opacity-90 lg:gap-1.5 lg:px-3 lg:text-sm"
      />
    </div>
  )
}
