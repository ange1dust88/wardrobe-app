'use client'

import Link from 'next/link'
import { Target, XIcon } from 'lucide-react'
import { CATEGORIES, getItemImageSrc, type Item } from '@/lib/items'
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

  return (
    <div className='pointer-events-none fixed right-4 bottom-4 z-30 flex max-w-[calc(100%-2rem)] flex-col items-end gap-2'>
      {items.length === 0 ? (
        <div className='pointer-events-auto flex items-center gap-3.5 rounded-[22px] border border-border bg-card/95 px-5 py-4 shadow-xl backdrop-blur'>
          <div className='flex size-11 flex-none items-center justify-center rounded-[13px] bg-muted'>
            <Target className='size-5 text-muted-foreground' />
          </div>
          <div>
            <div className='font-heading text-[15px] font-bold'>
              Start a look
            </div>
            <div className='text-[13px] text-muted-foreground'>
              Tap pieces on the wheel — hover any piece to preview its matches.
            </div>
          </div>
        </div>
      ) : (
        <>
          {conflicts.length > 0 && !allowConflicts && (
            <div className='pointer-events-auto flex w-[min(1080px,100%)] flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-[12.5px] shadow-lg backdrop-blur'>
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

          <div className='pointer-events-auto flex w-[min(1080px,100%)] items-center gap-4 rounded-[22px] border border-border bg-card/95 px-5 py-3.5 shadow-xl backdrop-blur'>
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
                <>
                  <span className='font-heading text-[15px] font-bold'>
                    Add one more
                  </span>
                  <span className='mt-1 text-[12px] text-muted-foreground'>
                    pick a second piece
                  </span>
                </>
              )}
              <button
                type='button'
                onClick={onClear}
                className='mt-1 text-left text-[11.5px] font-semibold text-muted-foreground hover:text-foreground'
              >
                clear
              </button>
            </div>

            <div className='h-12 w-px flex-none bg-border' />

            <div className='flex min-w-0 flex-1 items-start gap-3 overflow-x-auto py-0.5'>
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
            </div>

            <div className='flex flex-none items-center gap-2.5'>
              <div className='flex flex-col items-end'>
                <input
                  value={name}
                  onChange={e => onNameChange(e.target.value)}
                  placeholder='Name this look'
                  className='w-[150px] rounded-[11px] border border-border bg-background px-3 py-2.5 text-[13.5px] outline-none'
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
