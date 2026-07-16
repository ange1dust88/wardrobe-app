export const WHO_OPTIONS = ['men', 'women', 'mix'] as const
export type Who = (typeof WHO_OPTIONS)[number]

export const CLIMATE_OPTIONS = ['cold', 'mild', 'hot'] as const
export type Climate = (typeof CLIMATE_OPTIONS)[number]

export const ONBOARDING_PALETTES = [
  {
    id: 'spring',
    label: 'spring',
    colors: ['#f0d9c4', '#e7a86a', '#d9663c', '#3aa6a0'],
  },
  {
    id: 'summer',
    label: 'summer',
    colors: ['#e8dce8', '#b9c4e0', '#cf8aa8', '#5b8fb0'],
  },
  {
    id: 'autumn',
    label: 'autumn',
    colors: ['#e4c7a1', '#c98b2f', '#a5502a', '#3d6b4a'],
  },
  {
    id: 'winter',
    label: 'winter',
    colors: ['#ecdcd4', '#c9a6e6', '#a3184a', '#17597a'],
  },
] as const

export type PaletteId = (typeof ONBOARDING_PALETTES)[number]['id']

export const SEASON_META: Record<PaletteId, { label: string; blurb: string }> =
  {
    spring: { label: 'Spring', blurb: 'warm & light' },
    summer: { label: 'Summer', blurb: 'cool & light' },
    autumn: { label: 'Autumn', blurb: 'warm & deep' },
    winter: { label: 'Winter', blurb: 'cool & deep' },
  }

export const NEUTRAL_SEASON = {
  label: 'Neutral',
  blurb: 'soft & versatile',
  colors: ['#e2ded7', '#b9b2c2', '#9c6b74', '#4a6a80'],
}

export const UNDERTONE_OPTIONS = ['warm', 'cool'] as const
export type Undertone = (typeof UNDERTONE_OPTIONS)[number]

export const FEATURE_KINDS = ['hair', 'eyes', 'skin'] as const
export type FeatureKind = (typeof FEATURE_KINDS)[number]
export type Features = Record<FeatureKind, number | null>

// each option: swatch colour + depth (0 = light … 1 = deep)
export const FEATURE_OPTS: Record<FeatureKind, { c: string; d: number }[]> = {
  hair: [
    { c: '#e8cf9c', d: 0.12 },
    { c: '#c79a5b', d: 0.32 },
    { c: '#8a5a30', d: 0.52 },
    { c: '#4e3320', d: 0.74 },
    { c: '#241a12', d: 0.93 },
  ],
  eyes: [
    { c: '#7aa0cf', d: 0.2 },
    { c: '#6d9e7a', d: 0.36 },
    { c: '#9c7b45', d: 0.52 },
    { c: '#6b4a2c', d: 0.72 },
    { c: '#2e1f14', d: 0.9 },
  ],
  skin: [
    { c: '#f2ddc8', d: 0.12 },
    { c: '#e6c19c', d: 0.3 },
    { c: '#cfa06e', d: 0.48 },
    { c: '#a56d40', d: 0.66 },
    { c: '#43291a', d: 0.92 },
  ],
}

const FEATURE_WEIGHTS: Record<FeatureKind, number> = {
  hair: 0.45,
  skin: 0.4,
  eyes: 0.15,
}

export function deriveColoring(features: Features): 'light' | 'deep' | null {
  let sum = 0
  let wsum = 0
  for (const k of FEATURE_KINDS) {
    const idx = features[k]
    if (idx != null) {
      sum += FEATURE_OPTS[k][idx].d * FEATURE_WEIGHTS[k]
      wsum += FEATURE_WEIGHTS[k]
    }
  }
  if (wsum === 0) return null
  return sum / wsum >= 0.5 ? 'deep' : 'light'
}

// season id, or null when there isn't enough to place a season (→ neutral)
export function deriveSeason(
  coloring: 'light' | 'deep' | null,
  undertone: Undertone | null
): PaletteId | null {
  if (coloring === 'light' && undertone === 'warm') return 'spring'
  if (coloring === 'light' && undertone === 'cool') return 'summer'
  if (coloring === 'deep' && undertone === 'warm') return 'autumn'
  if (coloring === 'deep' && undertone === 'cool') return 'winter'
  if (coloring === 'light') return 'summer'
  if (coloring === 'deep') return 'winter'
  if (undertone === 'warm') return 'autumn'
  if (undertone === 'cool') return 'winter'
  return null
}
