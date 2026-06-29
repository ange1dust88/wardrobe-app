import type { Item } from './items'

const CATEGORY_CONFLICTS: [string, string][] = [
  ['top', 'dress'],
  ['bottom', 'skirt'],
  ['bottom', 'dress'],
  ['skirt', 'dress'],
]

const CATEGORY_CONFLICT_SET = new Set(
  CATEGORY_CONFLICTS.map(([a, b]) => [a, b].sort().join('|'))
)

function categoriesConflict(a: string, b: string): boolean {
  if (a === b) return false
  return CATEGORY_CONFLICT_SET.has([a, b].sort().join('|'))
}

const WARMTH: Record<string, number> = {
  summer: 3,
  spring: 2,
  autumn: 2,
  winter: 1,
}

function warmthRange(seasons: string[]): [number, number] | null {
  const values = seasons.map(s => WARMTH[s]).filter(v => v != null)
  if (!values.length) return null
  return [Math.min(...values), Math.max(...values)]
}

function seasonsConflict(a: string[], b: string[]): boolean {
  const ra = warmthRange(a)
  const rb = warmthRange(b)
  if (!ra || !rb) return false
  if (ra[1] >= rb[0] && rb[1] >= ra[0]) return false
  const gap = ra[0] > rb[1] ? ra[0] - rb[1] : rb[0] - ra[1]
  return gap >= 2
}

export type OutfitConflict = {
  a: Item
  b: Item
  reason: string
}

export function findOutfitConflicts(items: Item[]): OutfitConflict[] {
  const conflicts: OutfitConflict[] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      if (categoriesConflict(a.category, b.category)) {
        conflicts.push({
          a,
          b,
          reason: `${a.category} and ${b.category} cover the same part — wear one`,
        })
      } else if (seasonsConflict(a.seasonWear, b.seasonWear)) {
        conflicts.push({
          a,
          b,
          reason: 'made for opposite weather (summer vs winter)',
        })
      }
    }
  }
  return conflicts
}
