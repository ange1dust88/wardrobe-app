import type { Vibe } from './items'

const VIBE_INCOMPATIBLE: [Vibe, Vibe][] = [
  ['sporty', 'workwear'],
  ['sporty', 'romantic'],
  ['sporty', 'classic'],
  ['minimalist', 'romantic'],
  ['minimalist', 'vintage'],
  ['urban', 'romantic'],
  ['urban', 'classic'],
  ['workwear', 'romantic'],
  ['edgy', 'relaxed'],
]

const INCOMPATIBLE_SET = new Set(
  VIBE_INCOMPATIBLE.map(([a, b]) => [a, b].sort().join('|'))
)

export function findVibeConflicts(vibes: Vibe[]): [Vibe, Vibe][] {
  const conflicts: [Vibe, Vibe][] = []
  for (let i = 0; i < vibes.length; i++) {
    for (let j = i + 1; j < vibes.length; j++) {
      const key = [vibes[i], vibes[j]].sort().join('|')
      if (INCOMPATIBLE_SET.has(key)) conflicts.push([vibes[i], vibes[j]])
    }
  }
  return conflicts
}
