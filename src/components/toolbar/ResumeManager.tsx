import { useState } from 'react'
import { ChevronDown, Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { useResumeStore } from '../../store/useResumeStore'
import { ConfirmDialog } from '../ui/ConfirmDialog'

/** Toolbar's resume switcher: list, switch, create, rename, duplicate,
 *  delete (with confirm). All state lives in useResumeStore/useSettingsStore
 *  already (RB-003) — this is purely the UI on top of it. */
export function ResumeManager() {
  const [open, setOpen] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)

  const resumes = useResumeStore((state) => state.resumes)
  const activeResumeId = useResumeStore((state) => state.activeResumeId)
  const setActiveResume = useResumeStore((state) => state.setActiveResume)
  const createResume = useResumeStore((state) => state.createResume)
  const duplicateResume = useResumeStore((state) => state.duplicateResume)
  const deleteResume = useResumeStore((state) => state.deleteResume)
  const renameResume = useResumeStore((state) => state.renameResume)

  const activeResume = resumes.find((resume) => resume.id === activeResumeId)
  const confirmingResume = resumes.find((resume) => resume.id === confirmingDeleteId)

  function handleSelect(id: string) {
    setActiveResume(id)
    setOpen(false)
  }

  function handleCreate() {
    createResume()
    setOpen(false)
  }

  function handleDuplicate(id: string) {
    duplicateResume(id)
    setOpen(false)
  }

  function startRename(id: string, currentName: string) {
    setRenamingId(id)
    setRenameDraft(currentName)
  }

  function commitRename() {
    if (renamingId) {
      const original = resumes.find((resume) => resume.id === renamingId)?.name ?? 'Untitled'
      const trimmed = renameDraft.trim()
      renameResume(renamingId, trimmed || original)
    }
    setRenamingId(null)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="hidden min-w-0 items-center gap-1 rounded-input border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper md:flex"
      >
        <span className="max-w-[100px] truncate lg:max-w-[160px]">
          {activeResume?.name ?? 'Untitled Resume'}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Resumes"
          className="absolute left-0 top-full z-20 mt-1 w-72 rounded-card border border-line bg-surface p-1 shadow-subtle"
        >
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="flex items-center gap-1 rounded-input px-1 py-1 hover:bg-paper"
            >
              {renamingId === resume.id ? (
                <input
                  autoFocus
                  value={renameDraft}
                  onChange={(event) => setRenameDraft(event.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitRename()
                    if (event.key === 'Escape') setRenamingId(null)
                  }}
                  aria-label="Resume name"
                  className="min-w-0 flex-1 rounded-input border border-line px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-action"
                />
              ) : (
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={resume.id === activeResumeId}
                  onClick={() => handleSelect(resume.id)}
                  className={`min-w-0 flex-1 truncate rounded-input px-2 py-1.5 text-left text-sm ${
                    resume.id === activeResumeId ? 'font-semibold text-action' : 'text-ink'
                  }`}
                >
                  {resume.name}
                </button>
              )}

              <button
                type="button"
                onClick={() => startRename(resume.id, resume.name)}
                aria-label={`Rename ${resume.name}`}
                className="shrink-0 rounded-input p-1.5 text-muted hover:bg-surface hover:text-ink"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleDuplicate(resume.id)}
                aria-label={`Duplicate ${resume.name}`}
                className="shrink-0 rounded-input p-1.5 text-muted hover:bg-surface hover:text-ink"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDeleteId(resume.id)}
                aria-label={`Delete ${resume.name}`}
                className="shrink-0 rounded-input p-1.5 text-muted hover:bg-surface hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={handleCreate}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-input border border-dashed border-line px-3 py-2 text-sm text-muted hover:border-action hover:text-action"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New resume
          </button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmingResume)}
        title={`Delete "${confirmingResume?.name}"?`}
        description="This will permanently delete this resume and its settings. This can't be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmingDeleteId) deleteResume(confirmingDeleteId)
          setConfirmingDeleteId(null)
        }}
        onCancel={() => setConfirmingDeleteId(null)}
      />
    </div>
  )
}
