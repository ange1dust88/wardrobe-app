import { apiFetch } from './items'
import type { Climate, PaletteId, Undertone, Who } from './onboarding'

export type UserProfile = {
  userId: string
  who: Who | null
  climate: Climate | null
  palettes: PaletteId[]
  hair: number | null
  eyes: number | null
  skin: number | null
  undertone: Undertone | null
  onboardedAt: string | null
}

export type ProfileInput = {
  who: Who | null
  climate: Climate | null
  palettes: PaletteId[]
  hair: number | null
  eyes: number | null
  skin: number | null
  undertone: Undertone | null
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const res = await apiFetch('/profile')
  if (!res.ok) throw new Error(`GET /profile → ${res.status}`)
  const text = await res.text()
  return text ? (JSON.parse(text) as UserProfile) : null
}

export async function saveProfile(body: ProfileInput): Promise<UserProfile> {
  const payload: Record<string, unknown> = {
    palettes: body.palettes,
    hair: body.hair,
    eyes: body.eyes,
    skin: body.skin,
    undertone: body.undertone,
  }
  if (body.who != null) payload.who = body.who
  if (body.climate != null) payload.climate = body.climate
  const res = await apiFetch('/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const msg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message ?? `PUT /profile → ${res.status}`)
    throw new Error(msg)
  }
  return res.json()
}
