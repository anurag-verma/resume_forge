import type { ReactNode } from 'react'
import { formatDateRange, formatMonthYear } from '../../../lib/date'
import { renderMarkdownLite } from '../../../lib/markdownLite'
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  ProjectEntry,
  Section,
  SkillEntry,
  SummaryEntry,
} from '../../../types/resume'

export function EntryHeading({ children }: { children: ReactNode }) {
  return (
    <h3
      className="break-after-avoid-page font-semibold"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      {children}
    </h3>
  )
}

export function EntryMeta({ parts }: { parts: Array<string | undefined | null> }) {
  const text = parts.filter(Boolean).join(' · ')
  if (!text) return null
  return <p className="text-sm text-muted">{text}</p>
}

/**
 * Tailwind's base reset strips list-style from every <ul>, but
 * renderMarkdownLite deliberately emits bare <ul>/<li> with no className
 * (Security doc §4.1 — whitelist tags, no attributes). Restore bullets here,
 * at the one place every markdown-lite block in any template passes through.
 */
export function MarkdownLiteBlock({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  return (
    <div className={`[&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0.5 ${className ?? ''}`}>
      {renderMarkdownLite(text)}
    </div>
  )
}

/**
 * Renders a section's entries for their given type — shared by every
 * template so Classic/Modern/Minimal never disagree on what an Experience
 * or Skills entry actually says, only on how it's laid out around them.
 */
export function SectionEntries({ section }: { section: Section }) {
  switch (section.type) {
    case 'summary': {
      const entry = section.entries.find(
        (candidate): candidate is SummaryEntry => candidate.type === 'summary',
      )
      if (!entry?.content) return null
      return <MarkdownLiteBlock text={entry.content} className="break-inside-avoid text-sm" />
    }

    case 'experience':
      return (
        <>
          {section.entries
            .filter((entry): entry is ExperienceEntry => entry.type === 'experience')
            .map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <EntryHeading>
                  {[entry.role, entry.company].filter(Boolean).join(', ')}
                </EntryHeading>
                <EntryMeta
                  parts={[entry.location, formatDateRange(entry.startDate, entry.endDate)]}
                />
                {entry.description && (
                  <MarkdownLiteBlock text={entry.description} className="mt-1 text-sm" />
                )}
              </div>
            ))}
        </>
      )

    case 'education':
      return (
        <>
          {section.entries
            .filter((entry): entry is EducationEntry => entry.type === 'education')
            .map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <EntryHeading>
                  {[entry.degree, entry.institution].filter(Boolean).join(', ')}
                </EntryHeading>
                <EntryMeta
                  parts={[
                    entry.fieldOfStudy,
                    entry.location,
                    formatDateRange(entry.startDate, entry.endDate),
                  ]}
                />
                {entry.description && (
                  <MarkdownLiteBlock text={entry.description} className="mt-1 text-sm" />
                )}
              </div>
            ))}
        </>
      )

    case 'projects':
      return (
        <>
          {section.entries
            .filter((entry): entry is ProjectEntry => entry.type === 'projects')
            .map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <EntryHeading>{entry.name}</EntryHeading>
                <EntryMeta
                  parts={[
                    entry.role,
                    entry.startDate
                      ? formatDateRange(entry.startDate, entry.endDate ?? null)
                      : undefined,
                  ]}
                />
                {entry.technologies && entry.technologies.length > 0 && (
                  <p className="text-sm text-muted">{entry.technologies.join(', ')}</p>
                )}
                {entry.description && (
                  <MarkdownLiteBlock text={entry.description} className="mt-1 text-sm" />
                )}
              </div>
            ))}
        </>
      )

    case 'certifications':
      return (
        <>
          {section.entries
            .filter((entry): entry is CertificationEntry => entry.type === 'certifications')
            .map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <EntryHeading>{entry.name}</EntryHeading>
                <EntryMeta
                  parts={[entry.issuer, entry.date ? formatMonthYear(entry.date) : undefined]}
                />
              </div>
            ))}
        </>
      )

    case 'languages': {
      const entries = section.entries.filter(
        (entry): entry is LanguageEntry => entry.type === 'languages',
      )
      if (entries.length === 0) return null
      return (
        <p className="text-sm">
          {entries.map((entry) => `${entry.name} (${entry.proficiency})`).join(', ')}
        </p>
      )
    }

    case 'skills': {
      const entries = section.entries.filter(
        (entry): entry is SkillEntry => entry.type === 'skills',
      )
      if (entries.length === 0) return null

      const groupOrder: Array<string | undefined> = []
      const groups = new Map<string | undefined, SkillEntry[]>()
      for (const entry of entries) {
        if (!groups.has(entry.group)) {
          groups.set(entry.group, [])
          groupOrder.push(entry.group)
        }
        groups.get(entry.group)!.push(entry)
      }

      return (
        <div className="flex flex-col gap-1">
          {groupOrder.map((group) => (
            <p key={group ?? 'ungrouped'} className="text-sm">
              {group && <span className="font-semibold">{group}: </span>}
              {groups
                .get(group)!
                .map((entry) => entry.name)
                .join(', ')}
            </p>
          ))}
        </div>
      )
    }

    case 'custom':
      return (
        <>
          {section.entries.map((entry) => {
            if (entry.type !== 'custom') return null
            return (
              <div key={entry.id} className="break-inside-avoid">
                <EntryHeading>{entry.title}</EntryHeading>
                <EntryMeta parts={[entry.subtitle, entry.date]} />
                {entry.description && (
                  <MarkdownLiteBlock text={entry.description} className="mt-1 text-sm" />
                )}
              </div>
            )
          })}
        </>
      )

    default:
      return null
  }
}
