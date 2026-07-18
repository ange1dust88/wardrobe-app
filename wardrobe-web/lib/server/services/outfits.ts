import { prisma } from '../db'
import { badRequest, notFound } from '../http'
import { findItemsByIds, missingItemIds } from './items'
import type { Item } from '../domain/item-types'

export type Outfit = {
  id: string
  name: string
  itemIds: string[]
  folderId: string | null
  createdAt: string
}

export type OutfitWithItems = Outfit & { items: Item[] }

export type CreateOutfitInput = {
  name: string
  itemIds: string[]
  folderId?: string | null
}

export type UpdateOutfitInput = Partial<CreateOutfitInput>

type DbOutfit = {
  id: string
  name: string
  itemIds: string[]
  folderId: string | null
  createdAt: Date
}

function toOutfit(row: DbOutfit): Outfit {
  return {
    id: row.id,
    name: row.name,
    itemIds: row.itemIds,
    folderId: row.folderId,
    createdAt: row.createdAt.toISOString(),
  }
}

function dedupe(ids: string[]): string[] {
  return [...new Set(ids)]
}

async function assertItemsExist(userId: string, ids: string[]): Promise<void> {
  const missing = await missingItemIds(userId, ids)
  if (missing.length > 0) {
    throw badRequest(`Unknown item ids: ${missing.join(', ')}`)
  }
}

async function assertFolderExists(
  userId: string,
  folderId: string | null
): Promise<void> {
  if (!folderId) return
  const found = await prisma.folder.findFirst({
    where: { id: folderId, userId },
  })
  if (!found) throw badRequest(`Unknown folder id: ${folderId}`)
}

export async function listOutfits(userId: string): Promise<Outfit[]> {
  const rows = await prisma.outfit.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(toOutfit)
}

export async function getOutfit(
  userId: string,
  id: string
): Promise<OutfitWithItems> {
  const row = await prisma.outfit.findFirst({ where: { id, userId } })
  if (!row) throw notFound(`Outfit ${id} not found`)
  const outfit = toOutfit(row)
  const items = await findItemsByIds(userId, outfit.itemIds)
  return { ...outfit, items }
}

export async function createOutfit(
  userId: string,
  input: CreateOutfitInput
): Promise<Outfit> {
  const itemIds = dedupe(input.itemIds)
  await assertItemsExist(userId, itemIds)
  const folderId = input.folderId ?? null
  await assertFolderExists(userId, folderId)
  const row = await prisma.outfit.create({
    data: { userId, name: input.name, itemIds, folderId },
  })
  return toOutfit(row)
}

export async function updateOutfit(
  userId: string,
  id: string,
  input: UpdateOutfitInput
): Promise<Outfit> {
  const existing = await prisma.outfit.findFirst({ where: { id, userId } })
  if (!existing) throw notFound(`Outfit ${id} not found`)
  const data: { name?: string; itemIds?: string[]; folderId?: string | null } =
    {}
  if (input.name !== undefined) data.name = input.name
  if (input.itemIds !== undefined) {
    const itemIds = dedupe(input.itemIds)
    await assertItemsExist(userId, itemIds)
    data.itemIds = itemIds
  }
  if (input.folderId !== undefined) {
    await assertFolderExists(userId, input.folderId)
    data.folderId = input.folderId
  }
  const row = await prisma.outfit.update({ where: { id }, data })
  return toOutfit(row)
}

export async function removeOutfit(
  userId: string,
  id: string
): Promise<{ deleted: true; id: string }> {
  const existing = await prisma.outfit.findFirst({ where: { id, userId } })
  if (!existing) throw notFound(`Outfit ${id} not found`)
  await prisma.outfit.delete({ where: { id } })
  return { deleted: true, id }
}
