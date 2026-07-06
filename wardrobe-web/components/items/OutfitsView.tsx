'use client'

import { useState } from 'react'
import { getItemImageSrc, type Item } from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { OutfitDetailModal } from './OutfitDetailModal'

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
  onEdit: (look: SavedLook) => void
  onDuplicate: (look: SavedLook) => void
  onDelete: (id: string) => void
  onBuild: () => void
}

function sortLooks(looks: SavedLook[], key: SortKey): SavedLook[] {
  const copy = [...looks]
  if (key === 'harmony') return copy.sort((a, b) => b.harmony - a.harmony)
  if (key === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name))
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const min = Math.floor((Date.now() - then) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  const wk = Math.floor(day / 7)
  if (wk < 5) return `${wk}w ago`
  return new Date(iso).toLocaleDateString()
}

export function OutfitsView({
  looks,
  loading,
  errorMessage,
  onEdit,
  onDuplicate,
  onDelete,
  onBuild,
}: Props) {
  const [sort, setSort] = useState<SortKey>('harmony')
  const [detailId, setDetailId] = useState<string | null>(null)
  const ordered = sortLooks(looks, sort)
  const detailLook = looks.find(l => l.id === detailId) ?? null

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
          <div className='grid grid-cols-[repeat(auto-fill,minmax(264px,1fr))] gap-5'>
            {ordered.map(look => {
              const tier = getMatchScoreTone(look.harmony)
              const shown = look.items.slice(0, 6)
              const overflow = look.items.length - shown.length
              return (
                <button
                  key={look.id}
                  type='button'
                  onClick={() => setDetailId(look.id)}
                  className='group flex flex-col rounded-[20px] border border-border bg-card p-5 text-left shadow-[0_4px_16px_-8px_rgba(37,37,35,0.14)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(37,37,35,0.24)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                >
                  <div className='mb-4 flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='font-heading truncate text-[16px] font-bold'>
                        {look.name}
                      </div>
                      <div className='mt-1 text-[12px] text-muted-foreground'>
                        {timeAgo(look.createdAt)} · {look.items.length} piece
                        {look.items.length === 1 ? '' : 's'}
                        {look.missingCount > 0 && (
                          <span className='text-warning'>
                            {' '}
                            · {look.missingCount} unavailable
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-none flex-col items-end leading-none'>
                      <span
                        className='font-heading text-[22px] font-bold'
                        style={{ color: tier.solidColor }}
                      >
                        {look.harmony}
                      </span>
                      <span
                        className='mt-0.5 text-[11px] font-semibold'
                        style={{ color: tier.solidColor }}
                      >
                        {tier.shortLabel}
                      </span>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    {shown.map(item => {
                      const img = getItemImageSrc(item)
                      return (
                        <span
                          key={item.id}
                          title={item.name}
                          className='relative size-12 overflow-hidden rounded-[12px] border border-border'
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
                    {overflow > 0 && (
                      <span className='flex size-12 flex-none items-center justify-center rounded-[12px] border border-dashed border-border text-[12px] font-semibold text-muted-foreground'>
                        +{overflow}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {detailLook && (
        <OutfitDetailModal
          look={detailLook}
          onClose={() => setDetailId(null)}
          onEdit={() => {
            onEdit(detailLook)
            setDetailId(null)
          }}
          onDuplicate={() => {
            onDuplicate(detailLook)
            setDetailId(null)
          }}
          onDelete={() => {
            onDelete(detailLook.id)
            setDetailId(null)
          }}
        />
      )}
    </div>
  )
}
