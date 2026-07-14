'use client'

import {
  ChartColumn,
  HelpCircle,
  LayoutGrid,
  LayoutList,
  MessageCircle,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type Props = {
  savedCount: number
  userInitial: string
  onHome?: () => void
  onAddItem: () => void
  onFeedback: () => void
  onProfile: () => void
}

function railLink(active: boolean): string {
  return cn(
    'relative flex size-10 items-center justify-center rounded-xl transition-colors',
    active
      ? 'bg-secondary text-foreground shadow-[inset_0_0_0_1px_var(--border)]'
      : 'text-muted-foreground hover:text-foreground'
  )
}

export function AppRail({
  savedCount,
  userInitial,
  onHome,
  onAddItem,
  onFeedback,
  onProfile,
}: Props) {
  const pathname = usePathname()
  const isWheel = pathname === '/'
  const isList = pathname === '/list'
  const isOutfits = pathname === '/outfits'
  const isAnalytics = pathname === '/analytics'
  const isTestDrive = pathname === '/test-drive'
  const isHow = pathname === '/how-it-works'

  return (
    <aside className='fixed inset-y-0 left-0 z-40 flex w-[70px] flex-col items-center gap-3.5 border-r border-border bg-card/95 py-[18px] backdrop-blur-md'>
      <Link
        href='/'
        aria-label='dress — home'
        onClick={onHome}
        className='flex size-[34px] flex-none items-center justify-center rounded-[8px] bg-foreground'
      >
        <span
          className='size-[9px] rounded-full'
          style={{ background: '#7fae7f' }}
        />
      </Link>
      <span className='h-1.5' />

      <Link
        href='/'
        aria-label='Wheel'
        title='Wheel'
        onClick={onHome}
        className={railLink(isWheel)}
      >
        <Target className='size-[18px]' />
      </Link>
      <Link
        href='/list'
        aria-label='List'
        title='List'
        className={railLink(isList)}
      >
        <LayoutList className='size-[18px]' />
      </Link>
      <Link
        href='/outfits'
        aria-label='Outfits'
        title='Outfits'
        className={railLink(isOutfits)}
      >
        <LayoutGrid className='size-[18px]' />
        {savedCount > 0 && (
          <span className='font-mono absolute -top-1 -right-1 flex min-w-[16px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background'>
            {savedCount}
          </span>
        )}
      </Link>
      <Link
        href='/how-it-works'
        aria-label='How it works'
        title='How it works'
        className={railLink(isHow)}
      >
        <HelpCircle className='size-[18px]' />
      </Link>
      <Link
        href='/analytics'
        aria-label='Insights'
        title='Insights'
        className={railLink(isAnalytics)}
      >
        <ChartColumn className='size-[18px]' />
      </Link>
      <Link
        href='/test-drive'
        aria-label='Should I buy?'
        title='Should I buy?'
        className={railLink(isTestDrive)}
      >
        <Sparkles className='size-[18px]' />
      </Link>

      <div className='flex-1' />

      <button
        type='button'
        onClick={onFeedback}
        aria-label='Send feedback'
        title='Feedback'
        className='flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground'
      >
        <MessageCircle className='size-[18px]' />
      </button>
      <button
        type='button'
        onClick={onAddItem}
        aria-label='Add item'
        title='Add item'
        className='flex size-10 items-center justify-center rounded-xl bg-foreground text-background transition-transform hover:scale-105'
      >
        <Plus className='size-[22px]' />
      </button>
      <button
        type='button'
        onClick={onProfile}
        aria-label='Profile'
        title='Profile'
        className='font-heading flex size-9 items-center justify-center rounded-full border border-border bg-secondary text-[14px] font-bold text-foreground uppercase'
      >
        {userInitial}
      </button>
    </aside>
  )
}
