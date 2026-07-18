import { Category } from './item-types'

const CATEGORY_CONFLICTS: [Category, Category][] = [
  [Category.Top, Category.Dress],
  [Category.Bottom, Category.Dress],
]

const CONFLICT_SET = new Set(
  CATEGORY_CONFLICTS.map(([a, b]) => [a, b].sort().join('|'))
)

export function categoriesConflict(a: Category, b: Category): boolean {
  if (a === b) return false
  return CONFLICT_SET.has([a, b].sort().join('|'))
}

const STACKABLE_CATEGORIES = new Set<Category>([
  Category.Top,
  Category.Outerwear,
  Category.Bottom,
  Category.Accessory,
])

export function categoryStacks(category: Category): boolean {
  return STACKABLE_CATEGORIES.has(category)
}
