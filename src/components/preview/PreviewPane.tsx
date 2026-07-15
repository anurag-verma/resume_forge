import { useEffect, useRef, useState, type ReactNode, type WheelEvent } from 'react'
import { PAGE_WIDTH_PX } from '../../lib/pagination'
import { clampZoomPercent, type ZoomLevel } from '../../lib/zoom'
import { PagedDocument } from './PagedDocument'
import { ZoomControls } from './ZoomControls'

const PANE_PADDING_PX = 48

interface PreviewPaneProps {
  children?: ReactNode
}

export function PreviewPane({ children }: PreviewPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState<ZoomLevel>('fit')
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    const measure = () => setContainerWidth(element.clientWidth)
    measure()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const fitScale =
    containerWidth > 0
      ? Math.min(1, (containerWidth - PANE_PADDING_PX) / PAGE_WIDTH_PX)
      : 1
  const scale = zoom === 'fit' ? fitScale : zoom / 100

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    const currentPercent = zoom === 'fit' ? Math.round(fitScale * 100) : zoom
    setZoom(clampZoomPercent(currentPercent - event.deltaY * 0.2))
  }

  return (
    <div className="relative flex h-full flex-col bg-desk">
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex-1 overflow-auto p-6"
      >
        <div
          className="mx-auto w-fit"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          <PagedDocument>
            {children ?? (
              <p className="p-6 text-sm text-muted">
                Preview of your resume; content matches the editor.
              </p>
            )}
          </PagedDocument>
        </div>
      </div>

      <ZoomControls zoom={zoom} onChange={setZoom} />
    </div>
  )
}
