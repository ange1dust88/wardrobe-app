import { describe, it, expect } from 'vitest'
import {
  deriveColor,
  deriveFormality,
  deriveItemData,
} from '@/lib/server/domain/item-derivation'
import {
  Brightness,
  Category,
  Formality,
  Saturation,
  Temperature,
  WardrobeRole,
} from '@/lib/server/domain/item-types'

describe('deriveColor', () => {
  it('flags greys as neutral', () => {
    const c = deriveColor('#808080')
    expect(c.isNeutral).toBe(true)
    expect(c.temperature).toBe(Temperature.Neutral)
  })

  it('reads warm vs cool from hue', () => {
    expect(deriveColor('#ff0000').temperature).toBe(Temperature.Warm)
    expect(deriveColor('#0000ff').temperature).toBe(Temperature.Cool)
  })

  it('maps lightness to brightness', () => {
    expect(deriveColor('#000000').brightness).toBe(Brightness.Dark)
    expect(deriveColor('#ffffff').brightness).toBe(Brightness.Light)
    expect(deriveColor('#808080').brightness).toBe(Brightness.Medium)
  })

  it('maps saturation buckets', () => {
    expect(deriveColor('#ff0000').saturation).toBe(Saturation.Vivid)
    expect(deriveColor('#808080').saturation).toBe(Saturation.Muted)
  })

  it('supports shorthand hex (deriving the same colour attributes)', () => {
    const short = deriveColor('#f00')
    const long = deriveColor('#ff0000')
    expect(short.hue).toBe(long.hue)
    expect(short.temperature).toBe(long.temperature)
    expect(short.brightness).toBe(long.brightness)
    expect(short.saturation).toBe(long.saturation)
    expect(short.isNeutral).toBe(long.isNeutral)
  })
})

describe('deriveFormality', () => {
  it('uses the subtype table first', () => {
    expect(deriveFormality(Category.Outerwear, 'blazer')).toBe(
      Formality.SmartCasual
    )
    expect(deriveFormality(Category.Shoes, 'heels')).toBe(Formality.Formal)
    expect(deriveFormality(Category.Top, 'hoodie')).toBe(Formality.Loungewear)
  })

  it('falls back to the category default', () => {
    expect(deriveFormality(Category.Top, null)).toBe(Formality.Casual)
    expect(deriveFormality(Category.Dress, null)).toBe(Formality.SmartCasual)
    expect(deriveFormality(Category.Top, 'nonsense')).toBe(Formality.Casual)
  })
})

describe('deriveItemData', () => {
  it('neutral colours become core with a universal palette', () => {
    const d = deriveItemData('#808080')
    expect(d.wardrobeRole).toBe(WardrobeRole.Core)
    expect(d.seasonPaletteCompatibility).toContain('universal')
  })

  it('vivid colours become pop pieces', () => {
    expect(deriveItemData('#ff0000').wardrobeRole).toBe(WardrobeRole.Pop)
  })

  it('produces a non-empty palette for coloured items', () => {
    const d = deriveItemData('#3a7d44')
    expect(d.seasonPaletteCompatibility.length).toBeGreaterThan(0)
  })
})
