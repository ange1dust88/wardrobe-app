'use client'

import {
  Asterisk,
  ChevronDownIcon,
  Contrast,
  CopyIcon,
  FolderIcon,
  PencilIcon,
  Sparkles,
  XIcon,
} from 'lucide-react'
import { useState } from 'react'
import { CATEGORIES, getItemImageSrc, type Folder, type Item } from '@/lib/items'
import { timeAgo } from '@/lib/date'
import { getMatchScoreTone } from '@/lib/match-score'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SavedLook } from './OutfitsView'

type Props = {
  look: SavedLook
  folders: Folder[]
  onClose: () => void
  onMove: (folderId: string | null) => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter']
const SEASON_LABEL: Record<string, string> = {
  spring: 'spring',
  summer: 'summer',
  autumn: 'fall',
  winter: 'winter',
}
const FORMALITY_ORDER = ['loungewear', 'casual', 'smart_casual', 'formal']

function paletteLabel(items: Item[]): string {
  if (items.every(i => i.color.isNeutral)) return 'Neutral palette'
  const pops = items.filter(i => i.wardrobeRole === 'pop').length
  if (pops >= 2) return 'Bold mix'
  return 'Cohesive palette'
}

function formalityLabel(items: Item[]): string | null {
  const present = FORMALITY_ORDER.filter(f => items.some(i => i.formality === f))
  if (present.length === 0) return null
  return present
    .slice(0, 2)
    .map(f => f.replace('_', ' '))
    .join(' · ')
}

function seasonLabel(items: Item[]): string | null {
  if (items.length === 0) return null
  const sets = items.map(i => new Set<string>(i.seasonWear))
  const common = SEASON_ORDER.filter(s => sets.every(set => set.has(s)))
  if (common.length === 0) return null
  if (common.length === 4) return 'year-round'
  if (common.length === 3) return 'versatile'
  const labels = common.map(s => SEASON_LABEL[s])
  return labels.join('–')
}

function byCategory(a: Item, b: Item): number {
  return CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category)
}

function groupByCategory(items: Item[]): Item[][] {
  const byCat = new Map<string, Item[]>()
  for (const it of items) {
    const arr = byCat.get(it.category) ?? []
    arr.push(it)
    byCat.set(it.category, arr)
  }
  return CATEGORIES.filter(c => byCat.has(c)).map(c => byCat.get(c) as Item[])
}

function ScoreRing({ value, color }: { value: number; color: string }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / 36))
  return (
    <svg width={62} height={62} viewBox='0 0 62 62' className='flex-none'>
      <circle
        cx={31}
        cy={31}
        r={r}
        fill='none'
        stroke='var(--border)'
        strokeWidth={5}
      />
      <circle
        cx={31}
        cy={31}
        r={r}
        fill='none'
        stroke={color}
        strokeWidth={5}
        strokeLinecap='round'
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        transform='rotate(-90 31 31)'
      />
    </svg>
  )
}

