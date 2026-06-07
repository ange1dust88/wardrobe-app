export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export const CATEGORIES = ['top', 'bottom', 'shoes', 'accessory'] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  accessory: 'Accessory',
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
  'casual',
  'classic',
  'romantic',
  'edgy',
  'sporty',
  'business',
  'evening',
  'minimal',
] as const

export type Vibe = (typeof VIBES)[number]

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
  color: Color
  wardrobeRole: string
  imageUrl?: string
  pattern: string
  vibe: string[]
  seasonPaletteCompatibility: string[]
  seasonWear: Season[]
}

export type CreateItem = {
  name: string
  category: Category
  hex: string
  pattern: Pattern
  vibe: Vibe[]
  seasonWear: Season[]
  image?: File | null
}

export async function fetchItems(): Promise<Item[]> {
  const res = await fetch(`${API_URL}/items`)
  if (!res.ok) throw new Error(`GET /items → ${res.status}`)
  return res.json()
}

export async function createItem(body: CreateItem): Promise<Item> {
  const formData = new FormData()
  formData.append('name', body.name)
  formData.append('category', body.category)
  formData.append('hex', body.hex)
  formData.append('pattern', body.pattern)
  body.vibe.forEach(vibe => formData.append('vibe', vibe))
  body.seasonWear.forEach(season => formData.append('seasonWear', season))
  if (body.image) {
    formData.append('image', body.image)
  }

  const res = await fetch(`${API_URL}/items`, {
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
  const res = await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE /items/${id} → ${res.status}`)
}

export type ScoredMatch = {
  item: Item
  score: number
  breakdown: Record<string, number>
}

export type MatchResult = {
  anchor: Item
  matches: Record<Category, ScoredMatch[]>
}

export async function fetchMatches(anchorId: string): Promise<MatchResult> {
  const res = await fetch(`${API_URL}/items/${anchorId}/matches`)
  if (!res.ok) throw new Error(`GET /items/${anchorId}/matches → ${res.status}`)
  return res.json()
}

export const SAMPLE_ITEMS: CreateItem[] = [
  // tops
  { name: 'Fuchsia Shirt', category: 'top', hex: '#D4006F', pattern: 'solid', vibe: ['evening', 'edgy'], seasonWear: ['autumn', 'winter'] },
  { name: 'Black Hoodie', category: 'top', hex: '#111111', pattern: 'solid', vibe: ['casual', 'edgy'], seasonWear: ['autumn', 'winter'] },
  { name: 'White Tee', category: 'top', hex: '#FFFFFF', pattern: 'solid', vibe: ['casual', 'minimal'], seasonWear: ['spring', 'summer', 'autumn', 'winter'] },
  { name: 'Mustard Knit', category: 'top', hex: '#C9A227', pattern: 'solid', vibe: ['casual', 'classic'], seasonWear: ['autumn', 'winter'] },
  { name: 'Red Graphic Tee', category: 'top', hex: '#E11900', pattern: 'graphic', vibe: ['sporty', 'casual'], seasonWear: ['summer', 'autumn'] },
  { name: 'Striped Shirt', category: 'top', hex: '#3A6EA5', pattern: 'subtle_pattern', vibe: ['classic', 'business'], seasonWear: ['spring', 'autumn'] },
  // bottoms
  { name: 'Black Trousers', category: 'bottom', hex: '#1A1A1A', pattern: 'solid', vibe: ['business', 'edgy'], seasonWear: ['autumn', 'winter'] },
  { name: 'Beige Wide Pants', category: 'bottom', hex: '#E6D6B8', pattern: 'solid', vibe: ['casual', 'minimal'], seasonWear: ['spring', 'summer', 'autumn'] },
  { name: 'Blue Jeans', category: 'bottom', hex: '#2E4A8A', pattern: 'solid', vibe: ['casual'], seasonWear: ['spring', 'summer', 'autumn', 'winter'] },
  { name: 'Olive Cargo', category: 'bottom', hex: '#556B2F', pattern: 'solid', vibe: ['sporty', 'casual'], seasonWear: ['spring', 'autumn'] },
  { name: 'Pink Skirt', category: 'bottom', hex: '#F49AC2', pattern: 'bold_pattern', vibe: ['romantic'], seasonWear: ['spring', 'summer'] },
  { name: 'Grey Slacks', category: 'bottom', hex: '#8A8A8A', pattern: 'solid', vibe: ['business', 'classic'], seasonWear: ['spring', 'summer', 'autumn', 'winter'] },
  // shoes
  { name: 'Black Boots', category: 'shoes', hex: '#0D0D0D', pattern: 'solid', vibe: ['edgy'], seasonWear: ['autumn', 'winter'] },
  { name: 'White Sneakers', category: 'shoes', hex: '#F5F5F5', pattern: 'solid', vibe: ['casual', 'sporty'], seasonWear: ['spring', 'summer'] },
  { name: 'Brown Loafers', category: 'shoes', hex: '#5A3A22', pattern: 'solid', vibe: ['classic', 'business'], seasonWear: ['autumn', 'winter'] },
  { name: 'Red Heels', category: 'shoes', hex: '#B0152B', pattern: 'solid', vibe: ['evening', 'romantic'], seasonWear: ['autumn', 'winter'] },
  // accessories
  { name: 'Silver Necklace', category: 'accessory', hex: '#CCCCCC', pattern: 'solid', vibe: ['evening'], seasonWear: ['autumn', 'winter'] },
  { name: 'Tan Belt', category: 'accessory', hex: '#B08D57', pattern: 'solid', vibe: ['classic', 'business'], seasonWear: ['spring', 'summer', 'autumn', 'winter'] },
  { name: 'Green Scarf', category: 'accessory', hex: '#2E8B57', pattern: 'solid', vibe: ['casual', 'sporty'], seasonWear: ['autumn', 'winter'] },
  { name: 'Black Cap', category: 'accessory', hex: '#161616', pattern: 'solid', vibe: ['sporty', 'casual'], seasonWear: ['spring', 'summer', 'autumn', 'winter'] },
]
