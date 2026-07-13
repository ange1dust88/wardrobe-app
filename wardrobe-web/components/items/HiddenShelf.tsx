'use client'

import { RotateCcwIcon, XIcon } from 'lucide-react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  SEASONS,
  getItemImageSrc,
  type Category,
  type Item,
  type Season,
} from '@/lib/items'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  items: Item[]
  excludedIds: Set<string>
  onRestore: (id: string) => void
  onRestoreAll: () => void
  onHideMany: (ids: string[]) => void
}

const OPPOSITE: Record<Season, Season> = {
  spring: 'autumn',
  summer: 'winter',
  autumn: 'spring',
  winter: 'summer',
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function bulkChip(disabled: boolean): string {
  return cn(
    'rounded-full border border-border px-3 py-[6px] text-[12.5px] font-semibold transition-colors',
    disabled
      ? 'cursor-default text-muted-foreground/40'
      : 'text-foreground hover:bg-secondary/60'
  )
}

export function HiddenShelf({
  open,
  onClose,
  items,
  excludedIds,
  onRestore,
  onRestoreAll,
  onHideMany,
}: Props) {
  if (!open) return null

  const hidden = items.filter(i => excludedIds.has(i.id))
  const visible = items.filter(i => !excludedIds.has(i.id))
  const ownedCats = CATEGORIES.filter(c => items.some(i => i.category === c))

  const seasonIds = (s: Season) =>
    visible
      .filter(
        i => i.seasonWear.includes(s) && !i.seasonWear.includes(OPPOSITE[s])
      )
      .map(i => i.id)
  const catIds = (c: Category) =>
    visible.filter(i => i.category === c).map(i => i.id)

  return (
    <div
      className='fixed top-[64px] right-[24px] z-40 flex max-h-[calc(100svh-96px)] w-[340px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-[16px] border border-border bg-card/95 shadow-[0_16px_44px_rgba(20,28,36,0.18)] backdrop-blur-md'
      style={{ animation: 'bar-dock 0.22s ease both' }}
    >
      <div className='flex flex-none items-center justify-between border-b border-border px-5 py-4'>
        <div className='flex items-baseline gap-2'>
          <span className='font-heading text-[17px] font-bold'>Hidden</span>
          <span className='font-mono text-[12px] text-muted-foreground'>
            {hidden.length}
          </span>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='flex size-[30px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary'
        >
          <XIcon className='size-4' />
        </button>
      </div>

      <div className='flex-none border-b border-border px-5 py-4'>
        <div className='font-mono mb-2 text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
          Hide a season
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {SEASONS.map(s => {
            const ids = seasonIds(s)
            return (
              <button
                key={s}
                type='button'
                disabled={ids.length === 0}
                onClick={() => onHideMany(ids)}
                className={bulkChip(ids.length === 0)}
              >
                {cap(s)} <span className='opacity-50'>{ids.length}</span>
              </button>
            )
          })}
        </div>

        <div className='font-mono mt-4 mb-2 text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase'>
          Hide a category
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {ownedCats.map(c => {
            const ids = catIds(c)
            return (
              <button
                key={c}
                type='button'
                disabled={ids.length === 0}
                onClick={() => onHideMany(ids)}
                className={bulkChip(ids.length === 0)}
              >
                {CATEGORY_LABELS[c]}{' '}
                <span className='opacity-50'>{ids.length}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className='dscroll min-h-0 flex-1 overflow-y-auto px-3 py-2'>
        {hidden.length === 0 ? (
          <div className='px-2 py-8 text-center text-[13px] leading-relaxed text-muted-foreground'>
            Nothing hidden. Tap the eye on a piece, or hide a whole season /
            category above.
          </div>
        ) : (
          hidden.map(item => {
            const img = getItemImageSrc(item)
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => onRestore(item.id)}
                title='Restore to wheel'
                className='group flex w-full items-center gap-3 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-secondary/60'
              >
                <span
                  className='relative size-10 flex-none overflow-hidden rounded-[9px] border border-border'
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
                <span className='min-w-0 flex-1 truncate text-[13.5px] font-medium'>
                  {item.name}
                </span>
                <RotateCcwIcon className='size-4 flex-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
              </button>
            )
          })
        )}
      </div>

      {hidden.length > 0 && (
        <div className='flex-none border-t border-border px-4 py-3'>
          <button
            type='button'
            onClick={onRestoreAll}
            className='w-full rounded-[11px] bg-foreground py-2.5 text-[13.5px] font-semibold text-background'
          >
            Restore all ({hidden.length})
          </button>
        </div>
      )}
    </div>
  )
}
