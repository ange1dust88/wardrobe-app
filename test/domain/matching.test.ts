import { describe, it, expect } from 'vitest'
import {
  buildMatchMap,
  buildPreview,
  parseColorType,
} from '@/lib/server/domain/matching'
import { deriveColor } from '@/lib/server/domain/item-derivation'
import {
  Category,
  Pattern,
  SeasonPalette,
  SeasonWear,
} from '@/lib/server/domain/item-types'
import { makeItem } from '../helpers'

describe('parseColorType', () => {
  it('accepts the four seasons', () => {
    expect(parseColorType('winter')).toBe(SeasonPalette.Winter)
    expect(parseColorType('spring')).toBe(SeasonPalette.Spring)
  })

  it('rejects universal, unknown and null', () => {
    expect(parseColorType('universal')).toBeUndefined()
    expect(parseColorType('bogus')).toBeUndefined()
    expect(parseColorType(null)).toBeUndefined()
  })
})

describe('buildMatchMap', () => {
  it('scores every allowed pair and excludes self', () => {
    const top = makeItem({ id: 'top', category: Category.Top })
    const bottom = makeItem({ id: 'bottom', category: Category.Bottom })
    const map = buildMatchMap([top, bottom])

    expect(Object.keys(map).sort()).toEqual(['bottom', 'top'])
    expect(map.top).not.toHaveProperty('top')
    expect(map.top.bottom).toHaveProperty('score')
    expect(map.top.bottom).toHaveProperty('breakdown')
    expect(map.bottom.top.score).toBe(map.top.bottom.score)
  })

  it('drops conflicting categories (top + dress) unless allowed', () => {
    const top = makeItem({ id: 'top', category: Category.Top })
    const dress = makeItem({ id: 'dress', category: Category.Dress })

    const strict = buildMatchMap([top, dress])
    expect(strict.top.dress).toBeUndefined()
    expect(strict.dress.top).toBeUndefined()

    const loose = buildMatchMap([top, dress], undefined, true)
    expect(loose.top.dress).toHaveProperty('score')
  })

  it('same-category stacking follows the stack policy', () => {
    const shoesA = makeItem({ id: 'a', category: Category.Shoes })
    const shoesB = makeItem({ id: 'b', category: Category.Shoes })
    // shoes do not stack
    expect(buildMatchMap([shoesA, shoesB]).a.b).toBeUndefined()

    const topA = makeItem({ id: 'ta', category: Category.Top })
    const topB = makeItem({ id: 'tb', category: Category.Top })
    // tops layer
    expect(buildMatchMap([topA, topB]).ta.tb).toHaveProperty('score')
  })
})

describe('buildPreview', () => {
  it('summarises a virtual item against the wardrobe', () => {
    const items = [
      makeItem({ id: 'a', category: Category.Bottom }),
      makeItem({ id: 'b', category: Category.Shoes }),
      makeItem({ id: 'c', category: Category.Dress }),
    ]
    const preview = buildPreview(items, {
      category: Category.Top,
      hex: '#3355aa',
      pattern: Pattern.Solid,
      seasonWear: [SeasonWear.Spring, SeasonWear.Summer],
    })

    expect(preview.wardrobeSize).toBe(3)
    expect(preview.results.length).toBeGreaterThan(0)
    // results are sorted by score descending
    const scores = preview.results.map(r => r.score)
    expect([...scores].sort((a, b) => b - a)).toEqual(scores)
    // byCategory covers all seven categories
    expect(preview.byCategory).toHaveLength(7)
    expect(preview.matchCount).toBeLessThanOrEqual(preview.results.length)
  })

  it('excludes the excludeId item from the pool', () => {
    const items = [
      makeItem({ id: 'keep', category: Category.Bottom }),
      makeItem({ id: 'drop', category: Category.Shoes }),
    ]
    const preview = buildPreview(items, {
      category: Category.Top,
      hex: '#222222',
      pattern: Pattern.Solid,
      seasonWear: [SeasonWear.Winter],
      excludeId: 'drop',
    })
    expect(preview.wardrobeSize).toBe(1)
    expect(preview.results.map(r => r.id)).not.toContain('drop')
  })

  it('accent colour influences the derived virtual item', () => {
    const items = [makeItem({ id: 'a', category: Category.Bottom })]
    const withAccent = buildPreview(items, {
      category: Category.Top,
      hex: '#808080',
      accentHex: '#ff2200',
      pattern: Pattern.Solid,
      seasonWear: [SeasonWear.Spring],
    })
    expect(withAccent.results).toHaveLength(1)
    expect(deriveColor('#ff2200').isNeutral).toBe(false)
  })
})
