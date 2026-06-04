export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const CATEGORIES = [
  "outerwear",
  "top",
  "bottom",
  "shoes",
  "accessory",
  "dress",
  "set",
] as const;

export const TEMPERATURES = ["warm", "cool", "neutral"] as const;
export const BRIGHTNESSES = ["light", "medium", "dark"] as const;
export const SATURATIONS = ["muted", "soft", "vivid"] as const;
export const WARDROBE_ROLES = ["core", "tonal", "pop"] as const;
export const PATTERNS = [
  "solid",
  "subtle_pattern",
  "bold_pattern",
  "graphic",
  "texture_only",
] as const;
export const SEASON_PALETTES = [
  "spring",
  "summer",
  "autumn",
  "winter",
  "universal",
] as const;
export const VIBES = [
  "casual",
  "classic",
  "romantic",
  "edgy",
  "sporty",
  "business",
  "evening",
  "minimal",
] as const;
export const SEASON_WEARS = [
  "spring",
  "summer",
  "autumn",
  "winter",
  "all_year",
] as const;

export type Color = {
  hex: string;
  hue: number;
  temperature: (typeof TEMPERATURES)[number];
  brightness: (typeof BRIGHTNESSES)[number];
  saturation: (typeof SATURATIONS)[number];
  isNeutral: boolean;
};

export type CreateItem = {
  name: string;
  category: (typeof CATEGORIES)[number];
  color: Color;
  wardrobeRole: (typeof WARDROBE_ROLES)[number];
  pattern: (typeof PATTERNS)[number];
  seasonPaletteCompatibility: (typeof SEASON_PALETTES)[number][];
  vibe: (typeof VIBES)[number][];
  seasonWear: (typeof SEASON_WEARS)[number][];
};

export type Item = CreateItem & { id: string; createdAt: string };

export async function fetchItems(): Promise<Item[]> {
  const res = await fetch(`${API_URL}/items`);
  if (!res.ok) throw new Error(`GET /items → ${res.status}`);
  return res.json();
}

export async function createItem(body: CreateItem): Promise<Item> {
  const res = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = Array.isArray(data?.message)
      ? data.message.join(", ")
      : (data?.message ?? `POST /items → ${res.status}`);
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /items/${id} → ${res.status}`);
}
