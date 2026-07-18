export enum Category {
  Headwear = 'headwear',
  Top = 'top',
  Outerwear = 'outerwear',
  Dress = 'dress',
  Bottom = 'bottom',
  Shoes = 'shoes',
  Accessory = 'accessory',
}

export enum Temperature {
  Warm = 'warm',
  Cool = 'cool',
  Neutral = 'neutral',
}

export enum Brightness {
  Light = 'light',
  Medium = 'medium',
  Dark = 'dark',
}

export enum Saturation {
  Muted = 'muted',
  Soft = 'soft',
  Vivid = 'vivid',
}

export enum WardrobeRole {
  Core = 'core',
  Tonal = 'tonal',
  Pop = 'pop',
}

export enum Pattern {
  Solid = 'solid',
  SubtlePattern = 'subtle_pattern',
  BoldPattern = 'bold_pattern',
  Graphic = 'graphic',
  TextureOnly = 'texture_only',
}

export enum SeasonPalette {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
  Universal = 'universal',
}

export enum SeasonWear {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
}

export enum Formality {
  Loungewear = 'loungewear',
  Casual = 'casual',
  SmartCasual = 'smart_casual',
  Formal = 'formal',
}

export enum Fit {
  Slim = 'slim',
  Regular = 'regular',
  Relaxed = 'relaxed',
  Oversized = 'oversized',
}

export interface Color {
  hex: string
  hue: number
  temperature: Temperature
  brightness: Brightness
  saturation: Saturation
  isNeutral: boolean
}

export interface Item {
  id: string
  createdAt: string
  name: string
  category: Category
  subType: string | null
  color: Color
  accent: Color | null
  wardrobeRole: WardrobeRole
  imageUrl: string | null
  pattern: Pattern
  formality: Formality | null
  fit: Fit | null
  seasonPaletteCompatibility: SeasonPalette[]
  seasonWear: SeasonWear[]
}
