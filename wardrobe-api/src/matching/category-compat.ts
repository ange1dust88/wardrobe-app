import { Category } from '../items/dto/item.dto';

const CATEGORY_CONFLICTS: [Category, Category][] = [
  [Category.Top, Category.Dress],
  [Category.Bottom, Category.Dress],
];

const CONFLICT_SET = new Set(
  CATEGORY_CONFLICTS.map(([a, b]) => [a, b].sort().join('|')),
);

export function categoriesConflict(a: Category, b: Category): boolean {
  if (a === b) return false;
  return CONFLICT_SET.has([a, b].sort().join('|'));
}
