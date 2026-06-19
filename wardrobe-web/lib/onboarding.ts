export const WHO_OPTIONS = ['men', 'women', 'mix'] as const
export type Who = (typeof WHO_OPTIONS)[number]

export const CLIMATE_OPTIONS = ['cold', 'mild', 'hot'] as const
export type Climate = (typeof CLIMATE_OPTIONS)[number]

export const ONBOARDING_PALETTES = [
  { id: 'spring', label: 'spring', colors: ['#e94f2e', '#e8a98a', '#08a0c4', '#a8c828'] },
  { id: 'summer', label: 'summer', colors: ['#c83a5b', '#8a6fa0', '#6f93cf', '#84bf95'] },
  { id: 'autumn', label: 'autumn', colors: ['#b1623f', '#0f7a45', '#f5a623', '#f57f73'] },
  { id: 'winter', label: 'winter', colors: ['#e6d9d4', '#c9b6ef', '#9c1f4d', '#176079'] },
] as const

export type PaletteId = (typeof ONBOARDING_PALETTES)[number]['id']

export const MAX_PALETTES = 2
