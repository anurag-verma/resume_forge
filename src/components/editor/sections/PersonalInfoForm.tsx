import { useMemo } from 'react'
import { useResumeStore } from '../../../store/useResumeStore'
import { TextField } from '../../ui/TextField'
import type { PersonalInfo } from '../../../types/resume'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface PersonalInfoFormProps {
  resumeId: string
}

export function PersonalInfoForm({ resumeId }: PersonalInfoFormProps) {
  const personalInfo = useResumeStore((state) =>
    state.resumes.find((resume) => resume.id === resumeId),
  )?.personalInfo
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo)

  const emailWarning = useMemo(() => {
    if (!personalInfo?.email) return undefined
    return EMAIL_PATTERN.test(personalInfo.email)
      ? undefined
      : "This doesn't look like a valid email address."
  }, [personalInfo?.email])

  if (!personalInfo) return null

  const set = (patch: Partial<PersonalInfo>) => updatePersonalInfo(resumeId, patch)

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-subtle">
      <h2 className="text-base font-semibold text-ink">Personal Info</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          id="fullName"
          label="Full Name"
          value={personalInfo.fullName}
          onChange={(value) => set({ fullName: value })}
          placeholder="Jane Doe"
        />
        <TextField
          id="jobTitle"
          label="Job Title"
          value={personalInfo.jobTitle}
          onChange={(value) => set({ jobTitle: value })}
          placeholder="Software Engineer"
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          value={personalInfo.email}
          onChange={(value) => set({ email: value })}
          placeholder="jane@example.com"
          error={emailWarning}
        />
        <TextField
          id="phone"
          label="Phone"
          type="tel"
          value={personalInfo.phone}
          onChange={(value) => set({ phone: value })}
          placeholder="+1 555 0100"
        />
        <TextField
          id="location"
          label="Location"
          value={personalInfo.location}
          onChange={(value) => set({ location: value })}
          placeholder="San Francisco, CA"
        />
        <TextField
          id="website"
          label="Website"
          type="url"
          value={personalInfo.website ?? ''}
          onChange={(value) => set({ website: value })}
          placeholder="https://janedoe.com"
        />
        <TextField
          id="linkedin"
          label="LinkedIn"
          value={personalInfo.linkedin ?? ''}
          onChange={(value) => set({ linkedin: value })}
          placeholder="linkedin.com/in/janedoe"
        />
        <TextField
          id="github"
          label="GitHub"
          value={personalInfo.github ?? ''}
          onChange={(value) => set({ github: value })}
          placeholder="github.com/janedoe"
        />
      </div>
    </div>
  )
}
