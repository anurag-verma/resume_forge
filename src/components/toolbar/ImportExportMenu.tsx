import { useRef, useState, type ChangeEvent } from 'react'
import { FileUp } from 'lucide-react'
import { useResumeStore } from '../../store/useResumeStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { downloadJsonFile } from '../../lib/download'
import { applyImport, type ImportMode } from '../../lib/importResume'
import {
  buildAppDataExport,
  buildAppDataExportFilename,
  buildSingleResumeExport,
  buildSingleResumeExportFilename,
} from '../../lib/storage'
import { readAndValidateImportFile, type ValidatedImport } from '../../lib/validateImport'
import { DeleteAllDataDialog } from './DeleteAllDataDialog'
import { ImportConfirmDialog } from './ImportConfirmDialog'
import { Modal } from '../ui/Modal'

interface ImportExportMenuProps {
  className: string
}

export function ImportExportMenu({ className }: ImportExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<ValidatedImport | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeResumeId = useResumeStore((state) => state.activeResumeId)
  const activeResume = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === activeResumeId),
  )

  function handleExportSingle() {
    if (!activeResume) return
    const settings = useSettingsStore.getState().getSettings(activeResume.id)
    const data = buildSingleResumeExport(activeResume, settings)
    downloadJsonFile(buildSingleResumeExportFilename(activeResume.name), data)
    setOpen(false)
  }

  function handleExportAll() {
    const data = buildAppDataExport()
    downloadJsonFile(buildAppDataExportFilename(), data)
    setOpen(false)
  }

  function handleImportClick() {
    setOpen(false)
    fileInputRef.current?.click()
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file) return

    const result = await readAndValidateImportFile(file)
    if ('error' in result) {
      setImportError(result.error)
      return
    }
    setPendingImport(result.data)
  }

  function handleConfirmImport(mode: ImportMode) {
    if (!pendingImport) return
    applyImport(pendingImport, mode)
    setPendingImport(null)
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={className}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FileUp className="h-4 w-4 shrink-0" aria-hidden="true" />
        Import/Export
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      {open && (
        <div
          role="menu"
          aria-label="Import/Export"
          className="absolute right-0 top-full z-20 mt-1 w-56 rounded-card border border-line bg-surface p-1 shadow-subtle"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleImportClick}
            className="block w-full rounded-input px-3 py-2 text-left text-sm text-ink hover:bg-paper"
          >
            Import from file…
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleExportSingle}
            disabled={!activeResume}
            className="block w-full rounded-input px-3 py-2 text-left text-sm text-ink hover:bg-paper disabled:opacity-50"
          >
            Export this resume
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleExportAll}
            className="block w-full rounded-input px-3 py-2 text-left text-sm text-ink hover:bg-paper"
          >
            Export all resumes
          </button>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              setDeleteAllOpen(true)
            }}
            className="block w-full rounded-input px-3 py-2 text-left text-sm text-danger hover:bg-paper"
          >
            Delete all my data
          </button>
        </div>
      )}

      {pendingImport && (
        <ImportConfirmDialog
          data={pendingImport}
          onCancel={() => setPendingImport(null)}
          onConfirm={handleConfirmImport}
        />
      )}

      {importError && (
        <Modal open onClose={() => setImportError(null)} title="Import failed">
          <p className="text-sm text-ink">{importError}</p>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setImportError(null)}
              className="rounded-input bg-action px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              OK
            </button>
          </div>
        </Modal>
      )}

      <DeleteAllDataDialog open={deleteAllOpen} onClose={() => setDeleteAllOpen(false)} />
    </div>
  )
}
