import { Prisma } from '@prisma/client'
import { prisma } from '../db'
import {
  Category,
  Fit,
  Formality,
  Pattern,
  SeasonWear,
} from '../domain/item-types'
import { deriveItemData } from '../domain/item-derivation'

const ALL = [
  SeasonWear.Spring,
  SeasonWear.Summer,
  SeasonWear.Autumn,
  SeasonWear.Winter,
]

type Starter = {
  name: string
  category: Category
  hex: string
  formality: Formality
  fit: Fit | null
  seasonWear: SeasonWear[]
}

// A small neutral capsule — everything pairs, so the wheel lights up on day one.
const STARTER: Starter[] = [
  {
    name: 'White tee',
    category: Category.Top,
    hex: '#f1f0ec',
    formality: Formality.Casual,
    fit: Fit.Regular,
    seasonWear: ALL,
  },
  {
    name: 'Black tee',
    category: Category.Top,
    hex: '#1e1e20',
    formality: Formality.Casual,
    fit: Fit.Regular,
    seasonWear: ALL,
  },
  {
    name: 'Grey hoodie',
    category: Category.Top,
    hex: '#8b9095',
    formality: Formality.Loungewear,
    fit: Fit.Relaxed,
    seasonWear: [SeasonWear.Spring, SeasonWear.Autumn, SeasonWear.Winter],
  },
  {
    name: 'Blue jeans',
    category: Category.Bottom,
    hex: '#3b567f',
    formality: Formality.Casual,
    fit: Fit.Regular,
    seasonWear: ALL,
  },
  {
    name: 'Beige chinos',
    category: Category.Bottom,
    hex: '#c8b088',
    formality: Formality.SmartCasual,
    fit: Fit.Regular,
    seasonWear: [SeasonWear.Spring, SeasonWear.Summer, SeasonWear.Autumn],
  },
  {
    name: 'White sneakers',
    category: Category.Shoes,
    hex: '#ececea',
    formality: Formality.Casual,
    fit: null,
    seasonWear: ALL,
  },
  {
    name: 'Navy overshirt',
    category: Category.Outerwear,
    hex: '#27324b',
    formality: Formality.Casual,
    fit: Fit.Regular,
    seasonWear: [SeasonWear.Spring, SeasonWear.Autumn, SeasonWear.Winter],
  },
]

export async function seedStarterWardrobe(userId: string): Promise<number> {
  const existing = await prisma.item.count({ where: { userId } })
  if (existing > 0) return 0

  const data = STARTER.map(s => {
    const derived = deriveItemData(s.hex)
    return {
      userId,
      name: s.name,
      category: s.category,
      subType: null,
      pattern: Pattern.Solid,
      formality: s.formality,
      fit: s.fit,
      seasonWear: s.seasonWear,
      imageUrl: null,
      hex: derived.color.hex,
      accentHex: null,
      hue: derived.color.hue,
      temperature: derived.color.temperature,
      brightness: derived.color.brightness,
      saturation: derived.color.saturation,
      isNeutral: derived.color.isNeutral,
      wardrobeRole: derived.wardrobeRole,
      seasonPaletteCompatibility: derived.seasonPaletteCompatibility,
    }
  }) as Prisma.ItemCreateManyInput[]

  const res = await prisma.item.createMany({ data })
  return res.count
}
