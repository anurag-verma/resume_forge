import { createId } from './id'
import type { PersonalInfo, Resume, Settings } from '../types/resume'

export function createBlankPersonalInfo(): PersonalInfo {
  return {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
  }
}

export function createBlankResume(name = 'My Resume'): Resume {
  return {
    id: createId(),
    name,
    updatedAt: new Date().toISOString(),
    personalInfo: createBlankPersonalInfo(),
    sections: [],
  }
}

export const DEFAULT_SETTINGS: Settings = {
  templateId: 'classic',
  accentColor: '#2456A6',
  fontPairId: 'classic-serif',
  fontScale: 'md',
  lineSpacing: 1.4,
  sectionSpacing: 16,
}
