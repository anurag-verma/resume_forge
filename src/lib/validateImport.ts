import type {
  CertificationEntry,
  EducationEntry,
  Entry,
  ExperienceEntry,
  LanguageEntry,
  PersonalInfo,
  ProjectEntry,
  Resume,
  Section,
  SectionType,
  Settings,
  SkillEntry,
  SummaryEntry,
} from '../types/resume'

export const MAX_IMPORT_FILE_SIZE_BYTES = 2 * 1024 * 1024

export interface AppDataImport {
  kind: 'app-data'
  schemaVersion: number
  resumes: Resume[]
  activeResumeId: string
  settings: Record<string, Settings>
}

export interface SingleResumeImport {
  kind: 'single-resume'
  schemaVersion: number
  resume: Resume
  settings: Settings
}

export type ValidatedImport = AppDataImport | SingleResumeImport

export type ImportResult = { data: ValidatedImport } | { error: string }

const SECTION_TYPES: SectionType[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'custom',
]
const TEMPLATE_IDS: Settings['templateId'][] = ['classic', 'modern', 'minimal']
const FONT_SCALES: Settings['fontScale'][] = ['sm', 'md', 'lg']

// ---- primitive guards -------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function isString(value: unknown): value is string {
  return typeof value === 'string'
}
function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string'
}
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
function isOptionalStringArray(value: unknown): value is string[] | undefined {
  return value === undefined || (Array.isArray(value) && value.every(isString))
}
function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}
function isOptionalStringOrNull(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string'
}

// ---- field-level validators --------------------------------------------
// Every validator below reads only the fields it names off the raw input
// and builds a brand-new object from them — anything else on the input
// (unknown/extra keys, prototype-pollution attempts, etc.) is never copied
// through. This is what "strip unknown keys" means in practice (Security
// doc §4.1/§4.4): the output object simply never has a way to acquire a key
// we didn't explicitly ask for.

function validatePersonalInfo(value: unknown): PersonalInfo | null {
  if (!isPlainObject(value)) return null
  const { fullName, jobTitle, email, phone, location, website, linkedin, github } = value
  if (
    !isString(fullName) ||
    !isString(jobTitle) ||
    !isString(email) ||
    !isString(phone) ||
    !isString(location)
  ) {
    return null
  }
  if (!isOptionalString(website) || !isOptionalString(linkedin) || !isOptionalString(github)) {
    return null
  }

  const result: PersonalInfo = { fullName, jobTitle, email, phone, location }
  if (website !== undefined) result.website = website
  if (linkedin !== undefined) result.linkedin = linkedin
  if (github !== undefined) result.github = github
  return result
}

function validateSummaryEntry(value: Record<string, unknown>): SummaryEntry | null {
  const { id, content } = value
  if (!isString(id) || !isString(content)) return null
  return { id, type: 'summary', content }
}

function validateExperienceEntry(value: Record<string, unknown>): ExperienceEntry | null {
  const { id, company, role, location, startDate, endDate, description } = value
  if (
    !isString(id) ||
    !isString(company) ||
    !isString(role) ||
    !isString(startDate) ||
    !isString(description)
  ) {
    return null
  }
  if (!isOptionalString(location)) return null
  if (!isStringOrNull(endDate)) return null

  const entry: ExperienceEntry = {
    id,
    type: 'experience',
    company,
    role,
    startDate,
    endDate: endDate ?? null,
    description,
  }
  if (location !== undefined) entry.location = location
  return entry
}

function validateEducationEntry(value: Record<string, unknown>): EducationEntry | null {
  const { id, institution, degree, fieldOfStudy, location, startDate, endDate, description } =
    value
  if (!isString(id) || !isString(institution) || !isString(degree) || !isString(startDate)) {
    return null
  }
  if (!isOptionalString(fieldOfStudy) || !isOptionalString(location)) return null
  if (!isStringOrNull(endDate)) return null
  if (!isOptionalString(description)) return null

  const entry: EducationEntry = {
    id,
    type: 'education',
    institution,
    degree,
    startDate,
    endDate: endDate ?? null,
  }
  if (fieldOfStudy !== undefined) entry.fieldOfStudy = fieldOfStudy
  if (location !== undefined) entry.location = location
  if (description !== undefined) entry.description = description
  return entry
}

