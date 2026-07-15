import type { Resume, Settings } from '../../types/resume'

export const testSettings: Settings = {
  templateId: 'classic',
  accentColor: '#2456A6',
  fontPairId: 'classic-serif',
  fontScale: 'md',
  lineSpacing: 1.4,
  sectionSpacing: 16,
}

/** One entry of every section type, plus a hidden section — used to verify
 * every template renders the full data model correctly and consistently. */
export const fullTestResume: Resume = {
  id: 'resume-1',
  name: 'Software Engineer Resume',
  updatedAt: new Date().toISOString(),
  personalInfo: {
    fullName: 'Jane Doe',
    jobTitle: 'Senior Software Engineer',
    email: 'jane@example.com',
    phone: '+1 555 0100',
    location: 'San Francisco, CA',
    website: 'https://janedoe.com',
    linkedin: 'linkedin.com/in/janedoe',
    github: 'github.com/janedoe',
  },
  sections: [
    {
      id: 'summary',
      type: 'summary',
      title: 'Summary',
      visible: true,
      entries: [
        {
          id: 'summary-1',
          type: 'summary',
          content: 'Backend engineer with **6 years** of experience.',
        },
      ],
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Experience',
      visible: true,
      entries: [
        {
          id: 'exp-1',
          type: 'experience',
          company: 'Acme Corp',
          role: 'Senior Software Engineer',
          location: 'Remote',
          startDate: '2023-04',
          endDate: null,
          description: 'Led a team of 4 engineers.',
        },
      ],
    },
    {
      id: 'education',
      type: 'education',
      title: 'Education',
      visible: true,
      entries: [
        {
          id: 'edu-1',
          type: 'education',
          institution: 'State University',
          degree: 'B.Sc. Computer Science',
          fieldOfStudy: 'Computer Science',
          location: 'Boston, MA',
          startDate: '2015-08',
          endDate: '2019-05',
          description: 'Graduated with honors.',
        },
      ],
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      visible: true,
      entries: [
        { id: 'skill-1', type: 'skills', name: 'TypeScript', group: 'Languages' },
        { id: 'skill-2', type: 'skills', name: 'React', group: 'Languages' },
        { id: 'skill-3', type: 'skills', name: 'Git' },
      ],
    },
    {
      id: 'projects',
      type: 'projects',
      title: 'Projects',
      visible: true,
      entries: [
        {
          id: 'proj-1',
          type: 'projects',
          name: 'ResumeForge',
          role: 'Creator',
          url: 'https://example.com',
          startDate: '2026-01',
          endDate: null,
          description: 'A free, client-side resume builder.',
          technologies: ['React', 'TypeScript'],
        },
      ],
    },
    {
      id: 'certifications',
      type: 'certifications',
      title: 'Certifications',
      visible: true,
      entries: [
        {
          id: 'cert-1',
          type: 'certifications',
          name: 'Certified Kubernetes Administrator',
          issuer: 'CNCF',
          date: '2024-01',
          credentialUrl: 'https://example.com/credential',
        },
      ],
    },
    {
      id: 'languages',
      type: 'languages',
      title: 'Languages',
      visible: true,
      entries: [{ id: 'lang-1', type: 'languages', name: 'French', proficiency: 'Fluent' }],
    },
    {
      id: 'custom',
      type: 'custom',
      title: 'Volunteering',
      visible: true,
      entries: [
        {
          id: 'custom-1',
          type: 'custom',
          title: 'Weekly Coding Mentor',
          subtitle: 'Local Coding Club',
          date: '2022 – Present',
          description: 'Mentors 5 students weekly.',
        },
      ],
    },
    {
      id: 'hidden-section',
      type: 'custom',
      title: 'Hidden Section',
      visible: false,
      entries: [
        { id: 'hidden-1', type: 'custom', title: 'Should not render', description: '' },
      ],
    },
  ],
}
