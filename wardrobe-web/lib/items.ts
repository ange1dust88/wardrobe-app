import { supabase } from './supabase'

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_URL}${path}`, { ...init, headers })
}

export const CATEGORIES = [
  'headwear',
  'top',
  'outerwear',
  'dress',
  'bottom',
  'shoes',
  'accessory',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  headwear: 'Headwear',
  top: 'Top',
  outerwear: 'Outerwear',
  dress: 'Dress',
  bottom: 'Bottom',
  shoes: 'Shoes',
  accessory: 'Accessory',
}

export type StackPolicy = 'single' | 'layered' | 'unlimited'

export const STACK_POLICY: Record<Category, StackPolicy> = {
  headwear: 'single',
  top: 'layered',
  outerwear: 'layered',
  dress: 'single',
  bottom: 'layered',
  shoes: 'single',
  accessory: 'unlimited',
}

export const SUBTYPES: Partial<Record<Category, string[]>> = {
  headwear: ['cap', 'beanie', 'hat', 'beret', 'headband'],
  top: ['t-shirt', 'longsleeve', 'shirt', 'sweater', 'hoodie', 'tank', 'polo'],
  outerwear: ['jacket', 'coat', 'blazer', 'vest', 'cardigan'],
  dress: ['mini', 'midi', 'maxi', 'gown', 'slip'],
  bottom: ['trousers', 'jeans', 'shorts', 'leggings', 'skirt', 'sweatpants'],
  shoes: ['sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers'],
  accessory: [
    'bag',
    'jewelry',
    'belt',
    'watch',
    'sunglasses',
    'scarf',
    'gloves',
    'necklace',
    'ring',
    'earrings',
    'bracelet',
  ],
}

export const BASE_SUBTYPES: Partial<Record<Category, string[]>> = {
  bottom: ['leggings'],
}

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const

export type Season = (typeof SEASONS)[number]

export const PATTERNS = [
  'solid',
  'subtle_pattern',
  'bold_pattern',
  'graphic',
  'texture_only',
] as const

export type Pattern = (typeof PATTERNS)[number]

export const VIBES = [
  'minimalist',
  'classic',
  'sporty',
  'edgy',
  'romantic',
  'vintage',
] as const

export type Vibe = (typeof VIBES)[number]

export const FORMALITY_OPTIONS = [
  'loungewear',
  'casual',
  'smart_casual',
  'formal',
] as const

export type Formality = (typeof FORMALITY_OPTIONS)[number]

export const FORMALITY_LABELS: Record<Formality, string> = {
  loungewear: 'Loungewear',
  casual: 'Casual',
  smart_casual: 'Smart casual',
  formal: 'Formal',
}

export const FIT_OPTIONS = ['slim', 'regular', 'relaxed', 'oversized'] as const

export type Fit = (typeof FIT_OPTIONS)[number]

export const FIT_LABELS: Record<Fit, string> = {
  slim: 'Slim',
  regular: 'Regular',
  relaxed: 'Relaxed',
  oversized: 'Oversized',
}

export type Color = {
  hex: string
  hue: number
  temperature: string
  brightness: string
  saturation: string
  isNeutral: boolean
}

export type Item = {
  id: string
  createdAt: string
  name: string
  category: Category
  subType?: string | null
  color: Color
  accent?: Color | null
  wardrobeRole: string
  imageUrl?: string
  pattern: string
  formality?: string | null
  fit?: string | null
  vibe: string[]
  seasonPaletteCompatibility: string[]
  seasonWear: Season[]
}

export type CreateItem = {
  name: string
  category: Category
  subType?: string | null
  hex: string
  accentHex?: string | null
  pattern: Pattern
  formality?: Formality | null
  fit?: Fit | null
  vibe: Vibe[]
  seasonWear: Season[]
  image?: File | null
}

export async function fetchItems(): Promise<Item[]> {
  const res = await apiFetch('/items')
  if (!res.ok) throw new Error(`GET /items → ${res.status}`)
  return res.json()
}

export async function createItem(body: CreateItem): Promise<Item> {
  const formData = new FormData()
  formData.append('name', body.name)
  formData.append('category', body.category)
  if (body.subType) formData.append('subType', body.subType)
  formData.append('hex', body.hex)
  if (body.accentHex) formData.append('accentHex', body.accentHex)
  formData.append('pattern', body.pattern)
  if (body.formality) formData.append('formality', body.formality)
  if (body.fit) formData.append('fit', body.fit)
  body.vibe.forEach(vibe => formData.append('vibe', vibe))
  body.seasonWear.forEach(season => formData.append('seasonWear', season))
  if (body.image) {
    formData.append('image', body.image)
  }

  const res = await apiFetch('/items', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const msg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? `POST /items → ${res.status}`)
    throw new Error(msg)
  }
  return res.json()
}

export type UpdateItem = {
  name: string
  category: Category
  subType?: string | null
  hex: string
  accentHex?: string | null
  pattern: Pattern
  formality?: Formality | null
  fit?: Fit | null
  vibe: Vibe[]
  seasonWear: Season[]
  image?: File | null
}

export async function updateItem(
  id: string,
  body: UpdateItem
): Promise<Item> {
  const formData = new FormData()
  formData.append('name', body.name)
  formData.append('category', body.category)
  if (body.subType) formData.append('subType', body.subType)
  formData.append('hex', body.hex)
  if (body.accentHex) formData.append('accentHex', body.accentHex)
  formData.append('pattern', body.pattern)
  if (body.formality) formData.append('formality', body.formality)
  if (body.fit) formData.append('fit', body.fit)
  body.vibe.forEach(vibe => formData.append('vibe', vibe))
  body.seasonWear.forEach(season => formData.append('seasonWear', season))
  if (body.image) {
    formData.append('image', body.image)
  }

  const res = await apiFetch(`/items/${id}`, {
    method: 'PATCH',
    body: formData,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const msg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? `PATCH /items/${id} → ${res.status}`)
    throw new Error(msg)
  }
  return res.json()
}

export async function extractItemColor(image: File): Promise<{ hex: string }> {
  const formData = new FormData()
  formData.append('image', image)
  const res = await apiFetch('/items/extract-color', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`POST /items/extract-color → ${res.status}`)
  return res.json()
}

export function getItemImageSrc(item: Item): string | null {
  if (!item.imageUrl) {
    return null
  }
  if (/^(https?:|data:|blob:)/.test(item.imageUrl)) {
    return item.imageUrl
  }
  return `${API_URL}${item.imageUrl}`
}

export async function deleteItem(id: string): Promise<void> {
  const res = await apiFetch(`/items/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE /items/${id} → ${res.status}`)
}

export type ScoreBreakdown = {
  color: number
  role: number
  season: number
  palette: number
  style: number
  pattern: number
}

export type MatchCell = { score: number; breakdown: ScoreBreakdown }

export type MatchMap = Record<string, Record<string, MatchCell>>

export async function fetchMatchMap(
  colorType?: string,
  allowConflicts?: boolean
): Promise<MatchMap> {
  const params = new URLSearchParams()
  if (colorType) params.set('colorType', colorType)
  if (allowConflicts) params.set('allowConflicts', 'true')
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await apiFetch(`/items/matches/map${query}`)
  if (!res.ok) throw new Error(`GET /items/matches/map → ${res.status}`)
  return res.json()
}

export type Outfit = {
  id: string
  createdAt: string
  name: string
  itemIds: string[]
}

export async function createOutfit(body: {
  name: string
  itemIds: string[]
}): Promise<Outfit> {
  const res = await apiFetch('/outfits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const msg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? `POST /outfits → ${res.status}`)
    throw new Error(msg)
  }
  return res.json()
}

export async function fetchOutfits(): Promise<Outfit[]> {
  const res = await apiFetch('/outfits')
  if (!res.ok) throw new Error(`GET /outfits → ${res.status}`)
  return res.json()
}

export async function deleteOutfit(id: string): Promise<void> {
  const res = await apiFetch(`/outfits/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE /outfits/${id} → ${res.status}`)
}
