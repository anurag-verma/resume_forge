import { useResumeStore } from '../../store/useResumeStore'
import { EmptyResumePrompt } from './EmptyResumePrompt'
import { PersonalInfoForm } from './sections/PersonalInfoForm'
import { SectionList } from './SectionList'

export function EditorPanel() {
  const activeResumeId = useResumeStore((state) => state.activeResumeId)

  return (
    <div className="h-full overflow-y-auto bg-paper p-4 md:p-6">
      <PersonalInfoForm resumeId={activeResumeId} />
      <EmptyResumePrompt resumeId={activeResumeId} />
      <SectionList resumeId={activeResumeId} />
    </div>
  )
}
