import { deriveColor } from '@/lib/server/domain/item-derivation'
import {
  Category,
  Fit,
  Formality,
  type Item,
  Pattern,
  SeasonPalette,
  SeasonWear,
  WardrobeRole,
} from '@/lib/server/domain/item-types'

let counter = 0

export function makeItem(overrides: Partial<Item> = {}): Item {
  counter += 1
  return {
    id: `item-${counter}`,
    createdAt: '2026-01-01T00:00:00.000Z',
    name: `Item ${counter}`,
    category: Category.Top,
    subType: null,
    color: deriveColor('#808080'),
    accent: null,
    wardrobeRole: WardrobeRole.Core,
    imageUrl: null,
    pattern: Pattern.Solid,
    formality: Formality.Casual,
    fit: Fit.Regular,
    seasonPaletteCompatibility: [SeasonPalette.Universal],
    seasonWear: [
      SeasonWear.Spring,
      SeasonWear.Summer,
      SeasonWear.Autumn,
      SeasonWear.Winter,
    ],
    ...overrides,
  }
}
