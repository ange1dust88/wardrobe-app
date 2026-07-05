'use client'

import Link from 'next/link'
import { CATEGORIES, getItemImageSrc, type Item } from '@/lib/items'
import { findOutfitConflicts } from '@/lib/outfit-compat'
import { cn } from '@/lib/utils'
import { ScoreBadge } from './ScoreBadge'

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

export function OutfitBuilder({
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
  const hasOutfit = items.length > 0
  const canSave = hasOutfit && name.trim().length > 0 && dirty

  const conflicts = findOutfitConflicts(items)

  function handleSave() {
    if (!canSave) return
    onSave()
  }

  return (
    <aside className='w-full lg:sticky lg:top-[88px] lg:w-[362px] lg:flex-none'>
      <div className='rounded-[20px] border border-border bg-card p-6 shadow-sm'>
        <div className='flex items-baseline justify-between'>
          <h2 className='font-heading text-xl font-bold tracking-tight'>
            {editing ? 'Edit outfit' : 'Build an outfit'}
          </h2>
          {harmony != null && items.length >= 2 && (
            <ScoreBadge score={harmony} />
          )}
        </div>

        {editing && (
          <p className='mt-1.5 text-[12.5px] text-muted-foreground'>
            Tweak this saved look — tap items on the wheel to add or swap.
          </p>
        )}

        {conflicts.length > 0 && !allowConflicts && (
          <div className='mt-3 rounded-xl border border-warning/40 bg-warning/8 p-3'>
            <div className='text-[12px] font-semibold tracking-wide text-warning uppercase'>
              Doesn&apos;t go together
            </div>
            <ul className='mt-1.5 flex flex-col gap-1.5'>
              {conflicts.map(c => (
                <li
                  key={`${c.a.id}-${c.b.id}`}
                  className='text-[12.5px] leading-snug text-foreground'
                >
                  <span className='font-medium'>{c.a.name}</span>
                  <span className='text-muted-foreground'> × </span>
                  <span className='font-medium'>{c.b.name}</span>
                  <span className='text-muted-foreground'> — {c.reason}</span>
                </li>
              ))}
            </ul>
            <div className='mt-2.5 flex items-center gap-4'>
              {onAllowConflicts && (
                <button
                  type='button'
                  onClick={onAllowConflicts}
                  className='text-[12.5px] font-semibold text-foreground underline'
                >
                  Wear it anyway
                </button>
              )}
              <Link
                href='/how-it-works'
                className='text-[12.5px] text-muted-foreground underline'
              >
                Why?
              </Link>
            </div>
          </div>
        )}

        {conflicts.length > 0 && allowConflicts && (
          <div className='mt-3 text-[12.5px] text-muted-foreground'>
            Scoring this look as-is — bold mix.
          </div>
        )}

        {!hasOutfit ? (
          <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
            Tap items to build an outfit. Matches are highlighted as you add.
          </p>
        ) : (
          <>
            <div className='mt-4 flex flex-col gap-3'>
              {[...items]
                .sort(
                  (a, b) =>
                    CATEGORIES.indexOf(a.category) -
                    CATEGORIES.indexOf(b.category)
                )
                .map(item => {
                const img = getItemImageSrc(item)
                return (
                  <div key={item.id} className='flex items-center gap-3'>
                    <span
                      className='relative size-11 flex-none overflow-hidden rounded-[10px] border border-border'
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
                    <div className='min-w-0 flex-1'>
                      <div className='truncate text-[13px] font-medium'>
                        {item.name}
                      </div>
                      <div className='text-[11px] tracking-wide text-muted-foreground uppercase'>
                        {item.category}
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => onRemove(item.id)}
                      aria-label='Remove'
                      className='flex size-6 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground'
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              type='button'
              onClick={onClear}
              className='mt-3.5 text-[12.5px] font-semibold text-muted-foreground'
            >
              Clear all
            </button>
          </>
        )}

        <div className='my-5 h-px bg-border' />

        <div className='mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
          Name
        </div>
        <input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder='Autumn casual'
          className='mb-3.5 w-full rounded-[11px] border border-border bg-background px-3.5 py-3 text-[15px] outline-none'
        />

        {errorMessage && (
          <p className='mb-3 text-[13px] text-destructive'>{errorMessage}</p>
        )}

        <button
          type='button'
          onClick={handleSave}
          disabled={!canSave || saving}
          className={cn(
            'w-full rounded-xl py-3 text-[15px] font-semibold text-white transition-colors',
            canSave ? 'bg-foreground' : 'cursor-default bg-muted-foreground'
          )}
        >
          {saving
            ? 'Saving…'
            : editing
              ? !dirty
                ? 'No changes'
                : 'Save changes'
              : 'Save outfit'}
        </button>

        {editing && onCancel ? (
          <button
            type='button'
            onClick={onCancel}
            className='mt-3 block w-full text-center text-[12.5px] font-semibold text-muted-foreground hover:text-foreground'
          >
            Cancel edit
          </button>
        ) : (
          <Link
            href='/how-it-works'
            className='mt-3 block text-center text-[12px] text-muted-foreground hover:text-foreground'
          >
            How matching works
          </Link>
        )}
      </div>
    </aside>
  )
}