function validateSkillEntry(value: Record<string, unknown>): SkillEntry | null {
  const { id, name, group } = value
  if (!isString(id) || !isString(name)) return null
  if (!isOptionalString(group)) return null

  const entry: SkillEntry = { id, type: 'skills', name }
  if (group !== undefined) entry.group = group
  return entry
}

function validateProjectEntry(value: Record<string, unknown>): ProjectEntry | null {
  const { id, name, role, url, startDate, endDate, description, technologies } = value
  if (!isString(id) || !isString(name) || !isString(description)) return null
  if (!isOptionalString(role) || !isOptionalString(url) || !isOptionalString(startDate)) {
    return null
  }
  if (!isOptionalStringOrNull(endDate)) return null
  if (!isOptionalStringArray(technologies)) return null

  const entry: ProjectEntry = { id, type: 'projects', name, description }
  if (role !== undefined) entry.role = role
  if (url !== undefined) entry.url = url
  if (startDate !== undefined) entry.startDate = startDate
  if (endDate !== undefined) entry.endDate = endDate
  if (technologies !== undefined) entry.technologies = technologies
  return entry
}

function validateCertificationEntry(value: Record<string, unknown>): CertificationEntry | null {
  const { id, name, issuer, date, credentialUrl } = value
  if (!isString(id) || !isString(name) || !isString(issuer) || !isString(date)) return null
  if (!isOptionalString(credentialUrl)) return null

  const entry: CertificationEntry = { id, type: 'certifications', name, issuer, date }
  if (credentialUrl !== undefined) entry.credentialUrl = credentialUrl
  return entry
}

function validateLanguageEntry(value: Record<string, unknown>): LanguageEntry | null {
  const { id, name, proficiency } = value
  if (!isString(id) || !isString(name) || !isString(proficiency)) return null
  return { id, type: 'languages', name, proficiency }
}

function validateCustomEntry(value: Record<string, unknown>) {
  const { id, title, subtitle, date, description } = value
  if (!isString(id) || !isString(title) || !isString(description)) return null
  if (!isOptionalString(subtitle) || !isOptionalString(date)) return null

  const entry: Entry = { id, type: 'custom', title, description }
  if (subtitle !== undefined) entry.subtitle = subtitle
  if (date !== undefined) entry.date = date
  return entry
}

function validateEntry(value: unknown): Entry | null {
  if (!isPlainObject(value)) return null
  switch (value.type) {
    case 'summary':
      return validateSummaryEntry(value)
    case 'experience':
      return validateExperienceEntry(value)
    case 'education':
      return validateEducationEntry(value)
    case 'skills':
      return validateSkillEntry(value)
    case 'projects':
      return validateProjectEntry(value)
    case 'certifications':
      return validateCertificationEntry(value)
    case 'languages':
      return validateLanguageEntry(value)
    case 'custom':
      return validateCustomEntry(value)
    default:
      return null
  }
}

function validateSection(value: unknown): Section | null {
  if (!isPlainObject(value)) return null
  const { id, type, title, visible, entries } = value
  if (!isString(id) || !isString(title) || !isBoolean(visible)) return null
  if (typeof type !== 'string' || !SECTION_TYPES.includes(type as SectionType)) return null
  if (!Array.isArray(entries)) return null

  const validatedEntries: Entry[] = []
  for (const rawEntry of entries) {
    const entry = validateEntry(rawEntry)
    if (!entry) return null
    validatedEntries.push(entry)
  }

  return { id, type: type as SectionType, title, visible, entries: validatedEntries }
}

