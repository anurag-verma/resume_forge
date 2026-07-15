import { useState } from 'react'
import { EditorPanel } from './components/editor/EditorPanel'
import { PreviewPane } from './components/preview/PreviewPane'
import { ResumeDocument } from './components/preview/ResumeDocument'
import { Toolbar } from './components/toolbar/Toolbar'
import { Footer } from './components/ui/Footer'
import { MobileTabBar, type MobileView } from './components/ui/MobileTabBar'
import { useResumeStore } from './store/useResumeStore'
import { useSettingsStore } from './store/useSettingsStore'

function App() {
  const [mobileView, setMobileView] = useState<MobileView>('edit')
  const activeResumeId = useResumeStore((state) => state.activeResumeId)
  const resume = useResumeStore((state) =>
    state.resumes.find((candidate) => candidate.id === activeResumeId),
  )
  const settings = useSettingsStore((state) => state.getSettings(activeResumeId))

  return (
    <>
      <div className="flex h-screen flex-col bg-paper text-ink print:hidden">
        <Toolbar />
        <main className="flex flex-1 overflow-hidden">
          <section
            className={`${mobileView === 'edit' ? 'block' : 'hidden'} w-full md:block md:w-[45%] lg:w-2/5 lg:min-w-[380px] lg:max-w-[560px]`}
          >
            <EditorPanel />
          </section>
          <section
            className={`${mobileView === 'preview' ? 'block' : 'hidden'} w-full md:block md:w-[55%] lg:w-3/5`}
          >
            <PreviewPane>
              {resume && <ResumeDocument resume={resume} settings={settings} />}
            </PreviewPane>
          </section>
        </main>
        <MobileTabBar active={mobileView} onChange={setMobileView} />
        <Footer />
      </div>

      {/* Print-only: the real, unscaled resume, with no preview chrome
          (zoom controls, dashed page-break indicators, desk background). */}
      <div className="hidden print:block">
        {resume && <ResumeDocument resume={resume} settings={settings} />}
      </div>
    </>
  )
}

export default App
