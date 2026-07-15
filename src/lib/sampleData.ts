import { createId } from './id'
import type { PersonalInfo, Section } from '../types/resume'

export interface SampleResumeContent {
  personalInfo: PersonalInfo
  sections: Section[]
}

/**
 * A complete, believable example resume (PRD F7, Frontend spec §3.9's
 * "Load an example" offer). Returns fresh ids on every call so loading the
 * example into two different resumes never produces id collisions.
 */
export function createSampleResumeContent(): SampleResumeContent {
  return {
    personalInfo: {
      fullName: 'Alex Johnson',
      jobTitle: 'Product Designer',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Austin, TX',
      website: 'https://alexjohnson.design',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson',
    },
    sections: [
      {
        id: createId(),
        type: 'summary',
        title: 'Summary',
        visible: true,
        entries: [
          {
            id: createId(),
            type: 'summary',
            content:
              'Product designer with **6+ years** of experience crafting user-centered digital products for startups and enterprise teams. Passionate about turning complex problems into simple, elegant interfaces.',
          },
        ],
      },
      {
        id: createId(),
        type: 'experience',
        title: 'Experience',
        visible: true,
        entries: [
          {
            id: createId(),
            type: 'experience',
            role: 'Senior Product Designer',
            company: 'Brightline Software',
            location: 'Austin, TX',
            startDate: '2022-03',
            endDate: null,
            description:
              '- Led end-to-end design for a customer analytics dashboard used by 40,000+ monthly active users\n- Partnered with engineering and product to ship a redesigned onboarding flow, increasing activation by 18%\n- Mentored two junior designers and established the team’s first shared component library',
          },
          {
            id: createId(),
            type: 'experience',
            role: 'Product Designer',
            company: 'Northwind Labs',
            location: 'Remote',
            startDate: '2019-06',
            endDate: '2022-02',
            description:
              '- Designed and shipped 12+ features for a B2B SaaS platform from concept to launch\n- Ran weekly usability testing sessions that directly shaped the product roadmap\n- Created and maintained the design system used across three product teams',
          },
        ],
      },
      {
        id: createId(),
        type: 'education',
        title: 'Education',
        visible: true,
        entries: [
          {
            id: createId(),
            type: 'education',
            institution: 'University of Texas at Austin',
            degree: 'B.F.A. Design',
            fieldOfStudy: 'Visual Communication',
            location: 'Austin, TX',
            startDate: '2015-08',
            endDate: '2019-05',
            description: 'Graduated with honors. Senior thesis on accessible design systems.',
          },
        ],
      },
      {
        id: createId(),
        type: 'skills',
        title: 'Skills',
        visible: true,
        entries: [
          { id: createId(), type: 'skills', name: 'Figma', group: 'Design Tools' },
          { id: createId(), type: 'skills', name: 'Sketch', group: 'Design Tools' },
          { id: createId(), type: 'skills', name: 'Prototyping', group: 'Design Tools' },
          { id: createId(), type: 'skills', name: 'User Research', group: 'Practices' },
          { id: createId(), type: 'skills', name: 'Design Systems', group: 'Practices' },
          { id: createId(), type: 'skills', name: 'HTML/CSS', group: 'Technical' },
        ],
      },
      {
        id: createId(),
        type: 'projects',
        title: 'Projects',
        visible: true,
        entries: [
          {
            id: createId(),
            type: 'projects',
            name: 'Design System Audit Toolkit',
            role: 'Creator',
            url: 'https://github.com/alexjohnson/design-audit',
            startDate: '2023-01',
            endDate: '2023-06',
            description:
              'An open-source toolkit that scans a codebase for inconsistent spacing, color, and typography values against a defined design system.',
            technologies: ['React', 'TypeScript', 'Node.js'],
          },
        ],
      },
      {
        id: createId(),
        type: 'certifications',
        title: 'Certifications',
        visible: true,
        entries: [
          {
            id: createId(),
            type: 'certifications',
            name: 'Certified Usability Analyst (CUA)',
            issuer: 'Human Factors International',
            date: '2021-09',
          },
        ],
      },
      {
        id: createId(),
        type: 'languages',
        title: 'Languages',
        visible: true,
        entries: [
          { id: createId(), type: 'languages', name: 'English', proficiency: 'Native' },
          { id: createId(), type: 'languages', name: 'Spanish', proficiency: 'Conversational' },
        ],
      },
    ],
  }
}
