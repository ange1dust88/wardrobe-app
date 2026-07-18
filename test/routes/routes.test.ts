import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { NextRequest } from 'next/server'
import { HttpError } from '@/lib/server/http'

vi.mock('@/lib/server/auth', () => ({ getUser: vi.fn() }))
vi.mock('@/lib/server/services/items', () => ({
  listItems: vi.fn(),
  createItem: vi.fn(),
  getItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  extractItemColor: vi.fn(),
}))
vi.mock('@/lib/server/services/folders', () => ({
  listFolders: vi.fn(),
  createFolder: vi.fn(),
  updateFolder: vi.fn(),
  removeFolder: vi.fn(),
}))

const { getUser } = await import('@/lib/server/auth')
const { listItems } = await import('@/lib/server/services/items')
const { createFolder } = await import('@/lib/server/services/folders')
const itemsRoute = await import('@/app/api/items/route')
const foldersRoute = await import('@/app/api/folders/route')
const healthRoute = await import('@/app/api/health/route')

const authed = vi.mocked(getUser)

function req(
  url = 'http://localhost/api/items',
  init?: RequestInit
): NextRequest {
  return new Request(url, init) as unknown as NextRequest
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const res = await healthRoute.GET()
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(typeof body.uptime).toBe('number')
  })
})

describe('GET /api/items', () => {
  it('returns the wardrobe for an authed user', async () => {
    authed.mockResolvedValue({ id: 'u1' })
    vi.mocked(listItems).mockResolvedValue([{ id: 'i1' } as never])
    const res = await itemsRoute.GET(req())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([{ id: 'i1' }])
  })

  it('returns 401 with a message when the token is missing', async () => {
    authed.mockRejectedValue(new HttpError(401, 'Missing bearer token'))
    const res = await itemsRoute.GET(req())
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ message: 'Missing bearer token' })
  })

  it('maps a service error to its status', async () => {
    authed.mockResolvedValue({ id: 'u1' })
    vi.mocked(listItems).mockRejectedValue(new HttpError(503, 'db down'))
    const res = await itemsRoute.GET(req())
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ message: 'db down' })
  })
})

describe('POST /api/folders', () => {
  it('validates the body and creates a folder', async () => {
    authed.mockResolvedValue({ id: 'u1' })
    vi.mocked(createFolder).mockResolvedValue({
      id: 'f1',
      name: 'Work',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    const res = await foldersRoute.POST(
      req('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({ name: 'Work' }),
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ id: 'f1', name: 'Work' })
    expect(vi.mocked(createFolder)).toHaveBeenCalledWith('u1', 'Work')
  })

  it('rejects an invalid body with 400', async () => {
    authed.mockResolvedValue({ id: 'u1' })
    const res = await foldersRoute.POST(
      req('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(res.status).toBe(400)
    expect(vi.mocked(createFolder)).not.toHaveBeenCalled()
  })
})
