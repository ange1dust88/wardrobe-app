import { describe, it, expect, beforeEach, vi } from 'vitest'

const { db, storage } = vi.hoisted(() => ({
  db: {
    folder: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    userProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    feedback: { create: vi.fn(), deleteMany: vi.fn() },
    item: { findMany: vi.fn(), deleteMany: vi.fn() },
    outfit: { deleteMany: vi.fn() },
  },
  storage: { deleteImage: vi.fn(), deleteAuthUser: vi.fn() },
}))

vi.mock('@/lib/server/db', () => ({ prisma: db }))
vi.mock('@/lib/server/storage', () => ({
  deleteImage: storage.deleteImage,
  deleteAuthUser: storage.deleteAuthUser,
  uploadImage: vi.fn(),
}))

const { createFolder, updateFolder, removeFolder } =
  await import('@/lib/server/services/folders')
const { getProfile, upsertProfile } =
  await import('@/lib/server/services/profile')
const { createFeedback } = await import('@/lib/server/services/feedback')
const { removeAccount } = await import('@/lib/server/services/account')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('folders', () => {
  it('creates a folder', async () => {
    db.folder.create.mockResolvedValue({
      id: 'f1',
      name: 'Work',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(await createFolder('u1', 'Work')).toEqual({
      id: 'f1',
      name: 'Work',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('rejects updates to a folder the user does not own', async () => {
    db.folder.findFirst.mockResolvedValue(null)
    await expect(updateFolder('u1', 'f1', 'X')).rejects.toMatchObject({
      status: 404,
    })
  })

  it('deletes an owned folder', async () => {
    db.folder.findFirst.mockResolvedValue({ id: 'f1' })
    db.folder.delete.mockResolvedValue({})
    expect(await removeFolder('u1', 'f1')).toEqual({ deleted: true, id: 'f1' })
  })
})

describe('profile', () => {
  it('reads a profile', async () => {
    db.userProfile.findUnique.mockResolvedValue({ userId: 'u1' })
    expect(await getProfile('u1')).toEqual({ userId: 'u1' })
  })

  it('upserts with null/empty defaults and stamps onboardedAt', async () => {
    db.userProfile.upsert.mockResolvedValue({ userId: 'u1' })
    await upsertProfile('u1', { palettes: ['winter'], hair: 2 })
    const arg = db.userProfile.upsert.mock.calls[0][0]
    expect(arg.where).toEqual({ userId: 'u1' })
    expect(arg.update.who).toBeNull()
    expect(arg.update.climate).toBeNull()
    expect(arg.update.palettes).toEqual(['winter'])
    expect(arg.update.hair).toBe(2)
    expect(arg.update.eyes).toBeNull()
    expect(arg.update.onboardedAt).toBeInstanceOf(Date)
  })
})

describe('feedback', () => {
  it('stores a feedback row with the user email', async () => {
    db.feedback.create.mockResolvedValue({})
    expect(
      await createFeedback(
        { id: 'u1', email: 'a@b.co' },
        { message: 'hi', page: '/x' }
      )
    ).toEqual({ ok: true })
    expect(db.feedback.create.mock.calls[0][0].data).toMatchObject({
      userId: 'u1',
      email: 'a@b.co',
      message: 'hi',
      page: '/x',
    })
  })
})

describe('removeAccount', () => {
  it('wipes data, images and the auth user', async () => {
    db.item.findMany.mockResolvedValue([
      { imageUrl: 'https://x/img.webp' },
      { imageUrl: null },
    ])
    db.outfit.deleteMany.mockResolvedValue({})
    db.folder.deleteMany.mockResolvedValue({})
    db.item.deleteMany.mockResolvedValue({})
    db.userProfile.upsert.mockResolvedValue({})
    db.feedback.deleteMany.mockResolvedValue({})
    storage.deleteAuthUser.mockResolvedValue(true)

    expect(await removeAccount('u1')).toEqual({ deleted: true })
    expect(storage.deleteImage).toHaveBeenCalledWith('https://x/img.webp')
    expect(storage.deleteImage).toHaveBeenCalledTimes(1)
    expect(storage.deleteAuthUser).toHaveBeenCalledWith('u1')
  })

  it('throws 502 if the auth user cannot be deleted', async () => {
    db.item.findMany.mockResolvedValue([])
    db.outfit.deleteMany.mockResolvedValue({})
    db.folder.deleteMany.mockResolvedValue({})
    db.item.deleteMany.mockResolvedValue({})
    db.feedback.deleteMany.mockResolvedValue({})
    storage.deleteAuthUser.mockResolvedValue(false)
    await expect(removeAccount('u1')).rejects.toMatchObject({ status: 502 })
  })
})
