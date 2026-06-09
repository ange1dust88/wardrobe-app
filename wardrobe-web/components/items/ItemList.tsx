import { CATEGORIES, CATEGORY_LABELS, type Item } from '../../lib/items'
import { type CardState, ItemCard } from './ItemCard'

type Props = {
  items: Item[]
  onDelete: (id: string) => void
  hoveredId: string | null
  selectedIds: string[]
  matchedIds: Set<string>
  scoreById: Record<string, number>
  onSelect: (item: Item) => void
  onHover: (id: string | null) => void
}

export function ItemList({
  items,
  onDelete,
  hoveredId,
  selectedIds = [],
  matchedIds = new Set(),
  scoreById = {},
  onSelect,
  onHover,
}: Props) {
  const building = selectedIds.length > 0

  function cardState(item: Item): CardState {
    if (building) {
      if (selectedIds.includes(item.id)) return 'selected'
      if (matchedIds.has(item.id)) return 'match'
      return 'dim'
    }
    if (!hoveredId) return 'normal'
    if (item.id === hoveredId) return 'anchor'
    if (matchedIds.has(item.id)) return 'match'
    return 'dim'
  }

  const groups = CATEGORIES.map(category => ({
    category,
    items: items.filter(item => item.category === category),
  })).filter(group => group.items.length > 0)

  return (
    <div className='grid gap-6 border border-black p-4 sm:grid-cols-2 lg:grid-cols-4'>
      {groups.map(group => (
        <section key={group.category} className='flex min-w-0 flex-col gap-3'>
          <h2 className='text-sm font-medium text-black'>
            {CATEGORY_LABELS[group.category]}
          </h2>
          <div className='grid grid-cols-2 gap-3'>
            {group.items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                state={cardState(item)}
                score={scoreById[item.id]}
                onDelete={onDelete}
                onSelect={onSelect}
                onHover={onHover}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
