import type { ScoreBreakdown } from './match-scoring'

export type MatchCell = { score: number; breakdown: ScoreBreakdown }
export type MatchMap = Record<string, Record<string, MatchCell>>

const cache = new Map<string, MatchMap>()

function key(
  userId: string,
  colorType?: string,
  allowConflicts = false
): string {
  return `${userId}::${colorType ?? ''}::${allowConflicts ? '1' : '0'}`
}

export function getCachedMatchMap(
  userId: string,
  colorType?: string,
  allowConflicts = false
): MatchMap | undefined {
  return cache.get(key(userId, colorType, allowConflicts))
}

export function setCachedMatchMap(
  userId: string,
  map: MatchMap,
  colorType?: string,
  allowConflicts = false
): void {
  cache.set(key(userId, colorType, allowConflicts), map)
}

export function invalidateMatchMap(userId: string): void {
  const prefix = `${userId}::`
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) cache.delete(k)
  }
}
