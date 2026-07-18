import { describe, it, expect, beforeEach, vi } from 'vitest'

const { db } = vi.hoisted(() => ({
  db: {
    outfit: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    item: { findMany: vi.fn() },
    folder: { findFirst: vi.fn() },
  },
}))

vi.mock('@/lib/server/db', () => ({ prisma: db }))
vi.mock('@/lib/server/storage', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  deleteAuthUser: vi.fn(),
}))
vi.mock('@/lib/server/image', () => ({
  optimizeForStorage: vi.fn(),
  extractPalette: vi.fn(),
}))

const { getOutfit, createOutfit, updateOutfit, removeOutfit } =
  await import('@/lib/server/services/outfits')

function outfitRow(over: Record<string, unknown> = {}) {
  return {
    id: 'o1',
    userId: 'u1',
    name: 'Look',
    itemIds: ['a', 'b'],
    folderId: null,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    ...over,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createOutfit', () => {
  it('dedupes item ids and creates when all exist', async () => {
    db.item.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }])
    db.outfit.create.mockResolvedValue(outfitRow())
    await createOutfit('u1', { name: 'Look', itemIds: ['a', 'b', 'a'] })
    expect(db.outfit.create.mock.calls[0][0].data.itemIds).toEqual(['a', 'b'])
  })

  it('rejects unknown item ids', async () => {
    db.item.findMany.mockResolvedValue([{ id: 'a' }])
    await expect(
      createOutfit('u1', { name: 'Look', itemIds: ['a', 'b'] })
    ).rejects.toMatchObject({ status: 400 })
  })

  it('rejects an unknown folder id', async () => {
    db.item.findMany.mockResolvedValue([{ id: 'a' }])
    db.folder.findFirst.mockResolvedValue(null)
    await expect(
      createOutfit('u1', { name: 'Look', itemIds: ['a'], folderId: 'ghost' })
    ).rejects.toMatchObject({ status: 400 })
  })
})

describe('getOutfit', () => {
  it('hydrates the outfit with its items', async () => {
    db.outfit.findFirst.mockResolvedValue(outfitRow())
    db.item.findMany.mockResolvedValue([])
    const outfit = await getOutfit('u1', 'o1')
    expect(outfit.createdAt).toBe('2026-01-02T00:00:00.000Z')
    expect(outfit).toHaveProperty('items')
  })

  it('throws 404 when missing', async () => {
    db.outfit.findFirst.mockResolvedValue(null)
    await expect(getOutfit('u1', 'x')).rejects.toMatchObject({ status: 404 })
  })
})

describe('updateOutfit', () => {
  it('updates only the provided fields', async () => {
    db.outfit.findFirst.mockResolvedValue(outfitRow())
    db.outfit.update.mockResolvedValue(outfitRow({ folderId: 'f1' }))
    const res = await updateOutfit('u1', 'o1', { folderId: null })
    expect(db.outfit.update.mock.calls[0][0].data).toEqual({ folderId: null })
    expect(res.id).toBe('o1')
  })

  it('throws 404 when the outfit is missing', async () => {
    db.outfit.findFirst.mockResolvedValue(null)
    await expect(
      updateOutfit('u1', 'x', { name: 'Nope' })
    ).rejects.toMatchObject({ status: 404 })
  })
})

describe('removeOutfit', () => {
  it('deletes an owned outfit', async () => {
    db.outfit.findFirst.mockResolvedValue(outfitRow())
    db.outfit.delete.mockResolvedValue(outfitRow())
    expect(await removeOutfit('u1', 'o1')).toEqual({ deleted: true, id: 'o1' })
  })

  it('throws 404 when missing', async () => {
    db.outfit.findFirst.mockResolvedValue(null)
    await expect(removeOutfit('u1', 'x')).rejects.toMatchObject({ status: 404 })
  })
})
