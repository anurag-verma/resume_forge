import { describe, it, expect } from 'vitest'
import { computeReorderedIds } from './reorder'

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

describe('computeReorderedIds', () => {
  it('moves an item forward', () => {
    expect(computeReorderedIds(items, 'a', 'c')).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves an item backward', () => {
    expect(computeReorderedIds(items, 'd', 'b')).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns null when dropped on itself', () => {
    expect(computeReorderedIds(items, 'b', 'b')).toBeNull()
  })

  it('returns null when the active id is unknown', () => {
    expect(computeReorderedIds(items, 'missing', 'b')).toBeNull()
  })

  it('returns null when the over id is unknown', () => {
    expect(computeReorderedIds(items, 'a', 'missing')).toBeNull()
  })

  it('is a no-op reorder when moving to the same adjacent position produces the same order', () => {
    expect(computeReorderedIds(items, 'a', 'a')).toBeNull()
  })
})
