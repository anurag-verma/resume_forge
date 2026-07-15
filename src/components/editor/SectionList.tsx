import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useResumeStore } from '../../store/useResumeStore'
import { ADDABLE_SECTION_TYPES, SECTION_TYPE_LABELS } from '../../lib/sectionTypes'
import { SectionBody } from './SectionBody'
import { SectionCard } from './shared/SectionCard'
import { SortableList } from './shared/SortableList'
import type { SectionType } from '../../types/resume'

interface SectionListProps {
  resumeId: string
}

export function SectionList({ resumeId }: SectionListProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sections = useResumeStore(
    (state) => state.resumes.find((resume) => resume.id === resumeId)?.sections ?? [],
  )
  const addSection = useResumeStore((state) => state.addSection)
  const reorderSections = useResumeStore((state) => state.reorderSections)

  const usedTypes = new Set(sections.map((section) => section.type))
  const availableTypes = ADDABLE_SECTION_TYPES.filter(
    (type) => type === 'custom' || !usedTypes.has(type),
  )

  function handleAdd(type: SectionType) {
    addSection(resumeId, type, SECTION_TYPE_LABELS[type])
    setMenuOpen(false)
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <SortableList
        items={sections}
        onReorder={(orderedIds) => reorderSections(resumeId, orderedIds)}
        className="flex flex-col gap-3"
      >
        {(section) => (
          <SectionCard key={section.id} section={section} resumeId={resumeId}>
            <SectionBody resumeId={resumeId} section={section} />
          </SectionCard>
        )}
      </SortableList>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-center gap-1.5 rounded-input border border-dashed border-line px-3 py-2 text-sm text-muted hover:border-action hover:text-action"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add section
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Add section"
            className="absolute inset-x-0 top-full z-10 mt-1 rounded-card border border-line bg-surface p-1 shadow-subtle"
          >
            {availableTypes.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">All section types added.</p>
            ) : (
              availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="menuitem"
                  onClick={() => handleAdd(type)}
                  className="block w-full rounded-input px-3 py-2 text-left text-sm text-ink hover:bg-paper"
                >
                  {SECTION_TYPE_LABELS[type]}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
