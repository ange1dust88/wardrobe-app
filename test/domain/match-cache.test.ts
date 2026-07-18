import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCachedMatchMap,
  setCachedMatchMap,
  invalidateMatchMap,
} from '@/lib/server/domain/match-cache'
import type { MatchMap } from '@/lib/server/domain/match-cache'

const map: MatchMap = { a: { b: { score: 30, breakdown: {} as never } } }

describe('match-cache', () => {
  beforeEach(() => {
    invalidateMatchMap('u1')
    invalidateMatchMap('u2')
  })

  it('round-trips by user, colour type and allowConflicts', () => {
    setCachedMatchMap('u1', map, 'winter', false)
    expect(getCachedMatchMap('u1', 'winter', false)).toBe(map)
    // different key dimensions miss
    expect(getCachedMatchMap('u1', 'summer', false)).toBeUndefined()
    expect(getCachedMatchMap('u1', 'winter', true)).toBeUndefined()
    expect(getCachedMatchMap('u2', 'winter', false)).toBeUndefined()
  })

  it('invalidate clears only the given user', () => {
    setCachedMatchMap('u1', map)
    setCachedMatchMap('u2', map)
    invalidateMatchMap('u1')
    expect(getCachedMatchMap('u1')).toBeUndefined()
    expect(getCachedMatchMap('u2')).toBe(map)
  })
})
