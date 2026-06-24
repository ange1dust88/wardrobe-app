import { PencilIcon } from 'lucide-react'
import { CATEGORIES, getItemImageSrc, type Item } from '@/lib/items'
import { cn } from '@/lib/utils'

type Props = {
  items: Item[]
  selectedIds: string[]
  onSelect: (item: Item) => void
  onEdit: (item: Item) => void
}

export function WardrobeGrid({ items, selectedIds, onSelect, onEdit }: Props) {
  const ordered = [...items].sort((a, b) => {
    const ca = CATEGORIES.indexOf(a.category)
    const cb = CATEGORIES.indexOf(b.category)
    return ca !== cb ? ca - cb : a.name.localeCompare(b.name)
  })

  return (
    <div className='rounded-[20px] border border-border bg-card p-[18px] shadow-sm'>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3.5'>
        {ordered.map(item => {
          const img = getItemImageSrc(item)
          const selected = selectedIds.includes(item.id)
          return (
            <div key={item.id} className='group relative text-left'>
              <button
                type='button'
                onClick={() => onSelect(item)}
                className='block w-full text-left'
              >
                <span
                  className={cn(
                    'relative block aspect-square w-full overflow-hidden rounded-[14px] border',
                    selected
                      ? 'border-transparent ring-2 ring-[#3d5a3d] ring-offset-2 ring-offset-card'
                      : 'border-border'
                  )}
                  style={{ background: item.color.hex }}
                >
                  {img && (
                    <img
                      src={img}
                      alt=''
                      className='absolute inset-0 h-full w-full object-cover'
                    />
                  )}
                  {selected && (
                    <span className='absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-[#3d5a3d] text-[13px] text-white shadow'>
                      ✓
                    </span>
                  )}
                </span>
                <div className='mt-2 truncate text-[13px] font-medium'>
                  {item.name}
                </div>
                <div className='text-[11px] tracking-wide text-muted-foreground uppercase'>
                  {item.category}
                </div>
              </button>
              <button
                type='button'
                onClick={() => onEdit(item)}
                aria-label={`Edit ${item.name}`}
                className='absolute top-2 left-2 hidden size-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm group-hover:flex'
              >
                <PencilIcon className='size-3.5' />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
