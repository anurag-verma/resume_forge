import type { CSSProperties } from 'react'
import { getTemplateCssVars } from '../../lib/templateStyles'
import { SectionEntries } from './shared/SectionEntries'
import type { Resume, Settings } from '../../types/resume'

interface MinimalTemplateProps {
  resume: Resume
  settings: Settings
}

/**
 * Minimal — single column, wide margins, Spectral headings / Inter body,
 * "elegant whitespace" (Frontend spec §4). Accent color is used in exactly
 * one place: the underline beneath the name. Section/entry headings stay
 * plain ink — unlike Classic (thin accent rules everywhere) or Modern
 * (accent heading color + sidebar tint) — and rely on generous spacing
 * rather than color or rules to separate content.
 */
export function MinimalTemplate({ resume, settings }: MinimalTemplateProps) {
  const cssVars = getTemplateCssVars(settings)
  const visibleSections = resume.sections.filter((section) => section.visible)

  return (
    <div
      className="px-[20mm] py-[20mm] text-ink"
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
          style={{ marginTop: 'calc(var(--section-spacing) * 1.5)' }}
        >
          <h2
            className="break-after-avoid-page text-base font-semibold uppercase tracking-wide"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {section.title}
          </h2>
          <div className="mt-3 flex flex-col gap-3">
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
    <header className="break-after-avoid-page">
      <h1
        className="inline-block border-b-2 pb-1 text-2xl font-semibold"
        style={{ fontFamily: 'var(--font-heading)', borderColor: 'var(--accent)' }}
      >
        {personalInfo.fullName || 'Your Name'}
      </h1>
      {personalInfo.jobTitle && <p className="mt-2 text-base">{personalInfo.jobTitle}</p>}
      {contactParts.length > 0 && (
        <p className="mt-1 text-sm text-muted">{contactParts.join(' · ')}</p>
      )}
    </header>
  )
}
