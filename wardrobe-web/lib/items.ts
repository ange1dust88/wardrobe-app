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
}

export async function fetchItems(): Promise<Item[]> {
  const res = await fetch(`${API_URL}/items`)
  if (!res.ok) throw new Error(`GET /items → ${res.status}`)
  return res.json()
}

export async function createItem(body: CreateItem): Promise<Item> {
  const res = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE /items/${id} → ${res.status}`)
}