export function OutfitDetailModal({
  look,
  folders,
  onClose,
  onMove,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const tier =
    look.harmony != null ? getMatchScoreTone(look.harmony) : null
  const sorted = [...look.items].sort(byCategory)
  const garments = look.items.filter(i => i.category !== 'accessory')
  const accessories = look.items.filter(i => i.category === 'accessory')
  const groups = groupByCategory(garments)

  const chips: { icon: typeof Contrast; label: string }[] = [
    { icon: Contrast, label: paletteLabel(look.items) },
  ]
  const style = formalityLabel(look.items)
  if (style) chips.push({ icon: Sparkles, label: style })
  const season = seasonLabel(look.items)
  if (season) chips.push({ icon: Asterisk, label: season })

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete()
  }

  return (
    <Dialog open onOpenChange={next => !next && onClose()}>
      <DialogPopup
        showCloseButton={false}
        className='max-h-[calc(100svh-3rem)] w-[min(880px,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden rounded-[28px] p-0'
      >
        <div className='flex max-h-[calc(100svh-3rem)] flex-col overflow-y-auto md:flex-row md:overflow-hidden'>
          <div className='flex flex-col gap-4 border-b border-border bg-muted p-6 md:w-[42%] md:border-r md:border-b-0'>
            <div className='text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
              The look
            </div>
            <div className='flex min-h-0 flex-1 flex-col gap-3'>
              {groups.map((group, gi) => (
                <div key={gi} className='flex min-h-[72px] flex-1 gap-3'>
                  {group.map(item => {
                    const img = getItemImageSrc(item)
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'relative flex-1 overflow-hidden rounded-[18px] border border-border shadow-sm',
                          img && 'bg-background'
                        )}
                        style={img ? undefined : { background: item.color.hex }}
                      >
                        {img && (
                          <img
                            src={img}
                            alt=''
                            className='absolute inset-0 h-full w-full object-contain p-2'
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
              {look.items.length === 0 && (
                <div className='flex flex-1 items-center justify-center rounded-[18px] border border-dashed border-border text-[13px] text-muted-foreground'>
                  No pieces left
                </div>
              )}
            </div>

            {accessories.length > 0 && (
              <div className='flex flex-none flex-wrap gap-2'>
                {accessories.map(item => {
                  const img = getItemImageSrc(item)
                  return (
                    <span
                      key={item.id}
                      title={item.name}
                      className={cn(
                        'relative size-12 flex-none overflow-hidden rounded-[13px] border border-border shadow-sm',
                        img && 'bg-background'
                      )}
                      style={img ? undefined : { background: item.color.hex }}
                    >
                      {img && (
                        <img
                          src={img}
                          alt=''
                          className='absolute inset-0 h-full w-full object-contain p-1.5'
                        />
                      )}
                    </span>
                  )
                })}
              </div>
            )}

            <div className='flex items-center gap-4'>
              <div className='relative flex-none'>
                <ScoreRing
                  value={look.harmony ?? 0}
                  color={tier?.solidColor ?? 'var(--border)'}
                />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='font-heading text-[18px] font-bold'>
                    {look.harmony ?? '—'}
                  </span>
                </div>
              </div>
              <div className='leading-tight'>
                <div
                  className='text-[15px] font-bold'
                  style={{ color: tier?.solidColor ?? 'var(--muted-foreground)' }}
                >
                  {tier ? tier.label : 'Not scored'}
                </div>
                <div className='mt-0.5 text-[12.5px] text-muted-foreground'>
                  out of 36
                </div>
              </div>
            </div>
          </div>

          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='flex flex-none items-start justify-between gap-4 px-6 pt-5'>
              <div className='relative'>
                <FolderIcon className='pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground' />
                <ChevronDownIcon className='pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground' />
                <select
                  value={look.folderId ?? ''}
                  onChange={e => onMove(e.target.value || null)}
                  aria-label='Folder'
                  className='cursor-pointer appearance-none rounded-full border border-border bg-card py-2 pr-8 pl-9 text-[13px] font-semibold text-foreground outline-none'
                >
                  <option value=''>Unfiled</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <DialogClose
                aria-label='Close'
                className='flex size-9 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent/40'
              >
                <XIcon className='size-4' />
              </DialogClose>
            </div>

            <div className='min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6'>
              <DialogTitle className='font-heading text-[26px] leading-tight font-bold tracking-tight'>
                {look.name}
              </DialogTitle>
              <div className='mt-1.5 text-[13px] text-muted-foreground'>
                Saved {timeAgo(look.createdAt)} · {look.items.length} piece
                {look.items.length === 1 ? '' : 's'}
                {look.missingCount > 0 && (
                  <span className='text-warning'>
                    {' '}
                    · {look.missingCount} unavailable
                  </span>
                )}
              </div>

              <div className='mt-6 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
                {look.items.length} piece{look.items.length === 1 ? '' : 's'}
              </div>
              <div className='mt-1'>
                {sorted.map((item, idx) => {
                  const img = getItemImageSrc(item)
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3.5 py-3.5',
                        idx > 0 && 'border-t border-border'
                      )}
                    >
                      <span
                        className='relative size-11 flex-none overflow-hidden rounded-[11px] border border-border'
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
                      <span className='min-w-0 flex-1 truncate text-[15px] font-semibold'>
                        {item.name}
                      </span>
                      <span className='text-[11px] font-semibold tracking-wide text-muted-foreground uppercase'>
                        {item.category}
                      </span>
                    </div>
                  )
                })}
              </div>

              {chips.length > 0 && look.items.length > 0 && (
                <>
                  <div className='mt-6 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase'>
                    Why it works
                  </div>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {chips.map(chip => (
                      <span
                        key={chip.label}
                        className='flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium'
                      >
                        <chip.icon className='size-3.5 text-muted-foreground' />
                        {chip.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className='flex flex-none items-center gap-2.5 border-t border-border px-6 py-3.5'>
              <Button
                type='button'
                variant='outline'
                onClick={handleDelete}
                onBlur={() => setConfirmDelete(false)}
                className={cn(
                  'h-12 rounded-[13px] border-destructive/30 text-destructive hover:bg-destructive/5',
                  confirmDelete && 'bg-destructive/10'
                )}
              >
                {confirmDelete ? 'Delete for good?' : 'Delete'}
              </Button>
              <div className='ml-auto flex items-center gap-2.5'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onDuplicate}
                  disabled={look.items.length === 0}
                  className='h-12 rounded-[13px]'
                >
                  <CopyIcon className='size-4' />
                  Duplicate
                </Button>
                <Button
                  type='button'
                  onClick={onEdit}
                  className='h-12 rounded-[13px] px-6 text-[15px] font-bold'
                >
                  <PencilIcon className='size-4' />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
