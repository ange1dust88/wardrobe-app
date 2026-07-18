import { z } from 'zod'
import { badRequest } from './http'
import type { CreateItemInput, UpdateItemInput } from './services/items'
import type { PreviewInput } from './domain/matching'
import type { CreateOutfitInput, UpdateOutfitInput } from './services/outfits'
import type { UpsertProfileInput } from './services/profile'

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const category = z.enum([
  'headwear',
  'top',
  'outerwear',
  'dress',
  'bottom',
  'shoes',
  'accessory',
])
const pattern = z.enum([
  'solid',
  'subtle_pattern',
  'bold_pattern',
  'graphic',
  'texture_only',
])
const formality = z.enum(['loungewear', 'casual', 'smart_casual', 'formal'])
const fit = z.enum(['slim', 'regular', 'relaxed', 'oversized'])
const seasonWear = z.enum(['spring', 'summer', 'autumn', 'winter'])
const palette = z.enum(['spring', 'summer', 'autumn', 'winter', 'universal'])
const who = z.enum(['men', 'women', 'mix'])
const climate = z.enum(['cold', 'mild', 'hot'])
const undertone = z.enum(['warm', 'cool'])

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const msg = result.error.issues
      .map(i => `${i.path.join('.') || 'body'}: ${i.message}`)
      .join(', ')
    throw badRequest(msg)
  }
  return result.data
}

const createItemSchema = z.object({
  name: z.string().min(1).max(80),
  category,
  subType: z.string().optional(),
  hex: z.string().regex(HEX).optional(),
  accentHex: z.string().regex(HEX).optional(),
  pattern,
  formality: formality.optional(),
  fit: fit.optional(),
  seasonWear: z.array(seasonWear).min(1),
})

const updateItemSchema = createItemSchema.partial()

function itemFieldsFromForm(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const key of [
    'name',
    'category',
    'subType',
    'hex',
    'accentHex',
    'pattern',
    'formality',
    'fit',
  ]) {
    const v = fd.get(key)
    if (typeof v === 'string' && v !== '') obj[key] = v
  }
  const seasons = fd.getAll('seasonWear').filter(v => typeof v === 'string')
  if (seasons.length) obj.seasonWear = seasons
  return obj
}

export function parseCreateItemForm(fd: FormData): CreateItemInput {
  return parse(createItemSchema, itemFieldsFromForm(fd)) as CreateItemInput
}

export function parseUpdateItemForm(fd: FormData): UpdateItemInput {
  return parse(updateItemSchema, itemFieldsFromForm(fd)) as UpdateItemInput
}

const previewSchema = z.object({
  category,
  hex: z.string().regex(HEX),
  accentHex: z.string().regex(HEX).optional(),
  pattern,
  subType: z.string().optional(),
  formality: formality.optional(),
  fit: fit.optional(),
  seasonWear: z.array(seasonWear).min(1),
  excludeId: z.string().optional(),
})

export function parsePreview(body: unknown): PreviewInput {
  return parse(previewSchema, body) as PreviewInput
}

const createOutfitSchema = z.object({
  name: z.string().min(1).max(80),
  itemIds: z.array(z.string()).min(1).max(60),
  folderId: z.string().nullish(),
})

const updateOutfitSchema = createOutfitSchema.partial()

export function parseCreateOutfit(body: unknown): CreateOutfitInput {
  return parse(createOutfitSchema, body)
}

export function parseUpdateOutfit(body: unknown): UpdateOutfitInput {
  return parse(updateOutfitSchema, body)
}

const folderSchema = z.object({ name: z.string().min(1).max(60) })

export function parseFolderName(body: unknown): string {
  return parse(folderSchema, body).name
}

const profileSchema = z.object({
  who: who.optional(),
  climate: climate.optional(),
  palettes: z.array(palette).optional(),
  hair: z.number().int().min(0).max(10).nullish(),
  eyes: z.number().int().min(0).max(10).nullish(),
  skin: z.number().int().min(0).max(10).nullish(),
  undertone: undertone.nullish(),
})

export function parseUpsertProfile(body: unknown): UpsertProfileInput {
  return parse(profileSchema, body)
}

const feedbackSchema = z.object({
  message: z.string().min(1).max(4000),
  page: z.string().max(200).optional(),
})

export function parseFeedback(body: unknown): {
  message: string
  page?: string
} {
  return parse(feedbackSchema, body)
}
