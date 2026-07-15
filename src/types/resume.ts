export interface PersonalInfo {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  website?: string
  linkedin?: string
  github?: string
}

export type SectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'custom'

interface BaseEntry {
  id: string
}

export interface SummaryEntry extends BaseEntry {
  type: 'summary'
  content: string // markdown-lite
}

export interface ExperienceEntry extends BaseEntry {
  type: 'experience'
  company: string
  role: string
  location?: string
  startDate: string // "2023-04"
  endDate: string | null // null = Present
  description: string // markdown-lite
}

export interface EducationEntry extends BaseEntry {
  type: 'education'
  institution: string
  degree: string
  fieldOfStudy?: string
  location?: string
  startDate: string
  endDate: string | null
  description?: string // markdown-lite
}

export interface SkillEntry extends BaseEntry {
  type: 'skills'
  name: string
  group?: string // optional named grouping, e.g. "Languages" / "Tools"
}

export interface ProjectEntry extends BaseEntry {
  type: 'projects'
  name: string
  role?: string
  url?: string
  startDate?: string
  endDate?: string | null
  description: string // markdown-lite
  technologies?: string[]
}

export interface CertificationEntry extends BaseEntry {
  type: 'certifications'
  name: string
  issuer: string
  date: string
  credentialUrl?: string
}

export interface LanguageEntry extends BaseEntry {
  type: 'languages'
  name: string
  proficiency: string // e.g. "Native", "Fluent", "Conversational"
}

export interface CustomEntry extends BaseEntry {
  type: 'custom'
  title: string
  subtitle?: string
  date?: string
  description: string // markdown-lite
}

export type Entry =
  | SummaryEntry
  | ExperienceEntry
  | EducationEntry
  | SkillEntry
  | ProjectEntry
  | CertificationEntry
  | LanguageEntry
  | CustomEntry

export interface Section {
  id: string
  type: SectionType
  title: string // user-editable heading
  visible: boolean
  entries: Entry[]
}

export interface Resume {
  id: string
  name: string // "Software Engineer Resume"
  updatedAt: string // ISO date
  personalInfo: PersonalInfo
  sections: Section[] // ordered array = section order
}

export interface Settings {
  templateId: 'classic' | 'modern' | 'minimal'
  accentColor: string // hex
  fontPairId: string
  fontScale: 'sm' | 'md' | 'lg'
  lineSpacing: number // 1.0-1.6
  sectionSpacing: number
}

export interface AppData {
  schemaVersion: number // for future migrations
  resumes: Resume[]
  activeResumeId: string
  settings: Record<string, Settings> // per-resume settings
}
