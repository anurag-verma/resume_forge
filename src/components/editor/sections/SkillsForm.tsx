import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useResumeStore } from '../../../store/useResumeStore'
import { createId } from '../../../lib/id'
import type { Section, SkillEntry } from '../../../types/resume'

interface SkillsFormProps {
  resumeId: string
  section: Section
}

const UNGROUPED = 'Ungrouped'

export function SkillsForm({ resumeId, section }: SkillsFormProps) {
  const addEntry = useResumeStore((state) => state.addEntry)
  const updateEntry = useResumeStore((state) => state.updateEntry)
  const removeEntry = useResumeStore((state) => state.removeEntry)
  const reorderEntries = useResumeStore((state) => state.reorderEntries)

  const entries = section.entries.filter(
    (entry): entry is SkillEntry => entry.type === 'skills',
  )

  const [grouped, setGrouped] = useState(() => entries.some((entry) => entry.group))
  const [skillDraft, setSkillDraft] = useState('')
  const [groupDraft, setGroupDraft] = useState('')

  function handleAddSkill() {
    const name = skillDraft.trim()
    if (!name) return
    const group = grouped ? groupDraft.trim() || undefined : undefined
    addEntry(resumeId, section.id, { id: createId(), type: 'skills', name, group })
    setSkillDraft('')
  }

  /** Reorders `subset` (either all skills, or one group's skills) and writes the
   *  resulting order back into the full entries array, leaving every entry
   *  outside the subset in its existing position. */
  function moveEntry(subset: SkillEntry[], entryId: string, direction: -1 | 1) {
    const ids = subset.map((entry) => entry.id)
    const index = ids.indexOf(entryId)
    const swapWith = index + direction
    if (swapWith < 0 || swapWith >= ids.length) return

    const reordered = [...ids]
    ;[reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]]

    const idSet = new Set(ids)
    let cursor = 0
    const fullOrder = entries.map((entry) =>
      idSet.has(entry.id) ? reordered[cursor++] : entry.id,
    )
    reorderEntries(resumeId, section.id, fullOrder)
  }

  function renameGroup(oldName: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return
    entries
      .filter((entry) => (entry.group || UNGROUPED) === oldName)
      .forEach((entry) =>
        updateEntry(resumeId, section.id, entry.id, {
          group: trimmed === UNGROUPED ? undefined : trimmed,
        }),
      )
  }

  const groupNames = useMemo(() => {
    if (!grouped) return []
    const seen: string[] = []
    for (const entry of entries) {
      const name = entry.group || UNGROUPED
      if (!seen.includes(name)) seen.push(name)
    }
    return seen
  }, [entries, grouped])

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={grouped}
          onChange={(event) => setGrouped(event.target.checked)}
          className="h-4 w-4 rounded border-line text-action focus:ring-action"
        />
        Group skills
      </label>

      {entries.length === 0 && (
        <p className="text-sm text-muted">Type a skill and press Enter to add it.</p>
      )}

      {grouped ? (
        <div className="flex flex-col gap-4">
          {groupNames.map((groupName) => {
            const groupEntries = entries.filter(
              (entry) => (entry.group || UNGROUPED) === groupName,
            )
            return (
              <SkillGroup
                key={groupName}
                groupName={groupName}
                entries={groupEntries}
                onRemove={(id) => removeEntry(resumeId, section.id, id)}
                onMove={(id, direction) => moveEntry(groupEntries, id, direction)}
                onRenameGroup={(newName) => renameGroup(groupName, newName)}
              />
            )
          })}
        </div>
      ) : (
        <SkillTagList
          entries={entries}
          onRemove={(id) => removeEntry(resumeId, section.id, id)}
          onMove={(id, direction) => moveEntry(entries, id, direction)}
        />
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="skill-input" className="text-sm font-medium text-ink">
            Add a skill
          </label>
          <input
            id="skill-input"
            value={skillDraft}
            onChange={(event) => setSkillDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleAddSkill()
              }
            }}
            placeholder="TypeScript"
            className="rounded-input border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action"
          />
        </div>
        {grouped && (
          <div className="flex flex-col gap-1">
            <label htmlFor="skill-group-input" className="text-sm font-medium text-ink">
              Group
            </label>
            <input
              id="skill-group-input"
              value={groupDraft}
              onChange={(event) => setGroupDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleAddSkill()
                }
              }}
              placeholder="Languages"
              className="rounded-input border border-line px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action"
            />
          </div>
        )}
        <button
          type="button"
          onClick={handleAddSkill}
          className="flex items-center gap-1.5 rounded-input border border-dashed border-line px-3 py-2 text-sm text-muted hover:border-action hover:text-action"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </div>
    </div>
  )
}

interface SkillTagListProps {
  entries: SkillEntry[]
  onRemove: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
}

function SkillTagList({ entries, onRemove, onMove }: SkillTagListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {entries.map((entry, index) => (
        <SkillTag
          key={entry.id}
          entry={entry}
          isFirst={index === 0}
          isLast={index === entries.length - 1}
          onRemove={() => onRemove(entry.id)}
          onMoveLeft={() => onMove(entry.id, -1)}
          onMoveRight={() => onMove(entry.id, 1)}
        />
      ))}
    </ul>
  )
}

interface SkillGroupProps {
  groupName: string
  entries: SkillEntry[]
  onRemove: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
  onRenameGroup: (newName: string) => void
}

function SkillGroup({
  groupName,
  entries,
  onRemove,
  onMove,
  onRenameGroup,
}: SkillGroupProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(groupName)

  function commit() {
    onRenameGroup(draft)
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
            if (event.key === 'Escape') {
              setDraft(groupName)
              setEditing(false)
            }
          }}
          aria-label="Group name"
          className="w-fit rounded-input border border-line px-2 py-1 text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-action"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(groupName)
            setEditing(true)
          }}
          className="w-fit text-left text-sm font-medium text-ink hover:underline"
        >
          {groupName}
        </button>
      )}
      <SkillTagList entries={entries} onRemove={onRemove} onMove={onMove} />
    </div>
  )
}

interface SkillTagProps {
  entry: SkillEntry
  isFirst: boolean
  isLast: boolean
  onRemove: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}

function SkillTag({
  entry,
  isFirst,
  isLast,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: SkillTagProps) {
  return (
    <li className="flex items-center gap-1 rounded-full border border-line bg-paper py-1 pl-3 pr-1 text-sm text-ink">
      <span>{entry.name}</span>
      <button
        type="button"
        onClick={onMoveLeft}
        disabled={isFirst}
        aria-label={`Move ${entry.name} earlier`}
        className="rounded-full p-0.5 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onMoveRight}
        disabled={isLast}
        aria-label={`Move ${entry.name} later`}
        className="rounded-full p-0.5 text-muted hover:bg-surface hover:text-ink disabled:opacity-30"
      >
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${entry.name}`}
        className="rounded-full p-0.5 text-muted hover:bg-surface hover:text-danger"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </li>
  )
}
