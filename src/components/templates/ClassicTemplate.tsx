import type { CSSProperties } from 'react'
import { getTemplateCssVars } from '../../lib/templateStyles'
import { SectionEntries } from './shared/SectionEntries'
import type { Resume, Settings } from '../../types/resume'

interface ClassicTemplateProps {
  resume: Resume
  settings: Settings
}

/**
 * Classic — single column, serif headings, ATS-safest. Frontend spec §4.
 * Heading hierarchy: h1 (name) → h2 (sections) → h3 (entries). `break-inside`
 * and `break-after` utilities only take visible effect when the browser
 * actually paginates for print (`@page` CSS, RB-030) — the on-screen preview
 * (RB-020) is a continuous scroll, so they're inert there but correct here.
 */
export function ClassicTemplate({ resume, settings }: ClassicTemplateProps) {
  const cssVars = getTemplateCssVars(settings)
  const visibleSections = resume.sections.filter((section) => section.visible)

  return (
    <div
      className="px-[12mm] py-[12mm] text-ink"
      style={
        {
          ...cssVars,
          fontFamily: 'var(--font-body)',
          lineHeight: 'var(--line-height)',
          fontSize: 'var(--font-size-base)',
        } as CSSProperties
      }
    >
      <PersonalInfoBlock resume={resume} />

      {visibleSections.map((section) => (
        <section
          key={section.id}
          className="break-inside-avoid"
          style={{ marginTop: 'var(--section-spacing)' }}
        >
          <h2
            className="break-after-avoid-page border-b pb-1 text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading)', borderColor: 'var(--accent)' }}
          >
            {section.title}
          </h2>
          <div className="mt-2 flex flex-col gap-3">
            <SectionEntries section={section} />
          </div>
        </section>
      ))}
    </div>
  )
}

function PersonalInfoBlock({ resume }: { resume: Resume }) {
  const { personalInfo } = resume
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean)

  return (
    <header
      className="break-after-avoid-page border-b-2 pb-3"
      style={{ borderColor: 'var(--accent)' }}
    >
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}
      >
        {personalInfo.fullName || 'Your Name'}
      </h1>
      {personalInfo.jobTitle && <p className="mt-0.5 text-base">{personalInfo.jobTitle}</p>}
      {contactParts.length > 0 && (
        <p className="mt-1 text-sm text-muted">{contactParts.join(' · ')}</p>
      )}
    </header>
  )
}
