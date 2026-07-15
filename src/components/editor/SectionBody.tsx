import { CertificationsForm } from './sections/CertificationsForm'
import { CustomSectionForm } from './sections/CustomSectionForm'
import { EducationForm } from './sections/EducationForm'
import { ExperienceForm } from './sections/ExperienceForm'
import { LanguagesForm } from './sections/LanguagesForm'
import { ProjectsForm } from './sections/ProjectsForm'
import { SkillsForm } from './sections/SkillsForm'
import { SummaryForm } from './sections/SummaryForm'
import type { Section } from '../../types/resume'

interface SectionBodyProps {
  resumeId: string
  section: Section
}

export function SectionBody({ resumeId, section }: SectionBodyProps) {
  switch (section.type) {
    case 'summary':
      return <SummaryForm resumeId={resumeId} section={section} />
    case 'experience':
      return <ExperienceForm resumeId={resumeId} section={section} />
    case 'education':
      return <EducationForm resumeId={resumeId} section={section} />
    case 'skills':
      return <SkillsForm resumeId={resumeId} section={section} />
    case 'projects':
      return <ProjectsForm resumeId={resumeId} section={section} />
    case 'certifications':
      return <CertificationsForm resumeId={resumeId} section={section} />
    case 'languages':
      return <LanguagesForm resumeId={resumeId} section={section} />
    case 'custom':
      return <CustomSectionForm resumeId={resumeId} section={section} />
    default:
      return <p className="text-sm text-muted">This section's fields will appear here.</p>
  }
}
