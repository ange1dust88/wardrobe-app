import { apiFetch } from './items'
import type { Climate, PaletteId, Who } from './onboarding'

export type UserProfile = {
  userId: string
  who: Who | null
  climate: Climate | null
  palettes: PaletteId[]
  onboardedAt: string | null
}

export type ProfileInput = {
  who: Who | null
  climate: Climate | null
  palettes: PaletteId[]
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const res = await apiFetch('/profile')
  if (!res.ok) throw new Error(`GET /profile → ${res.status}`)
  const text = await res.text()
  return text ? (JSON.parse(text) as UserProfile) : null
}

export async function saveProfile(body: ProfileInput): Promise<UserProfile> {
  const res = await apiFetch('/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT /profile → ${res.status}`)
  return res.json()
}
