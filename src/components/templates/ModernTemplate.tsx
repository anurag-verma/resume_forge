import type { CSSProperties } from 'react'
import { getTemplateCssVars } from '../../lib/templateStyles'
import { SectionEntries } from './shared/SectionEntries'
import type { Resume, Section, Settings } from '../../types/resume'

interface ModernTemplateProps {
  resume: Resume
  settings: Settings
}

const SIDEBAR_SECTION_TYPES = new Set(['skills', 'languages'])

/**
 * Modern — two column (68/32, sidebar right), Inter throughout, contemporary
 * tech vibe. Frontend spec §4. Skills and Languages sections always render
 * in the sidebar alongside contact info, regardless of their position in
 * `resume.sections` — the sidebar is a fixed semantic bucket, not a
 * reordering of the section list.
 */
export function ModernTemplate({ resume, settings }: ModernTemplateProps) {
  const cssVars = getTemplateCssVars(settings)
  const visibleSections = resume.sections.filter((section) => section.visible)
  const sidebarSections = visibleSections.filter((section) =>
    SIDEBAR_SECTION_TYPES.has(section.type),
  )
  const mainSections = visibleSections.filter(
    (section) => !SIDEBAR_SECTION_TYPES.has(section.type),
  )

  return (
    <div
      className="text-ink"
      style={
        {
          ...cssVars,
          fontFamily: 'var(--font-body)',
          lineHeight: 'var(--line-height)',
          fontSize: 'var(--font-size-base)',
        } as CSSProperties
      }
    >
      <PersonalInfoHeader resume={resume} />

      <div className="flex">
        <main className="w-[68%] px-[12mm] pb-[10mm]">
          {mainSections.map((section) => (
            <MainSection key={section.id} section={section} />
          ))}
        </main>
        <aside
          className="w-[32%] px-[8mm] pb-[10mm]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 8%, white)' }}
        >
          <ContactBlock resume={resume} />
          {sidebarSections.map((section) => (
            <SidebarSection key={section.id} section={section} />
          ))}
        </aside>
      </div>
    </div>
  )
}

function PersonalInfoHeader({ resume }: { resume: Resume }) {
  const { personalInfo } = resume
  return (
    <header className="break-after-avoid-page px-[12mm] py-[10mm]">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}
      >
        {personalInfo.fullName || 'Your Name'}
      </h1>
      {personalInfo.jobTitle && <p className="mt-0.5 text-base">{personalInfo.jobTitle}</p>}
    </header>
  )
}

function ContactBlock({ resume }: { resume: Resume }) {
  const { personalInfo } = resume
  const contactLines = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean)

  if (contactLines.length === 0) return null

  return (
    <div className="break-inside-avoid mb-4">
      <h2
        className="break-after-avoid-page text-sm font-semibold uppercase tracking-wide"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}
      >
        Contact
      </h2>
      <div className="mt-2 flex flex-col gap-1 text-sm">
        {contactLines.map((line) => (
          <p key={line} className="break-all">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

function MainSection({ section }: { section: Section }) {
  return (
    <section className="break-inside-avoid" style={{ marginTop: 'var(--section-spacing)' }}>
      <h2
        className="break-after-avoid-page text-lg font-semibold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}
      >
        {section.title}
      </h2>
      <div className="mt-2 flex flex-col gap-3">
        <SectionEntries section={section} />
      </div>
    </section>
  )
}

function SidebarSection({ section }: { section: Section }) {
  return (
    <section className="break-inside-avoid mb-4">
      <h2
        className="break-after-avoid-page text-sm font-semibold uppercase tracking-wide"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}
      >
        {section.title}
      </h2>
      <div className="mt-2 flex flex-col gap-2">
        <SectionEntries section={section} />
      </div>
    </section>
  )
}
