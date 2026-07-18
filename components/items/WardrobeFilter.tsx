'use client'

import { CATEGORY_LABELS, type Category } from '@/lib/items'
import { cn } from '@/lib/utils'
import { usePresence } from '@/hooks/usePresence'

type Props = {
  open: boolean
  query: string
  onQuery: (value: string) => void
  categories: Category[]
  activeCat: Category | null
  onCat: (cat: Category | null) => void
  resultCount: number
  total: number
  onClose: () => void
}

function chip(active: boolean): string {
  return cn(
    'rounded-[18px] border px-[13px] py-[7px] text-[12.5px] font-semibold transition-colors',
    active
      ? 'border-foreground bg-foreground text-white'
      : 'border-border bg-transparent text-foreground/85 hover:bg-secondary/60'
  )
}

export function WardrobeFilter({
  open,
  query,
  onQuery,
  categories,
  activeCat,
  onCat,
  resultCount,
  total,
  onClose,
}: Props) {
  const { rendered, state } = usePresence(open)
  const active = query.trim().length > 0 || activeCat != null

  if (!rendered) return null

  return (
    <div className='pointer-events-none fixed top-[84px] right-0 left-[70px] z-30 px-6 sm:px-[26px]'>
      <div
        className='pointer-events-auto mx-auto flex max-w-[820px] flex-wrap items-center gap-3 rounded-[16px] border border-border bg-card/95 py-[10px] pr-[12px] pl-4 shadow-[0_10px_30px_rgba(30,40,50,0.09)] backdrop-blur-md'
        style={{
          animation:
            state === 'in'
              ? 'bar-dock 0.3s cubic-bezier(0.2,0.7,0.2,1) both'
              : 'bar-undock 0.3s cubic-bezier(0.2,0.7,0.2,1) both',
        }}
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 17 17'
          fill='none'
          className='flex-none'
          aria-hidden='true'
        >
          <circle
            cx='7.2'
            cy='7.2'
            r='5.1'
            stroke='#8b9196'
            strokeWidth='1.7'
          />
          <path
            d='M11.1 11.1L15 15'
            stroke='#8b9196'
            strokeWidth='1.7'
            strokeLinecap='round'
          />
        </svg>

        <input
          autoFocus
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder='Search wardrobe'
          className='min-w-[150px] flex-1 border-none bg-transparent text-[15px] font-medium text-foreground outline-none'
        />

        <div className='flex flex-wrap gap-1.5'>
          <button
            type='button'
            onClick={() => onCat(null)}
            className={chip(activeCat == null)}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c}
              type='button'
              onClick={() => onCat(activeCat === c ? null : c)}
              className={chip(activeCat === c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {active && (
          <div className='flex flex-none items-center gap-2.5 border-l border-border pl-3'>
            <div className='font-mono text-[12.5px] font-semibold text-foreground'>
              {resultCount}{' '}
              <span className='text-muted-foreground'>/ {total}</span>
            </div>
            <button
              type='button'
              onClick={() => {
                onQuery('')
                onCat(null)
              }}
              className='rounded-[8px] bg-secondary px-2.5 py-[5px] text-[12px] font-semibold text-muted-foreground hover:text-foreground'
            >
              Clear
            </button>
          </div>
        )}

        <button
          type='button'
          onClick={onClose}
          aria-label='Close search'
          className='flex size-[30px] flex-none items-center justify-center rounded-full text-[14px] text-muted-foreground transition-colors hover:bg-secondary'
        >
          ✕
        </button>
      </div>
    </div>
  )
}
