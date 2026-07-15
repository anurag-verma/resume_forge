import { arrayMove } from '@dnd-kit/sortable'

/**
 * Given the current items and a drag-end (active, over) id pair, returns the
 * new id order, or null if nothing should change (dropped on itself, or
 * either id can't be found — e.g. the item was removed mid-drag).
 */
export function computeReorderedIds<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string,
): string[] | null {
  if (activeId === overId) return null

  const oldIndex = items.findIndex((item) => item.id === activeId)
  const newIndex = items.findIndex((item) => item.id === overId)
  if (oldIndex === -1 || newIndex === -1) return null

  return arrayMove(items, oldIndex, newIndex).map((item) => item.id)
}
