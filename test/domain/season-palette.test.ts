import { describe, it, expect } from 'vitest'
import { classifySeasons } from '@/lib/server/domain/season-palette'

const SEASONS = ['spring', 'summer', 'autumn', 'winter']

describe('classifySeasons', () => {
  it('returns only valid season ids', () => {
    const result = classifySeasons('#3a7d44')
    expect(Array.isArray(result)).toBe(true)
    for (const s of result) expect(SEASONS).toContain(s)
  })

  it('is deterministic', () => {
    expect(classifySeasons('#c94f3d')).toEqual(classifySeasons('#c94f3d'))
  })

  it('matches an exact spring swatch to spring', () => {
    expect(classifySeasons('#FFE23B')).toContain('spring')
  })

  it('does not return the universal placeholder', () => {
    expect(classifySeasons('#204080')).not.toContain('universal')
  })
})
