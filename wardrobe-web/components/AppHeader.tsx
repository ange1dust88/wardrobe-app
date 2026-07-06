'use client'

import { LayoutList, PlusIcon, Target } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { WardrobeView } from '@/components/AppContext'
import { BrandMark } from '@/components/BrandMark'
import { BRAND_ACCENT } from '@/lib/theme'
import { cn } from '@/lib/utils'

type Props = {
  itemCount: number
  catCount: number
  savedCount: number
  userInitial: string
  view: WardrobeView
  onView: (view: WardrobeView) => void
  onAddItem: () => void
  onProfile: () => void
}

function navTab(active: boolean): string {
  return cn(
    'rounded-[9px] px-[18px] py-2 text-[13.5px] font-semibold transition-colors',
    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
  )
}

function viewBtn(active: boolean): string {
  return cn(
    'flex size-8 items-center justify-center rounded-[9px] transition-colors',
    active
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground'
  )
}

export function AppHeader({
  itemCount,
  catCount,
  savedCount,
  userInitial,
  view,
  onView,
  onAddItem,
  onProfile,
}: Props) {
  const pathname = usePathname()
  const onOutfits = pathname === '/outfits'

  return (
    <header className='sticky top-0 z-30 flex items-center gap-5 border-b border-border bg-background/80 px-6 py-[15px] backdrop-blur-md sm:px-8'>
      <div className='flex flex-none items-center gap-3.5'>
        <BrandMark />
        <span className='hidden h-4 w-px bg-border sm:block' />
        <span className='hidden text-[13px] text-muted-foreground sm:block'>
          {itemCount} item{itemCount === 1 ? '' : 's'} · {catCount} cat
          {catCount === 1 ? '' : 's'}
        </span>
      </div>

      <nav className='flex flex-1 justify-center'>
        <div className='flex gap-0.5 rounded-xl bg-muted/60 p-1'>
          <Link href='/' className={navTab(!onOutfits)}>
            Wardrobe
          </Link>
          <Link href='/outfits' className={navTab(onOutfits)}>
            Outfits
            {savedCount > 0 && (
              <span
                className={cn(
                  'ml-1.5 rounded-[9px] px-1.5 py-px text-[11px] font-bold text-white',
                  !onOutfits && 'bg-muted-foreground'
                )}
                style={onOutfits ? { background: BRAND_ACCENT } : undefined}
              >
                {savedCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className='flex flex-none items-center gap-3'>
        <div
          className={cn(
            'hidden gap-0.5 rounded-xl bg-muted/60 p-1 sm:flex',
            onOutfits && 'invisible'
          )}
          aria-hidden={onOutfits}
        >
          <button
            type='button'
            onClick={() => onView('circular')}
            aria-label='Circular view'
            tabIndex={onOutfits ? -1 : 0}
            className={viewBtn(view === 'circular')}
          >
            <Target className='size-4' />
          </button>
          <button
            type='button'
            onClick={() => onView('list')}
            aria-label='List view'
            tabIndex={onOutfits ? -1 : 0}
            className={viewBtn(view === 'list')}
          >
            <LayoutList className='size-4' />
          </button>
        </div>
        <button
          type='button'
          onClick={onAddItem}
          className='flex items-center gap-1.5 rounded-[11px] bg-foreground px-4 py-2.5 text-[13.5px] font-semibold text-background'
        >
          <PlusIcon className='size-4' />
          Add item
        </button>
        <button
          type='button'
          onClick={onProfile}
          aria-label='Profile'
          className='font-heading flex size-[38px] items-center justify-center rounded-full border border-border bg-muted/60 text-[15px] font-bold text-foreground uppercase'
        >
          {userInitial}
        </button>
      </div>
    </header>
  )
}
