import { describe, it, expect, vi } from 'vitest'
import {
  HttpError,
  badRequest,
  notFound,
  jsonError,
  handle,
} from '@/lib/server/http'

describe('HttpError', () => {
  it('carries a status and message', () => {
    const e = new HttpError(418, 'teapot')
    expect(e.status).toBe(418)
    expect(e.message).toBe('teapot')
  })

  it('badRequest and notFound set the right status', () => {
    expect(badRequest('x').status).toBe(400)
    expect(notFound('x').status).toBe(404)
  })
})

describe('jsonError', () => {
  it('maps an HttpError to a JSON response', async () => {
    const res = jsonError(new HttpError(404, 'nope'))
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ message: 'nope' })
  })

  it('maps an unknown error to a 500', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = jsonError(new Error('boom'))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ message: 'Internal server error' })
    spy.mockRestore()
  })
})

describe('handle', () => {
  it('passes through a successful response', async () => {
    const res = await handle(async () => Response.json({ ok: true }))
    expect(await res.json()).toEqual({ ok: true })
  })

  it('catches thrown HttpErrors', async () => {
    const res = await handle(async () => {
      throw badRequest('bad input')
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ message: 'bad input' })
  })
})
