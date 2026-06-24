'use client'

import { PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Nav = 'wardrobe' | 'outfits'

type Props = {
  nav: Nav
  onNav: (nav: Nav) => void
  savedCount: number
  userInitial: string
  onAddItem: () => void
  onProfile: () => void
}

function navTab(active: boolean): string {
  return cn(
    'relative rounded-[9px] px-[18px] py-2 text-[13.5px] font-semibold transition-colors',
    active
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground'
  )
}

export function AppHeader({
  nav,
  onNav,
  savedCount,
  userInitial,
  onAddItem,
  onProfile,
}: Props) {
  return (
    <header className='sticky top-0 z-30 flex items-center gap-5 border-b border-border bg-background/80 px-6 py-[15px] backdrop-blur-md sm:px-8'>
      <div className='flex flex-none items-center gap-2.5'>
        <span className='size-[11px] rounded-full bg-[#3d5a3d]' />
        <span className='font-heading text-[23px] font-bold tracking-tight'>
          dress
        </span>
      </div>

      <div className='flex flex-1 justify-center'>
        <div className='flex gap-0.5 rounded-xl bg-muted/60 p-1'>
          <button
            type='button'
            onClick={() => onNav('wardrobe')}
            className={navTab(nav === 'wardrobe')}
          >
            Wardrobe
          </button>
          <button
            type='button'
            onClick={() => onNav('outfits')}
            className={navTab(nav === 'outfits')}
          >
            Outfits
            {savedCount > 0 && (
              <span
                className={cn(
                  'ml-1.5 rounded-[9px] px-1.5 py-px text-[11px] font-bold text-white',
                  nav === 'outfits' ? 'bg-[#3d5a3d]' : 'bg-muted-foreground'
                )}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className='flex flex-none items-center gap-3'>
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
