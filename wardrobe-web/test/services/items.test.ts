import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Category, Pattern, SeasonWear } from '@/lib/server/domain/item-types'

const { db } = vi.hoisted(() => ({
  db: {
    item: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    outfit: { findMany: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
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

const {
  listItems,
  getItem,
  missingItemIds,
  createItem,
  updateItem,
  removeItem,
} = await import('@/lib/server/services/items')
const { uploadImage, deleteImage } = await import('@/lib/server/storage')
const { optimizeForStorage, extractPalette } =
  await import('@/lib/server/image')

const fakeImage = {
  buffer: Buffer.from('x'),
  originalname: 'p.jpg',
  mimetype: 'image/jpeg',
}
const optimized = {
  buffer: Buffer.from('y'),
  originalname: 'i.webp',
  mimetype: 'image/webp',
}

function dbRow(over: Record<string, unknown> = {}) {
  return {
    id: 'i1',
    userId: 'u1',
    createdAt: new Date('2026-01-02T03:04:05.000Z'),
    name: 'Gray tee',
    category: 'top',
    subType: null,
    imageUrl: null,
    hex: '#808080',
    accentHex: null,
    hue: 0,
    temperature: 'neutral',
    brightness: 'medium',
    saturation: 'muted',
    isNeutral: true,
    wardrobeRole: 'core',
    pattern: 'solid',
    formality: 'casual',
    fit: 'regular',
    seasonPaletteCompatibility: ['universal'],
    seasonWear: ['spring', 'summer'],
    ...over,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listItems', () => {
  it('maps db rows into domain items', async () => {
    db.item.findMany.mockResolvedValue([dbRow()])
    const [item] = await listItems('u1')
    expect(item.createdAt).toBe('2026-01-02T03:04:05.000Z')
    expect(item.color).toEqual({
      hex: '#808080',
      hue: 0,
      temperature: 'neutral',
      brightness: 'medium',
      saturation: 'muted',
      isNeutral: true,
    })
    expect(item.seasonWear).toEqual(['spring', 'summer'])
    expect(item.accent).toBeNull()
  })

  it('falls back to derived formality when null', async () => {
    db.item.findMany.mockResolvedValue([
      dbRow({ formality: null, category: 'dress' }),
    ])
    const [item] = await listItems('u1')
    expect(item.formality).toBe('smart_casual')
  })

  it('derives an accent colour when accentHex is present', async () => {
    db.item.findMany.mockResolvedValue([dbRow({ accentHex: '#ff0000' })])
    const [item] = await listItems('u1')
    expect(item.accent?.temperature).toBe('warm')
  })
})

describe('getItem', () => {
  it('throws 404 when the item is missing', async () => {
    db.item.findFirst.mockResolvedValue(null)
    await expect(getItem('u1', 'x')).rejects.toMatchObject({ status: 404 })
  })
})

describe('missingItemIds', () => {
  it('returns ids not found in the wardrobe', async () => {
    db.item.findMany.mockResolvedValue([{ id: 'a' }])
    expect(await missingItemIds('u1', ['a', 'b', 'c'])).toEqual(['b', 'c'])
  })
})

describe('createItem', () => {
  it('requires a hex when no image is given', async () => {
    await expect(
      createItem('u1', {
        name: 'x',
        category: Category.Top,
        pattern: Pattern.Solid,
        seasonWear: [SeasonWear.Spring],
      })
    ).rejects.toMatchObject({ status: 400 })
  })

  it('writes derived colour data and returns the mapped item', async () => {
    db.item.create.mockResolvedValue(
      dbRow({
        hex: '#ff0000',
        temperature: 'warm',
        saturation: 'vivid',
        isNeutral: false,
        wardrobeRole: 'pop',
        seasonPaletteCompatibility: ['spring'],
      })
    )
    const item = await createItem('u1', {
      name: 'Red tee',
      category: Category.Top,
      hex: '#ff0000',
      pattern: Pattern.Solid,
      seasonWear: [SeasonWear.Spring],
    })
    expect(db.item.create).toHaveBeenCalledOnce()
    const data = db.item.create.mock.calls[0][0].data
    expect(data.wardrobeRole).toBe('pop')
    expect(data.temperature).toBe('warm')
    expect(item.color.temperature).toBe('warm')
  })
})

describe('removeItem', () => {
  it('deletes the item and strips it from outfits in a transaction', async () => {
    db.item.findFirst.mockResolvedValue(dbRow({ imageUrl: null }))
    db.outfit.findMany.mockResolvedValue([{ id: 'o1', itemIds: ['i1', 'x'] }])
    db.$transaction.mockResolvedValue([])
    const res = await removeItem('u1', 'i1')
    expect(res).toEqual({ deleted: true, id: 'i1' })
    expect(db.$transaction).toHaveBeenCalledOnce()
  })
})

describe('createItem with an image', () => {
  it('optimises, uploads and extracts colour when no hex is given', async () => {
    vi.mocked(optimizeForStorage).mockResolvedValue(optimized)
    vi.mocked(uploadImage).mockResolvedValue('https://cdn/i.webp')
    vi.mocked(extractPalette).mockResolvedValue({
      hex: '#3355aa',
      accentHex: '#ffcc00',
    })
    db.item.create.mockResolvedValue(
      dbRow({ imageUrl: 'https://cdn/i.webp', hex: '#3355aa' })
    )
    const item = await createItem(
      'u1',
      {
        name: 'Blue',
        category: Category.Top,
        pattern: Pattern.Solid,
        seasonWear: [SeasonWear.Spring],
      },
      fakeImage
    )
    expect(uploadImage).toHaveBeenCalledOnce()
    expect(extractPalette).toHaveBeenCalledOnce()
    const data = db.item.create.mock.calls[0][0].data
    expect(data.imageUrl).toBe('https://cdn/i.webp')
    expect(data.hex).toBe('#3355aa')
    expect(item.imageUrl).toBe('https://cdn/i.webp')
  })

  it('rolls back the uploaded image if the db write fails', async () => {
    vi.mocked(optimizeForStorage).mockResolvedValue(optimized)
    vi.mocked(uploadImage).mockResolvedValue('https://cdn/i.webp')
    vi.mocked(extractPalette).mockResolvedValue({
      hex: '#3355aa',
      accentHex: null,
    })
    db.item.create.mockRejectedValue(new Error('db fail'))
    await expect(
      createItem(
        'u1',
        {
          name: 'x',
          category: Category.Top,
          pattern: Pattern.Solid,
          seasonWear: [SeasonWear.Spring],
        },
        fakeImage
      )
    ).rejects.toThrow('db fail')
    expect(deleteImage).toHaveBeenCalledWith('https://cdn/i.webp')
  })
})

describe('updateItem', () => {
  it('re-derives colour data when the hex changes', async () => {
    db.item.findFirst.mockResolvedValue(dbRow({ imageUrl: null }))
    db.item.update.mockResolvedValue(dbRow({ hex: '#00aa00' }))
    const item = await updateItem('u1', 'i1', { hex: '#00aa00' })
    const data = db.item.update.mock.calls[0][0].data
    expect(data.hex).toBe('#00aa00')
    expect(data.wardrobeRole).toBeDefined()
    expect(item.color.hex).toBe('#00aa00')
  })

  it('swaps the image and deletes the previous one', async () => {
    db.item.findFirst.mockResolvedValue(
      dbRow({ imageUrl: 'https://cdn/old.webp' })
    )
    vi.mocked(optimizeForStorage).mockResolvedValue(optimized)
    vi.mocked(uploadImage).mockResolvedValue('https://cdn/new.webp')
    db.item.update.mockResolvedValue(
      dbRow({ imageUrl: 'https://cdn/new.webp' })
    )
    await updateItem('u1', 'i1', { name: 'Renamed' }, fakeImage)
    expect(uploadImage).toHaveBeenCalledOnce()
    expect(deleteImage).toHaveBeenCalledWith('https://cdn/old.webp')
  })
})
