import { SeasonWear } from './item-types'

const WARMTH: Record<SeasonWear, number> = {
  [SeasonWear.Summer]: 3,
  [SeasonWear.Spring]: 2,
  [SeasonWear.Autumn]: 2,
  [SeasonWear.Winter]: 1,
}

function warmthRange(seasons: SeasonWear[]): [number, number] | null {
  if (seasons.length === 0) return null
  const values = seasons.map(s => WARMTH[s])
  return [Math.min(...values), Math.max(...values)]
}

export function warmthGap(a: SeasonWear[], b: SeasonWear[]): number {
  const ra = warmthRange(a)
  const rb = warmthRange(b)
  if (!ra || !rb) return 0
  if (ra[1] >= rb[0] && rb[1] >= ra[0]) return 0
  return ra[0] > rb[1] ? ra[0] - rb[1] : rb[0] - ra[1]
}

export function seasonsConflict(a: SeasonWear[], b: SeasonWear[]): boolean {
  return warmthGap(a, b) >= 2
}
