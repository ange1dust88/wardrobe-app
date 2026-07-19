import {
  Category,
  type Item,
  SeasonPalette,
  Pattern,
  Formality,
  Fit,
  SeasonWear,
} from './item-types'
import { deriveColor, deriveFormality, deriveItemData } from './item-derivation'
import { categoriesConflict, categoryStacks } from './category-compat'
import { seasonsConflict } from './season-compat'
import { computeTotalScore } from './match-scoring'
import type { MatchCell, MatchMap } from './match-cache'

const MIN_RECOMMENDABLE_SCORE = 22

const SEASON_COLOR_TYPES: string[] = [
  SeasonPalette.Spring,
  SeasonPalette.Summer,
  SeasonPalette.Autumn,
  SeasonPalette.Winter,
]

export function parseColorType(
  value: string | null
): SeasonPalette | undefined {
  return value && SEASON_COLOR_TYPES.includes(value)
    ? (value as SeasonPalette)
    : undefined
}

const CATEGORY_ORDER: Category[] = [
  Category.Headwear,
  Category.Top,
  Category.Outerwear,
  Category.Dress,
  Category.Bottom,
  Category.Shoes,
  Category.Accessory,
]

export type PreviewInput = {
  category: Category
  hex: string
  accentHex?: string | null
  pattern: Pattern
  subType?: string | null
  formality?: Formality | null
  fit?: Fit | null
  seasonWear: SeasonWear[]
  excludeId?: string | null
}

export interface MatchPreviewPair {
  id: string
  name: string
  category: Category
  hex: string
  imageUrl: string | null
  score: number
}

export interface MatchPreviewSlot {
  category: Category
  owned: number
  matches: number
  compatible: boolean
}

export interface MatchPreview {
  wardrobeSize: number
  matchCount: number
  avgScore: number | null
  topScore: number | null
  results: MatchPreviewPair[]
  skipped: number
  byCategory: MatchPreviewSlot[]
}

const ELASTIC_WAIST = /sweat|jogger|track|legging|pyjama|pajama|lounge/i
const NO_LOOP_SUBTYPES = new Set(['sweatpants', 'leggings'])

function isBelt(item: Item): boolean {
  return (
    item.category === Category.Accessory &&
    (item.subType === 'belt' || /belt/i.test(item.name))
  )
}

// A belt can only sit on a bottom you can thread it through — never a top or
// shoes, and never an elastic-waist bottom (sweatpants, leggings).
function threadable(item: Item): boolean {
  if (item.category !== Category.Bottom) return false
  if (item.subType != null && NO_LOOP_SUBTYPES.has(item.subType)) return false
  if (ELASTIC_WAIST.test(item.name)) return false
  return true
}

function beltConflict(anchor: Item, candidate: Item): boolean {
  const belt = isBelt(anchor) ? anchor : isBelt(candidate) ? candidate : null
  if (!belt) return false
  const other = belt === anchor ? candidate : anchor
  return !threadable(other)
}

function pairAllowed(
  anchor: Item,
  candidate: Item,
  allowConflicts: boolean
): boolean {
  if (allowConflicts) return true
  if (beltConflict(anchor, candidate)) return false
  if (candidate.category === anchor.category) {
    return (
      categoryStacks(anchor.category) &&
      !seasonsConflict(anchor.seasonWear, candidate.seasonWear)
    )
  }
  return (
    !categoriesConflict(anchor.category, candidate.category) &&
    !seasonsConflict(anchor.seasonWear, candidate.seasonWear)
  )
}

export function buildMatchMap(
  items: Item[],
  userColorType?: SeasonPalette,
  allowConflicts = false
): MatchMap {
  const map: MatchMap = {}
  for (const anchor of items) {
    const ctx = { userColorType }
    const scores: Record<string, MatchCell> = {}
    for (const candidate of items) {
      if (candidate.id === anchor.id) continue
      if (!pairAllowed(anchor, candidate, allowConflicts)) continue
      const { total, breakdown } = computeTotalScore(anchor, candidate, ctx)
      scores[candidate.id] = { score: total, breakdown }
    }
    map[anchor.id] = scores
  }
  return map
}

export function buildPreview(
  items: Item[],
  input: PreviewInput,
  userColorType?: SeasonPalette,
  allowConflicts = false
): MatchPreview {
  const derived = deriveItemData(input.hex)
  const virtual: Item = {
    id: '__preview__',
    createdAt: new Date().toISOString(),
    name: 'preview',
    category: input.category,
    subType: input.subType ?? null,
    color: derived.color,
    accent: input.accentHex ? deriveColor(input.accentHex) : null,
    wardrobeRole: derived.wardrobeRole,
    imageUrl: null,
    pattern: input.pattern,
    formality:
      input.formality ?? deriveFormality(input.category, input.subType ?? null),
    fit: input.fit ?? null,
    seasonPaletteCompatibility: derived.seasonPaletteCompatibility,
    seasonWear: input.seasonWear,
  }

  const pool = items.filter(item => item.id !== input.excludeId)
  const ctx = { userColorType }

  const scored = pool
    .filter(candidate => pairAllowed(virtual, candidate, allowConflicts))
    .map(candidate => ({
      item: candidate,
      score: computeTotalScore(virtual, candidate, ctx).total,
    }))
    .sort((a, b) => b.score - a.score)

  const skipped = pool.length - scored.length
  const recommendable = scored.filter(
    entry => entry.score >= MIN_RECOMMENDABLE_SCORE
  )

  const results: MatchPreviewPair[] = scored.map(entry => ({
    id: entry.item.id,
    name: entry.item.name,
    category: entry.item.category,
    hex: entry.item.color.hex,
    imageUrl: entry.item.imageUrl,
    score: entry.score,
  }))

  const avgScore = recommendable.length
    ? Math.round(
        recommendable.reduce((sum, entry) => sum + entry.score, 0) /
          recommendable.length
      )
    : null

  const byCategory: MatchPreviewSlot[] = CATEGORY_ORDER.map(category => ({
    category,
    owned: pool.filter(item => item.category === category).length,
    matches: recommendable.filter(entry => entry.item.category === category)
      .length,
    compatible:
      category === virtual.category
        ? categoryStacks(category)
        : !categoriesConflict(virtual.category, category),
  }))

  return {
    wardrobeSize: pool.length,
    matchCount: recommendable.length,
    avgScore,
    topScore: recommendable[0]?.score ?? null,
    results,
    skipped,
    byCategory,
  }
}
