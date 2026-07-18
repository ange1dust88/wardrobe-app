import { describe, it, expect } from 'vitest'
import {
  parseCreateItemForm,
  parseUpdateItemForm,
  parsePreview,
  parseCreateOutfit,
  parseUpdateOutfit,
  parseFolderName,
  parseUpsertProfile,
  parseFeedback,
} from '@/lib/server/validation'

function itemForm(
  fields: Record<string, string>,
  seasons: string[] = ['spring']
): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  for (const s of seasons) fd.append('seasonWear', s)
  return fd
}

describe('parseCreateItemForm', () => {
  it('accepts a valid form', () => {
    const input = parseCreateItemForm(
      itemForm({
        name: 'Red tee',
        category: 'top',
        hex: '#cc2233',
        pattern: 'solid',
      })
    )
    expect(input).toMatchObject({
      name: 'Red tee',
      category: 'top',
      hex: '#cc2233',
      pattern: 'solid',
      seasonWear: ['spring'],
    })
  })

  it('rejects a missing name', () => {
    expect(() =>
      parseCreateItemForm(itemForm({ category: 'top', pattern: 'solid' }))
    ).toThrow()
  })

  it('rejects an unknown category', () => {
    expect(() =>
      parseCreateItemForm(
        itemForm({ name: 'x', category: 'hat', pattern: 'solid' })
      )
    ).toThrow()
  })

  it('rejects a malformed hex', () => {
    expect(() =>
      parseCreateItemForm(
        itemForm({ name: 'x', category: 'top', hex: 'red', pattern: 'solid' })
      )
    ).toThrow()
  })

  it('update form allows partial fields', () => {
    const fd = new FormData()
    fd.set('name', 'Renamed')
    expect(parseUpdateItemForm(fd)).toEqual({ name: 'Renamed' })
  })
})

describe('parsePreview', () => {
  it('accepts a valid preview body', () => {
    expect(
      parsePreview({
        category: 'bottom',
        hex: '#334455',
        pattern: 'solid',
        seasonWear: ['winter'],
      })
    ).toMatchObject({ category: 'bottom', hex: '#334455' })
  })

  it('requires a hex and season', () => {
    expect(() =>
      parsePreview({ category: 'bottom', pattern: 'solid', seasonWear: [] })
    ).toThrow()
  })
})

describe('parseCreateOutfit / parseUpdateOutfit', () => {
  it('accepts a valid outfit', () => {
    expect(
      parseCreateOutfit({ name: 'Look', itemIds: ['a', 'b'] })
    ).toMatchObject({ name: 'Look', itemIds: ['a', 'b'] })
  })

  it('rejects an empty item list', () => {
    expect(() => parseCreateOutfit({ name: 'Look', itemIds: [] })).toThrow()
  })

  it('rejects more than 60 items', () => {
    const itemIds = Array.from({ length: 61 }, (_, i) => `i${i}`)
    expect(() => parseCreateOutfit({ name: 'Look', itemIds })).toThrow()
  })

  it('update allows a folder move only', () => {
    expect(parseUpdateOutfit({ folderId: null })).toEqual({ folderId: null })
  })
})

describe('parseFolderName', () => {
  it('returns the name', () => {
    expect(parseFolderName({ name: 'Work' })).toBe('Work')
  })

  it('rejects an empty name', () => {
    expect(() => parseFolderName({ name: '' })).toThrow()
  })
})

describe('parseUpsertProfile', () => {
  it('accepts an empty body (everything optional)', () => {
    expect(parseUpsertProfile({})).toEqual({})
  })

  it('accepts a full body', () => {
    expect(
      parseUpsertProfile({
        who: 'women',
        palettes: ['winter'],
        hair: 3,
        eyes: 0,
        skin: 2,
        undertone: 'cool',
      })
    ).toMatchObject({ who: 'women', hair: 3, undertone: 'cool' })
  })

  it('rejects an out-of-range feature index', () => {
    expect(() => parseUpsertProfile({ hair: 99 })).toThrow()
  })

  it('rejects an unknown undertone', () => {
    expect(() => parseUpsertProfile({ undertone: 'purple' })).toThrow()
  })
})

describe('parseFeedback', () => {
  it('accepts a message', () => {
    expect(parseFeedback({ message: 'hi', page: '/x' })).toEqual({
      message: 'hi',
      page: '/x',
    })
  })

  it('rejects an empty message', () => {
    expect(() => parseFeedback({ message: '' })).toThrow()
  })
})