function validateResume(value: unknown): Resume | null {
  if (!isPlainObject(value)) return null
  const { id, name, updatedAt, personalInfo, sections } = value
  if (!isString(id) || !isString(name) || !isString(updatedAt)) return null

  const validPersonalInfo = validatePersonalInfo(personalInfo)
  if (!validPersonalInfo) return null

  if (!Array.isArray(sections)) return null
  const validatedSections: Section[] = []
  for (const rawSection of sections) {
    const section = validateSection(rawSection)
    if (!section) return null
    validatedSections.push(section)
  }

  return { id, name, updatedAt, personalInfo: validPersonalInfo, sections: validatedSections }
}

function validateSettings(value: unknown): Settings | null {
  if (!isPlainObject(value)) return null
  const { templateId, accentColor, fontPairId, fontScale, lineSpacing, sectionSpacing } = value
  if (typeof templateId !== 'string' || !TEMPLATE_IDS.includes(templateId as never)) return null
  if (!isString(accentColor) || !isString(fontPairId)) return null
  if (typeof fontScale !== 'string' || !FONT_SCALES.includes(fontScale as never)) return null
  if (!isFiniteNumber(lineSpacing) || !isFiniteNumber(sectionSpacing)) return null

  return {
    templateId: templateId as Settings['templateId'],
    accentColor,
    fontPairId,
    fontScale: fontScale as Settings['fontScale'],
    lineSpacing,
    sectionSpacing,
  }
}

// ---- top-level payload validation ---------------------------------------

/** Validates a parsed JSON value against the ResumeForge export schema.
 *  Never throws — any structural problem returns a descriptive `error`
 *  string instead, per Security doc §4.4 (treat imported files as
 *  untrusted input). */
export function validateImportPayload(raw: unknown): ImportResult {
  if (!isPlainObject(raw)) {
    return { error: 'This file is not a valid ResumeForge export.' }
  }
  if (!isFiniteNumber(raw.schemaVersion)) {
    return { error: 'This file is missing a valid schema version.' }
  }

  if (raw.kind === 'single-resume') {
    const resume = validateResume(raw.resume)
    if (!resume) return { error: "This file's resume data is invalid or corrupted." }
    const settings = validateSettings(raw.settings)
    if (!settings) return { error: "This file's settings data is invalid or corrupted." }
    return {
      data: { kind: 'single-resume', schemaVersion: raw.schemaVersion, resume, settings },
    }
  }

  if (raw.kind === 'app-data') {
    if (!Array.isArray(raw.resumes)) {
      return { error: 'This file is missing resume data.' }
    }
    const resumes: Resume[] = []
    for (const rawResume of raw.resumes) {
      const resume = validateResume(rawResume)
      if (!resume) return { error: 'One or more resumes in this file are invalid or corrupted.' }
      resumes.push(resume)
    }
    if (resumes.length === 0) {
      return { error: 'This file contains no resumes.' }
    }

    if (!isPlainObject(raw.settings)) {
      return { error: "This file's settings data is invalid or corrupted." }
    }
    const settings: Record<string, Settings> = {}
    for (const [resumeId, rawSettings] of Object.entries(raw.settings)) {
      const validated = validateSettings(rawSettings)
      if (!validated) return { error: "This file's settings data is invalid or corrupted." }
      settings[resumeId] = validated
    }

    const activeResumeId =
      isString(raw.activeResumeId) && resumes.some((resume) => resume.id === raw.activeResumeId)
        ? raw.activeResumeId
        : resumes[0].id

    return {
      data: { kind: 'app-data', schemaVersion: raw.schemaVersion, resumes, activeResumeId, settings },
    }
  }

  return { error: 'This file is not a recognized ResumeForge export.' }
}

/** Reads a File (size-limited, Security doc §4.4), parses it as JSON inside
 *  a try/catch (never `eval`), and validates the result. */
export async function readAndValidateImportFile(file: File): Promise<ImportResult> {
  if (file.size === 0) {
    return { error: 'This file is empty.' }
  }
  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return { error: 'This file is too large (2 MB maximum).' }
  }

  let text: string
  try {
    text = await file.text()
  } catch {
    return { error: "This file couldn't be read." }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }

  return validateImportPayload(parsed)
}
