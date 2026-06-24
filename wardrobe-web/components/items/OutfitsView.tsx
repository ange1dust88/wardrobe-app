'use client'

import { getItemImageSrc, type Item } from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { Button } from '@/components/ui/button'

export type SavedLook = {
  id: string
  name: string
  harmony: number
  items: Item[]
}

type Props = {
  looks: SavedLook[]
  onDelete: (id: string) => void
  onBuild: () => void
}

export function OutfitsView({ looks, onDelete, onBuild }: Props) {
  return (
    <div className='px-6 pt-7 pb-[70px] sm:px-8'>
      <div className='mx-auto max-w-[1500px]'>
      <div className='mb-6 flex items-end justify-between'>
        <div>
          <h1 className='font-heading text-[28px] leading-none font-bold tracking-tight'>
            Saved outfits
          </h1>
          <p className='mt-1.5 text-[13.5px] text-muted-foreground'>
            {looks.length} look{looks.length === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={onBuild}>Build a look</Button>
      </div>

      {looks.length === 0 ? (
        <div className='flex flex-col items-center justify-center px-5 py-20 text-center'>
          <div className='mb-5 flex gap-1.5 opacity-50'>
            <span className='size-11 rounded-[11px] bg-muted' />
            <span className='size-11 rounded-[11px] bg-border' />
            <span className='size-11 rounded-[11px] bg-muted' />
          </div>
          <h2 className='font-heading mb-1.5 text-[21px] font-bold'>
            No saved outfits yet
          </h2>
          <p className='mb-5 max-w-[320px] text-sm text-muted-foreground'>
            Build a look on the wheel and save it — it&apos;ll live here.
          </p>
          <Button onClick={onBuild}>Build an outfit</Button>
        </div>
      ) : (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] gap-5'>
          {looks.map(look => (
            <div
              key={look.id}
              className='rounded-[18px] border border-border bg-card p-[18px] shadow-sm'
            >
              <div className='mb-3.5 flex items-center justify-between'>
                <span
                  className='font-heading rounded-lg px-2.5 py-0.5 text-[12.5px] font-bold text-white'
                  style={{ background: getMatchScoreTone(look.harmony).solidColor }}
                >
                  {look.harmony} / 36
                </span>
                <button
                  type='button'
                  onClick={() => onDelete(look.id)}
                  aria-label='Delete outfit'
                  className='flex size-6.5 items-center justify-center rounded-full bg-muted text-muted-foreground'
                >
                  ×
                </button>
              </div>
              <div className='mb-3.5 flex gap-2'>
                {look.items.slice(0, 5).map(item => {
                  const img = getItemImageSrc(item)
                  return (
                    <span
                      key={item.id}
                      title={item.name}
                      className='relative size-11 overflow-hidden rounded-[10px] border border-border'
                      style={{ background: item.color.hex }}
                    >
                      {img && (
                        <img
                          src={img}
                          alt=''
                          className='absolute inset-0 h-full w-full object-cover'
                        />
                      )}
                    </span>
                  )
                })}
              </div>
              <div className='text-[15px] font-semibold'>{look.name}</div>
              <div className='mt-0.5 text-[12px] text-muted-foreground'>
                {look.items.length} piece{look.items.length === 1 ? '' : 's'}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
