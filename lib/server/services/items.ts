import { Prisma, type Item as DbItem } from '@prisma/client'
import { prisma } from '../db'
import { badRequest, notFound } from '../http'
import { uploadImage, deleteImage, type UploadedImage } from '../storage'
import { optimizeForStorage, extractPalette, type ColorPalette } from '../image'
import {
  Brightness,
  Category,
  Fit,
  Formality,
  type Item,
  Pattern,
  Saturation,
  SeasonPalette,
  SeasonWear,
  Temperature,
  WardrobeRole,
} from '../domain/item-types'
import {
  deriveColor,
  deriveFormality,
  deriveItemData,
} from '../domain/item-derivation'
import { invalidateMatchMap } from '../domain/match-cache'

export type UploadedItemImage = UploadedImage

export type CreateItemInput = {
  name: string
  category: Category
  subType?: string | null
  hex?: string
  accentHex?: string | null
  pattern: Pattern
  formality?: Formality | null
  fit?: Fit | null
  seasonWear: SeasonWear[]
}

export type UpdateItemInput = Partial<CreateItemInput>

function toItem(row: DbItem): Item {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    name: row.name,
    category: row.category as Category,
    subType: row.subType,
    imageUrl: row.imageUrl,
    color: {
      hex: row.hex,
      hue: row.hue,
      temperature: row.temperature as Temperature,
      brightness: row.brightness as Brightness,
      saturation: row.saturation as Saturation,
      isNeutral: row.isNeutral,
    },
    accent: row.accentHex ? deriveColor(row.accentHex) : null,
    wardrobeRole: row.wardrobeRole as WardrobeRole,
    pattern: row.pattern as Pattern,
    formality:
      (row.formality as Formality | null) ??
      deriveFormality(row.category as Category, row.subType),
    fit: row.fit as Fit | null,
    seasonPaletteCompatibility:
      row.seasonPaletteCompatibility as SeasonPalette[],
    seasonWear: row.seasonWear as SeasonWear[],
  }
}

export async function listItems(userId: string): Promise<Item[]> {
  const rows = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(toItem)
}

export async function findItemsByIds(
  userId: string,
  ids: string[]
): Promise<Item[]> {
  const rows = await prisma.item.findMany({
    where: { userId, id: { in: ids } },
  })
  return rows.map(toItem)
}

export async function missingItemIds(
  userId: string,
  ids: string[]
): Promise<string[]> {
  const rows = await prisma.item.findMany({
    where: { userId, id: { in: ids } },
    select: { id: true },
  })
  const found = new Set(rows.map(r => r.id))
  return ids.filter(id => !found.has(id))
}

export async function getItem(userId: string, id: string): Promise<Item> {
  const row = await prisma.item.findFirst({ where: { id, userId } })
  if (!row) throw notFound(`Item ${id} not found`)
  return toItem(row)
}

export async function createItem(
  userId: string,
  input: CreateItemInput,
  image?: UploadedItemImage
): Promise<Item> {
  let hex = input.hex
  let accentHex = input.accentHex ?? null
  let imageUrl: string | null = null
  if (image) {
    imageUrl = await uploadImage(await optimizeForStorage(image))
    if (!hex) {
      const palette = await extractPalette(image.buffer)
      hex = palette.hex
      if (!accentHex) accentHex = palette.accentHex
    }
  }
  if (!hex) throw badRequest('Provide an image or a hex color')

  const derived = deriveItemData(hex)
  const data = {
    userId,
    name: input.name,
    category: input.category,
    subType: input.subType ?? null,
    pattern: input.pattern,
    formality:
      input.formality ?? deriveFormality(input.category, input.subType ?? null),
    fit: input.fit ?? null,
    seasonWear: input.seasonWear,
    imageUrl,
    hex: derived.color.hex,
    accentHex,
    hue: derived.color.hue,
    temperature: derived.color.temperature,
    brightness: derived.color.brightness,
    saturation: derived.color.saturation,
    isNeutral: derived.color.isNeutral,
    wardrobeRole: derived.wardrobeRole,
    seasonPaletteCompatibility: derived.seasonPaletteCompatibility,
  } as Prisma.ItemUncheckedCreateInput

  let row: DbItem
  try {
    row = await prisma.item.create({ data })
  } catch (err) {
    if (imageUrl) await deleteImage(imageUrl)
    throw err
  }
  invalidateMatchMap(userId)
  return toItem(row)
}

export async function updateItem(
  userId: string,
  id: string,
  input: UpdateItemInput,
  image?: UploadedItemImage
): Promise<Item> {
  const current = await getItem(userId, id)
  const data: Prisma.ItemUncheckedUpdateInput = {}
  if (input.name !== undefined) data.name = input.name
  if (input.category !== undefined) data.category = input.category
  if (input.subType !== undefined) data.subType = input.subType || null
  if (input.pattern !== undefined) data.pattern = input.pattern
  if (input.formality !== undefined) data.formality = input.formality ?? null
  if (input.fit !== undefined) data.fit = input.fit ?? null
  if (input.accentHex !== undefined) data.accentHex = input.accentHex || null
  if (input.seasonWear !== undefined) data.seasonWear = input.seasonWear
  if (input.hex !== undefined) {
    const derived = deriveItemData(input.hex)
    data.hex = derived.color.hex
    data.hue = derived.color.hue
    data.temperature = derived.color.temperature
    data.brightness = derived.color.brightness
    data.saturation = derived.color.saturation
    data.isNeutral = derived.color.isNeutral
    data.wardrobeRole = derived.wardrobeRole
    data.seasonPaletteCompatibility = derived.seasonPaletteCompatibility
  }

  let newImageUrl: string | null = null
  if (image) {
    newImageUrl = await uploadImage(await optimizeForStorage(image))
    data.imageUrl = newImageUrl
  }

  let row: DbItem
  try {
    row = await prisma.item.update({ where: { id }, data })
  } catch (err) {
    if (newImageUrl) await deleteImage(newImageUrl)
    throw err
  }

  if (image && current.imageUrl) await deleteImage(current.imageUrl)
  invalidateMatchMap(userId)
  return toItem(row)
}

export async function removeItem(
  userId: string,
  id: string
): Promise<{ deleted: true; id: string }> {
  const item = await getItem(userId, id)

  const outfits = await prisma.outfit.findMany({
    where: { userId, itemIds: { has: id } },
    select: { id: true, itemIds: true },
  })

  await prisma.$transaction([
    prisma.item.delete({ where: { id } }),
    ...outfits.map(o =>
      prisma.outfit.update({
        where: { id: o.id },
        data: { itemIds: o.itemIds.filter(itemId => itemId !== id) },
      })
    ),
  ])

  if (item.imageUrl) await deleteImage(item.imageUrl)
  invalidateMatchMap(userId)
  return { deleted: true, id }
}

export async function extractItemColor(
  image: UploadedItemImage
): Promise<ColorPalette> {
  return extractPalette(image.buffer)
}
