import { CATEGORIES, CATEGORY_LABELS, type Item } from '../../lib/items'
import { ItemCard } from './ItemCard'

type Props = {
  items: Item[]
  onDelete: (id: string) => void
}

export function ItemList({ items, onDelete }: Props) {
  const groups = CATEGORIES.map(category => ({
    category,
    items: items.filter(item => item.category === category),
  })).filter(group => group.items.length > 0)

  return (
    <div className='flex flex-col gap-6 border border-black p-4'>
      {groups.map(group => (
        <div key={group.category} className='flex items-center gap-4'>
          <div className='grid flex-1 grid-cols-4 gap-3'>
            {group.items.map(item => (
              <ItemCard key={item.id} item={item} onDelete={onDelete} />
            ))}
          </div>
          <span className='w-24 shrink-0 text-sm text-black'>
            {CATEGORY_LABELS[group.category]}
          </span>
        </div>
      ))}
    </div>
  )
}
