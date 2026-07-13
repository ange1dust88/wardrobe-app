'use client'

import { EyeOff, LayoutList, Plus, Search, Target } from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { WardrobeView } from '@/components/AppContext'
import { cn } from '@/lib/utils'

type Props = {
  itemCount: number
  catCount: number
  savedCount: number
  view: WardrobeView
  onView: (view: WardrobeView) => void
  searchOpen: boolean
  onToggleSearch: () => void
  hiddenCount: number
  hiddenOpen: boolean
  onToggleHidden: () => void
  onAddItem: () => void
}

function viewTab(active: boolean): string {
  return cn(
    'flex size-[30px] items-center justify-center rounded-lg transition-colors',
    active
      ? 'bg-card text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground'
  )
}

export function AppTopStrip({
  itemCount,
  catCount,
  savedCount,
  view,
  onView,
  searchOpen,
  onToggleSearch,
  hiddenCount,
  hiddenOpen,
  onToggleHidden,
  onAddItem,
}: Props) {
  const pathname = usePathname()
  const isWardrobe = pathname === '/'
  const isOutfits = pathname === '/outfits'

  let title = 'Wardrobe'
  let subtitle = `${itemCount} item${itemCount === 1 ? '' : 's'} · ${catCount} categor${
    catCount === 1 ? 'y' : 'ies'
  }`
  if (isOutfits) {
    title = 'Saved outfits'
    subtitle = `${savedCount} look${savedCount === 1 ? '' : 's'}`
  } else if (pathname === '/analytics') {
    title = 'Analytics'
    subtitle = 'Your wardrobe, by the numbers'
  } else if (pathname === '/how-it-works') {
    title = 'How it works'
    subtitle = 'The seven axes of a match'
  }

  return (
    <div className='sticky top-0 z-30 flex items-center justify-between gap-4 bg-background/70 px-6 py-[15px] backdrop-blur-md sm:px-[26px]'>
      <div className='min-w-0'>
        <div className='font-heading truncate text-[20px] font-bold tracking-[-0.03em] text-foreground'>
          {title}
        </div>
        <div className='truncate text-[12px] text-muted-foreground'>
          {subtitle}
        </div>
      </div>

      <div className='flex flex-none items-center gap-2.5'>
        {isWardrobe && (
          <button
            type='button'
            onClick={onToggleSearch}
            aria-label='Search wardrobe'
            className={cn(
              'flex size-[38px] items-center justify-center rounded-full border transition-colors',
              searchOpen
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card/90 text-muted-foreground hover:text-foreground'
            )}
          >
            <Search className='size-4' />
          </button>
        )}
        {isWardrobe && (
          <button
            type='button'
            onClick={onToggleHidden}
            aria-label='Hidden pieces'
            title='Hidden pieces'
            className={cn(
              'relative flex size-[38px] items-center justify-center rounded-full border transition-colors',
              hiddenOpen
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card/90 text-muted-foreground hover:text-foreground'
            )}
          >
            <EyeOff className='size-4' />
            {hiddenCount > 0 && (
              <span
                className='font-mono absolute -top-1 -right-1 flex min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-[#1b1e20]'
                style={{ background: '#7fae7f' }}
              >
                {hiddenCount}
              </span>
            )}
          </button>
        )}
        {isWardrobe && (
          <div className='flex gap-[3px] rounded-[8px] bg-secondary/90 p-1'>
            <button
              type='button'
              onClick={() => onView('circular')}
              aria-label='Circular view'
              className={viewTab(view === 'circular')}
            >
              <Target className='size-[15px]' />
            </button>
            <button
              type='button'
              onClick={() => onView('list')}
              aria-label='List view'
              className={viewTab(view === 'list')}
            >
              <LayoutList className='size-[15px]' />
            </button>
          </div>
        )}
        <button
          type='button'
          onClick={onAddItem}
          className='hidden items-center gap-1.5 rounded-[8px] bg-foreground px-[15px] py-[9px] text-[13px] font-semibold text-background sm:flex'
        >
          <Plus className='size-[15px]' /> Add item
        </button>
      </div>
    </div>
  )
}
