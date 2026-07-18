import { describe, it, expect } from 'vitest'
import {
  categoriesConflict,
  categoryStacks,
} from '@/lib/server/domain/category-compat'
import { seasonsConflict, warmthGap } from '@/lib/server/domain/season-compat'
import { Category, SeasonWear } from '@/lib/server/domain/item-types'

describe('categoriesConflict', () => {
  it('a dress conflicts with tops and bottoms', () => {
    expect(categoriesConflict(Category.Top, Category.Dress)).toBe(true)
    expect(categoriesConflict(Category.Dress, Category.Bottom)).toBe(true)
  })

  it('unrelated categories do not conflict', () => {
    expect(categoriesConflict(Category.Top, Category.Bottom)).toBe(false)
    expect(categoriesConflict(Category.Top, Category.Shoes)).toBe(false)
  })

  it('a category never conflicts with itself', () => {
    expect(categoriesConflict(Category.Dress, Category.Dress)).toBe(false)
  })
})

describe('categoryStacks', () => {
  it('layering categories stack', () => {
    expect(categoryStacks(Category.Top)).toBe(true)
    expect(categoryStacks(Category.Outerwear)).toBe(true)
    expect(categoryStacks(Category.Bottom)).toBe(true)
    expect(categoryStacks(Category.Accessory)).toBe(true)
  })

  it('single-slot categories do not stack', () => {
    expect(categoryStacks(Category.Shoes)).toBe(false)
    expect(categoryStacks(Category.Dress)).toBe(false)
    expect(categoryStacks(Category.Headwear)).toBe(false)
  })
})

describe('warmthGap / seasonsConflict', () => {
  it('overlapping warmth ranges have no gap', () => {
    expect(warmthGap([SeasonWear.Spring], [SeasonWear.Autumn])).toBe(0)
    expect(warmthGap([], [SeasonWear.Winter])).toBe(0)
  })

  it('summer and winter are two warmth steps apart', () => {
    expect(warmthGap([SeasonWear.Summer], [SeasonWear.Winter])).toBe(2)
    expect(seasonsConflict([SeasonWear.Summer], [SeasonWear.Winter])).toBe(true)
  })

  it('a one-step gap is not a conflict', () => {
    expect(warmthGap([SeasonWear.Summer], [SeasonWear.Spring])).toBe(1)
    expect(seasonsConflict([SeasonWear.Summer], [SeasonWear.Spring])).toBe(
      false
    )
  })
})
