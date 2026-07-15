import { describe, it, expect } from 'vitest'
import { createId } from '../lib/id'
import type {
  AppData,
  CertificationEntry,
  CustomEntry,
  EducationEntry,
  Entry,
  ExperienceEntry,
  LanguageEntry,
  PersonalInfo,
  ProjectEntry,
  Resume,
  Section,
  Settings,
  SkillEntry,
  SummaryEntry,
} from './resume'

describe('resume data model', () => {
  it('type-checks a sample of every entry type', () => {
    const summary: SummaryEntry = {
      id: createId(),
      type: 'summary',
      content: 'Experienced engineer.',
    }

    const experience: ExperienceEntry = {
      id: createId(),
      type: 'experience',
      company: 'Acme Corp',
      role: 'Software Engineer',
      location: 'Remote',
      startDate: '2023-04',
      endDate: null,
      description: '- Built things\n- Shipped things',
    }

    const education: EducationEntry = {
      id: createId(),
      type: 'education',
      institution: 'State University',
      degree: 'B.Sc. Computer Science',
      startDate: '2019-08',
      endDate: '2023-05',
    }

    const skill: SkillEntry = {
      id: createId(),
      type: 'skills',
      name: 'TypeScript',
      group: 'Languages',
    }

    const project: ProjectEntry = {
      id: createId(),
      type: 'projects',
      name: 'ResumeForge',
      description: 'A client-side resume builder.',
      technologies: ['React', 'TypeScript'],
    }

    const certification: CertificationEntry = {
      id: createId(),
      type: 'certifications',
      name: 'Certified Kubernetes Administrator',
      issuer: 'CNCF',
      date: '2024-01',
    }

    const language: LanguageEntry = {
      id: createId(),
      type: 'languages',
      name: 'English',
      proficiency: 'Native',
    }

    const custom: CustomEntry = {
      id: createId(),
      type: 'custom',
      title: 'Volunteer Work',
      description: 'Weekly coding mentor.',
    }

    const entries: Entry[] = [
      summary,
      experience,
      education,
      skill,
      project,
      certification,
      language,
      custom,
    ]

    expect(entries).toHaveLength(8)
  })

  it('type-checks a sample Resume and AppData', () => {
    const personalInfo: PersonalInfo = {
      fullName: 'Jane Doe',
      jobTitle: 'Software Engineer',
      email: 'jane@example.com',
      phone: '+1 555 0100',
      location: 'San Francisco, CA',
    }

    const section: Section = {
      id: createId(),
      type: 'experience',
      title: 'Experience',
      visible: true,
      entries: [],
    }

    const resume: Resume = {
      id: createId(),
      name: 'Software Engineer Resume',
      updatedAt: new Date().toISOString(),
      personalInfo,
      sections: [section],
    }

    const settings: Settings = {
      templateId: 'classic',
      accentColor: '#2456A6',
      fontPairId: 'source-serif-sans',
      fontScale: 'md',
      lineSpacing: 1.4,
      sectionSpacing: 16,
    }

    const appData: AppData = {
      schemaVersion: 1,
      resumes: [resume],
      activeResumeId: resume.id,
      settings: { [resume.id]: settings },
    }

    expect(appData.resumes[0].id).toBe(resume.id)
  })

  it('generates collision-safe ids', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createId()))
    expect(ids.size).toBe(1000)
  })
})
