'use client'

import { PencilIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { getItemImageSrc } from '@/lib/items'
import { getMatchScoreTone } from '@/lib/match-score'
import { findOutfitConflicts } from '@/lib/outfit-compat'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScoreBadge } from './ScoreBadge'
import type { SavedLook } from './OutfitsView'

type Props = {
  look: SavedLook
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function OutfitDetailModal({ look, onClose, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const tier = getMatchScoreTone(look.harmony)
  const conflicts = findOutfitConflicts(look.items)

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
        className='max-h-[calc(100svh-3rem)] max-w-[480px] gap-0 overflow-hidden rounded-[24px] p-0'
      >
        <div className='flex flex-none items-start justify-between gap-4 border-b border-border px-6 py-[18px]'>
          <div className='min-w-0'>
            <DialogTitle className='font-heading truncate text-[21px] leading-tight font-bold tracking-tight'>
              {look.name}
            </DialogTitle>
            {look.items.length >= 2 && (
              <div className='mt-2 flex items-center gap-2'>
                <ScoreBadge score={look.harmony} />
                <span
                  className='text-[12.5px] font-semibold'
                  style={{ color: tier.solidColor }}
                >
                  {tier.label}
                </span>
              </div>
            )}
          </div>
          <DialogClose
            aria-label='Close'
            className='flex size-8 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent/40'
          >
            <XIcon className='size-4' />
          </DialogClose>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-6 py-[18px]'>
          <div className='mb-2.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
            {look.items.length} piece{look.items.length === 1 ? '' : 's'}
          </div>
          <div className='flex flex-col gap-2.5'>
            {look.items.map(item => {
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
                </div>
              )
            })}
          </div>

          {look.missingCount > 0 && (
            <p className='mt-3 text-[12.5px] text-warning'>
              {look.missingCount} piece{look.missingCount === 1 ? '' : 's'} no
              longer in your wardrobe.
            </p>
          )}

          {conflicts.length > 0 && (
            <div className='mt-4 rounded-xl border border-warning/40 bg-warning/8 p-3'>
              <div className='text-[12px] font-semibold tracking-wide text-warning uppercase'>
                Heads up
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
            </div>
          )}
        </div>

        <div className='flex flex-none items-center gap-3 border-t border-border px-6 py-3.5'>
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
          <Button
            type='button'
            onClick={onEdit}
            className='h-12 flex-1 rounded-[13px] text-[15px] font-bold'
          >
            <PencilIcon className='size-4' />
            Edit outfit
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
