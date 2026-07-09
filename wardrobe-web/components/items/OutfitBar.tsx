'use client'

import Link from 'next/link'
import { PlusIcon, Target, XIcon } from 'lucide-react'
import {
  CATEGORIES,
  getItemImageSrc,
  type Category,
  type Item,
} from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { findOutfitConflicts } from '@/lib/outfit-compat'
import { cn } from '@/lib/utils'

type Props = {
  items: Item[]
  harmony: number | null
  editing?: boolean
  dirty?: boolean
  name: string
  onNameChange: (value: string) => void
  onCancel?: () => void
  allowConflicts?: boolean
  onAllowConflicts?: () => void
  onRemove: (id: string) => void
  onClear: () => void
  onSave: () => void
  saving?: boolean
  errorMessage?: string
}

const byCategory = (a: Item, b: Item) =>
  CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category)

const CORE_SLOTS: Category[] = ['top', 'bottom', 'shoes']

function missingCoreSlots(items: Item[]): Category[] {
  const filled = new Set(items.map(i => i.category))
  const hasDress = filled.has('dress')
  return CORE_SLOTS.filter(slot => {
    if (filled.has(slot)) return false
    if (hasDress && (slot === 'top' || slot === 'bottom')) return false
    return true
  })
}

export function OutfitBar({
  items,
  harmony,
  editing,
  dirty = true,
  name,
  onNameChange,
  onCancel,
  allowConflicts,
  onAllowConflicts,
  onRemove,
  onClear,
  onSave,
  saving,
  errorMessage,
}: Props) {
  const canSave = items.length > 0 && name.trim().length > 0 && dirty
  const conflicts = findOutfitConflicts(items)
  const tier = harmony != null ? getMatchScoreTone(harmony) : null
  const missingSlots = missingCoreSlots(items)

  return (
    <div className='pointer-events-none fixed right-4 bottom-4 left-4 z-30 flex flex-col items-end gap-2 sm:left-auto sm:max-w-[calc(100%-2rem)]'>
      {items.length === 0 && !editing ? (
        <div className='pointer-events-auto flex items-center gap-3.5 rounded-[22px] border border-border bg-card px-5 py-4 shadow-[0_16px_44px_-10px_rgba(37,37,35,0.3)]'>
          <div className='flex size-11 flex-none items-center justify-center rounded-[13px] bg-muted'>
            <Target className='size-5 text-muted-foreground' />
          </div>
          <div>
            <div className='font-heading text-[15px] font-bold'>
              Start a look
            </div>
            <div className='text-[13px] text-muted-foreground'>
              Tap pieces to start a look — hover any piece to preview its
              matches.
            </div>
          </div>
        </div>
      ) : (
        <>
          {conflicts.length > 0 && !allowConflicts && (
            <div className='pointer-events-auto flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-[12.5px] shadow-lg backdrop-blur sm:w-[min(1080px,calc(100vw-2rem))]'>
              <span className='font-semibold tracking-wide text-warning uppercase'>
                Doesn&apos;t go together
              </span>
              {conflicts.map(c => (
                <span key={`${c.a.id}-${c.b.id}`} className='text-foreground'>
                  <span className='font-medium'>{c.a.name}</span>
                  <span className='text-muted-foreground'> × </span>
                  <span className='font-medium'>{c.b.name}</span>
                </span>
              ))}
              {onAllowConflicts && (
                <button
                  type='button'
                  onClick={onAllowConflicts}
                  className='ml-auto font-semibold text-foreground underline'
                >
                  Wear it anyway
                </button>
              )}
              <Link
                href='/how-it-works'
                className='text-muted-foreground underline'
              >
                Why?
              </Link>
            </div>
          )}

          <div className='pointer-events-auto flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-[22px] border border-border bg-card px-5 py-3.5 shadow-[0_16px_44px_-10px_rgba(37,37,35,0.3)] sm:w-[min(1080px,calc(100vw-2rem))] sm:flex-nowrap'>
            <div className='flex flex-none flex-col leading-none'>
              {harmony != null && tier ? (
                <>
                  <div className='flex items-baseline gap-1'>
                    <span
                      className='font-heading text-[26px] font-bold'
                      style={{ color: tier.solidColor }}
                    >
                      {harmony}
                    </span>
                    <span className='text-[12px] text-muted-foreground'>
                      /36
                    </span>
                  </div>
                  <span
                    className='mt-1 text-[12px] font-semibold'
                    style={{ color: tier.solidColor }}
                  >
                    {tier.label}
                  </span>
                </>
              ) : (
                <div className='flex items-baseline gap-1'>
                  <span className='font-heading text-[26px] font-bold text-muted-foreground'>
                    —
                  </span>
                  <span className='text-[12px] text-muted-foreground'>/36</span>
                </div>
              )}
              <button
                type='button'
                onClick={onClear}
                className='mt-1 text-left text-[11.5px] font-semibold text-muted-foreground hover:text-foreground'
              >
                clear
              </button>
            </div>

            <div className='hidden h-12 w-px flex-none bg-border sm:block' />

            <div className='flex min-w-0 flex-1 items-start gap-3 overflow-x-auto px-2 pt-3 pb-1'>
              {[...items].sort(byCategory).map(item => {
                const img = getItemImageSrc(item)
                return (
                  <div
                    key={item.id}
                    className='flex flex-none flex-col items-center gap-1'
                  >
                    <div className='relative'>
                      <span
                        className='relative block size-14 overflow-hidden rounded-[13px] border border-border'
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
                      <button
                        type='button'
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className='absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow'
                      >
                        <XIcon className='size-3' />
                      </button>
                    </div>
                    <span className='max-w-14 truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase'>
                      {item.category}
                    </span>
                  </div>
                )
              })}
              {missingSlots.map(slot => (
                <div
                  key={slot}
                  className='flex flex-none flex-col items-center gap-1'
                >
                  <div className='flex size-14 items-center justify-center rounded-[13px] border border-dashed border-border text-muted-foreground/70'>
                    <PlusIcon className='size-5' />
                  </div>
                  <span className='text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase'>
                    {slot}
                  </span>
                </div>
              ))}
            </div>

            <div className='flex w-full flex-none items-center justify-end gap-2.5 sm:w-auto'>
              <div className='flex flex-1 flex-col items-end sm:flex-none'>
                <input
                  value={name}
                  onChange={e => onNameChange(e.target.value)}
                  placeholder='Name this look'
                  className='w-full rounded-[11px] border border-border bg-background px-3 py-2.5 text-[13.5px] outline-none sm:w-[150px]'
                />
                {errorMessage && (
                  <span className='mt-1 max-w-[150px] text-right text-[11px] text-destructive'>
                    {errorMessage}
                  </span>
                )}
              </div>
              {editing && onCancel && (
                <button
                  type='button'
                  onClick={onCancel}
                  className='text-[12.5px] font-semibold text-muted-foreground hover:text-foreground'
                >
                  Cancel
                </button>
              )}
              <button
                type='button'
                onClick={onSave}
                disabled={!canSave || saving}
                className={cn(
                  'rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors',
                  canSave ? 'bg-foreground' : 'cursor-default bg-muted-foreground'
                )}
              >
                {saving
                  ? 'Saving…'
                  : editing
                    ? !dirty
                      ? 'No changes'
                      : 'Save changes'
                    : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
