'use client'

import { getItemImageSrc, type Item, type Outfit } from '@/lib/items'

type Props = {
  outfits: Outfit[]
  items: Item[]
  onDelete: (id: string) => void
}

export function SavedOutfits({ outfits, items, onDelete }: Props) {
  if (outfits.length === 0) return null

  const byId = new Map(items.map(item => [item.id, item]))

  return (
    <section className='flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm'>
      <h2 className='text-sm font-medium text-foreground'>
        Saved outfits · {outfits.length}
      </h2>
      <ul className='flex flex-col gap-3'>
        {outfits.map(outfit => (
          <li key={outfit.id} className='flex items-center gap-3'>
            <div className='flex gap-1'>
              {outfit.itemIds.map(id => {
                const item = byId.get(id)
                if (!item) return null
                const src = getItemImageSrc(item)
                return (
                  <span
                    key={id}
                    title={item.name}
                    className='relative size-10 shrink-0 overflow-hidden rounded-md border border-border'
                    style={{ backgroundColor: item.color.hex }}
                  >
                    {src && (
                      <img
                        src={src}
                        alt=''
                        className='absolute inset-0 h-full w-full object-cover'
                      />
                    )}
                  </span>
                )
              })}
            </div>
            <span className='min-w-0 flex-1 truncate text-sm text-foreground'>
              {outfit.name}
            </span>
            <button
              type='button'
              onClick={() => onDelete(outfit.id)}
              aria-label='Delete outfit'
              className='text-xs text-muted-foreground'
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
