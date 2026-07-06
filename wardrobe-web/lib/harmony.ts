import type { MatchMap } from './items'

export function harmonyOf(ids: string[], map: MatchMap): number {
  let sum = 0
  let count = 0
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const cell = map[ids[i]]?.[ids[j]] ?? map[ids[j]]?.[ids[i]]
      if (cell != null) {
        sum += cell.score
        count += 1
      }
    }
  }
  return count ? Math.round(sum / count) : 0
}
