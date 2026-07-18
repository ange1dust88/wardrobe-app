import { describe, it, expect } from 'vitest'
import {
  computeColorScore,
  computeRoleScore,
  computeSeasonScore,
  computePaletteScore,
  computeStyleScore,
  computePatternScore,
  computeFitScore,
  computeTotalScore,
} from '@/lib/server/domain/match-scoring'
import { deriveColor } from '@/lib/server/domain/item-derivation'
import {
  Fit,
  Formality,
  Pattern,
  SeasonPalette,
  SeasonWear,
  WardrobeRole,
} from '@/lib/server/domain/item-types'
import { makeItem } from '../helpers'

describe('computeColorScore', () => {
  it('two identical neutrals (same brightness) score 8', () => {
    const gray = deriveColor('#808080')
    expect(computeColorScore(gray, gray)).toBe(8)
  })

  it('neutrals far apart in brightness score higher (up to cap 11)', () => {
    const black = deriveColor('#000000')
    const white = deriveColor('#ffffff')
    expect(computeColorScore(black, white)).toBe(11)
  })

  it('never exceeds the color cap of 11', () => {
    const a = deriveColor('#123456')
    const b = deriveColor('#654321')
    const s = computeColorScore(a, b)
    expect(s).toBeLessThanOrEqual(11)
    expect(s).toBeGreaterThanOrEqual(-6)
  })

  it('two vivid saturated colors are penalised', () => {
    const red = deriveColor('#ff0000')
    const blue = deriveColor('#0000ff')
    const bothVivid = computeColorScore(red, blue)
    expect(bothVivid).toBeLessThan(11)
  })
})

describe('computeRoleScore', () => {
  const role = (a: WardrobeRole, c: WardrobeRole) =>
    computeRoleScore(
      makeItem({ wardrobeRole: a }),
      makeItem({ wardrobeRole: c })
    )

  it('pop + pop clashes (-5)', () => {
    expect(role(WardrobeRole.Pop, WardrobeRole.Pop)).toBe(-5)
  })

  it('core + tonal and core + core score 5', () => {
    expect(role(WardrobeRole.Core, WardrobeRole.Tonal)).toBe(5)
    expect(role(WardrobeRole.Tonal, WardrobeRole.Core)).toBe(5)
    expect(role(WardrobeRole.Core, WardrobeRole.Core)).toBe(5)
    expect(role(WardrobeRole.Tonal, WardrobeRole.Tonal)).toBe(5)
  })

  it('a single pop with a non-pop scores 3', () => {
    expect(role(WardrobeRole.Pop, WardrobeRole.Core)).toBe(3)
    expect(role(WardrobeRole.Tonal, WardrobeRole.Pop)).toBe(3)
  })
})

describe('computeSeasonScore', () => {
  const season = (a: SeasonWear[], c: SeasonWear[]) =>
    computeSeasonScore(makeItem({ seasonWear: a }), makeItem({ seasonWear: c }))

  it('scores by overlap count', () => {
    const all = [
      SeasonWear.Spring,
      SeasonWear.Summer,
      SeasonWear.Autumn,
      SeasonWear.Winter,
    ]
    expect(season(all, all)).toBe(5)
    expect(season([SeasonWear.Spring, SeasonWear.Summer], all)).toBe(4)
    expect(season([SeasonWear.Spring], all)).toBe(2)
  })

  it('penalises a large warmth gap with no overlap', () => {
    expect(season([SeasonWear.Summer], [SeasonWear.Winter])).toBe(-5)
  })
})

describe('computePaletteScore', () => {
  it('overlapping palettes score 4 without a user colour type', () => {
    const a = makeItem({ seasonPaletteCompatibility: [SeasonPalette.Winter] })
    const b = makeItem({ seasonPaletteCompatibility: [SeasonPalette.Winter] })
    expect(computePaletteScore(a, b)).toBe(4)
  })

  it('rewards items matching the user colour type', () => {
    const a = makeItem({ seasonPaletteCompatibility: [SeasonPalette.Winter] })
    const b = makeItem({ seasonPaletteCompatibility: [SeasonPalette.Winter] })
    expect(computePaletteScore(a, b, SeasonPalette.Winter)).toBe(5)
  })

  it('penalises a mismatch against the user colour type', () => {
    const a = makeItem({ seasonPaletteCompatibility: [SeasonPalette.Spring] })
    const b = makeItem({ seasonPaletteCompatibility: [SeasonPalette.Spring] })
    expect(computePaletteScore(a, b, SeasonPalette.Winter)).toBe(-2)
  })
})

describe('computeStyleScore', () => {
  const style = (a: Formality, c: Formality) =>
    computeStyleScore(makeItem({ formality: a }), makeItem({ formality: c }))

  it('rewards matching formality and punishes wide gaps', () => {
    expect(style(Formality.Casual, Formality.Casual)).toBe(5)
    expect(style(Formality.Casual, Formality.SmartCasual)).toBe(3)
    expect(style(Formality.Casual, Formality.Formal)).toBe(0)
    expect(style(Formality.Loungewear, Formality.Formal)).toBe(-4)
  })
})

describe('computePatternScore', () => {
  const pat = (a: Pattern, c: Pattern) =>
    computePatternScore(makeItem({ pattern: a }), makeItem({ pattern: c }))

  it('two loud patterns clash', () => {
    expect(pat(Pattern.BoldPattern, Pattern.Graphic)).toBe(-4)
  })

  it('two subtle patterns are okay, plain is best', () => {
    expect(pat(Pattern.SubtlePattern, Pattern.SubtlePattern)).toBe(1)
    expect(pat(Pattern.Solid, Pattern.Solid)).toBe(3)
  })
})

describe('computeFitScore', () => {
  const fit = (a: Fit, c: Fit) =>
    computeFitScore(makeItem({ fit: a }), makeItem({ fit: c }))

  it('same extreme fit is flat, opposite extremes play', () => {
    expect(fit(Fit.Slim, Fit.Slim)).toBe(0)
    expect(fit(Fit.Oversized, Fit.Oversized)).toBe(0)
    expect(fit(Fit.Slim, Fit.Oversized)).toBe(1)
    expect(fit(Fit.Regular, Fit.Regular)).toBe(2)
  })
})

describe('computeTotalScore', () => {
  it('clamps to 0..36 and returns a breakdown', () => {
    const a = makeItem()
    const b = makeItem()
    const { total, breakdown } = computeTotalScore(a, b, {})
    expect(total).toBeGreaterThanOrEqual(0)
    expect(total).toBeLessThanOrEqual(36)
    const sum =
      breakdown.color +
      breakdown.role +
      breakdown.season +
      breakdown.palette +
      breakdown.style +
      breakdown.pattern +
      breakdown.fit
    expect(total).toBe(Math.max(0, Math.min(36, Math.round(sum))))
  })

  it('is deterministic', () => {
    const a = makeItem({ color: deriveColor('#204080') })
    const b = makeItem({ color: deriveColor('#c08040') })
    expect(computeTotalScore(a, b, {})).toEqual(computeTotalScore(a, b, {}))
  })
})
