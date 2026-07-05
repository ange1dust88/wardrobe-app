'use client'

import { useState } from 'react'
import { getItemImageSrc, type Item } from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ScoreBadge } from './ScoreBadge'

export type SavedLook = {
  id: string
  name: string
  createdAt: string
  harmony: number
  items: Item[]
  missingCount: number
}

type SortKey = 'harmony' | 'newest' | 'name'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'harmony', label: 'Best match' },
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name' },
]

type Props = {
  looks: SavedLook[]
  loading?: boolean
  errorMessage?: string
  onOpen: (look: SavedLook) => void
  onDelete: (id: string) => void
  onBuild: () => void
}

function sortLooks(looks: SavedLook[], key: SortKey): SavedLook[] {
  const copy = [...looks]
  if (key === 'harmony') return copy.sort((a, b) => b.harmony - a.harmony)
  if (key === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name))
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function OutfitsView({
  looks,
  loading,
  errorMessage,
  onOpen,
  onDelete,
  onBuild,
}: Props) {
  const [sort, setSort] = useState<SortKey>('harmony')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const ordered = sortLooks(looks, sort)

  return (
    <div className='px-6 pt-7 pb-[70px] sm:px-8'>
      <div className='mx-auto max-w-[1500px]'>
        <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <h1 className='font-heading text-[28px] leading-none font-bold tracking-tight'>
              Saved outfits
            </h1>
            <p className='mt-1.5 text-[13.5px] text-muted-foreground'>
              {looks.length} look{looks.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            {looks.length > 1 && (
              <div className='flex gap-0.5 rounded-xl bg-muted/60 p-1'>
                {SORTS.map(s => (
                  <button
                    key={s.key}
                    type='button'
                    onClick={() => setSort(s.key)}
                    className={cn(
                      'rounded-[9px] px-3 py-[7px] text-[13px] font-semibold transition-colors',
                      sort === s.key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <Button onClick={onBuild}>Build an outfit</Button>
          </div>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-24'>
            <Spinner className='size-6 text-muted-foreground' />
          </div>
        ) : errorMessage ? (
          <Alert variant='error'>
            <AlertTitle>Failed to load outfits</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : looks.length === 0 ? (
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
            {ordered.map(look => {
              const tier = getMatchScoreTone(look.harmony)
              const confirming = confirmId === look.id
              return (
                <div
                  key={look.id}
                  role='button'
                  tabIndex={0}
                  onClick={() => onOpen(look)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpen(look)
                    }
                  }}
                  className='cursor-pointer rounded-[18px] border border-border bg-card p-[18px] text-left shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                >
                  <div className='mb-3.5 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <ScoreBadge
                        score={look.harmony}
                        className='rounded-lg text-[12.5px]'
                      />
                      <span
                        className='text-[12px] font-semibold'
                        style={{ color: tier.solidColor }}
                      >
                        {tier.shortLabel}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={e => {
                        e.stopPropagation()
                        if (confirming) {
                          onDelete(look.id)
                          setConfirmId(null)
                        } else {
                          setConfirmId(look.id)
                        }
                      }}
                      onBlur={() => confirming && setConfirmId(null)}
                      aria-label={confirming ? 'Confirm delete' : 'Delete outfit'}
                      className={cn(
                        'rounded-full px-2 text-[12px] font-semibold transition-colors',
                        confirming
                          ? 'bg-destructive/10 py-1 text-destructive'
                          : 'flex size-6.5 items-center justify-center bg-muted text-muted-foreground hover:bg-accent/40'
                      )}
                    >
                      {confirming ? 'Delete?' : '×'}
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
                  <div className='truncate text-[15px] font-semibold'>
                    {look.name}
                  </div>
                  <div className='mt-0.5 text-[12px] text-muted-foreground'>
                    {look.items.length} piece
                    {look.items.length === 1 ? '' : 's'}
                    {look.missingCount > 0 && (
                      <span className='text-warning'>
                        {' '}
                        · {look.missingCount} unavailable
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
