import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { ReactNode } from 'react'
import { computeReorderedIds } from '../../../lib/reorder'

interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (orderedIds: string[]) => void
  children: (item: T) => ReactNode
  className?: string
}

/**
 * Shared drag-and-drop list: mouse (pointer) + keyboard reordering via
 * dnd-kit, used for both the section list and every entry-card list.
 * `onReorder` receives the new id order; callers pass it straight to the
 * matching `reorderSections`/`reorderEntries` store action.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const reordered = computeReorderedIds(items, String(active.id), String(over.id))
    if (reordered) onReorder(reordered)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>{items.map((item) => children(item))}</div>
      </SortableContext>
    </DndContext>
  )
}
