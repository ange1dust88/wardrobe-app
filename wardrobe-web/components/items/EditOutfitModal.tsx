'use client'

import { PlusIcon, XIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  CATEGORIES,
  getItemImageSrc,
  type Item,
  type MatchMap,
} from '@/lib/items'
import { harmonyOf } from '@/lib/harmony'
import { getMatchScoreTone } from '@/lib/match-score'
import { findOutfitConflicts } from '@/lib/outfit-compat'
import { toggleOutfitItem } from '@/lib/outfit-slots'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScoreBadge } from './ScoreBadge'

type Props = {
  outfit: { id: string; name: string; itemIds: string[] }
  items: Item[]
  map: MatchMap
  onClose: () => void
  onSave: (id: string, body: { name: string; itemIds: string[] }) => void
  onDelete: (id: string) => void
  pending?: boolean
  deleting?: boolean
  errorMessage?: string
}

const byCategory = (a: Item, b: Item) =>
  CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category)

export function EditOutfitModal({
  outfit,
  items,
  map,
  onClose,
  onSave,
  onDelete,
  pending,
  deleting,
  errorMessage,
}: Props) {
  const itemById = useMemo(
    () => new Map(items.map(i => [i.id, i])),
    [items]
  )
  const [name, setName] = useState(outfit.name)
  const [selected, setSelected] = useState<Item[]>(() =>
    outfit.itemIds
      .map(id => itemById.get(id))
      .filter((i): i is Item => i != null)
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectedIds = selected.map(i => i.id)
  const harmony =
    selectedIds.length >= 2 ? harmonyOf(selectedIds, map) : null
  const tier = harmony != null ? getMatchScoreTone(harmony) : null
  const conflicts = findOutfitConflicts(selected)

  const available = useMemo(() => {
    const ids = new Set(selected.map(i => i.id))
    return items
      .filter(i => !ids.has(i.id))
      .sort((a, b) => byCategory(a, b) || a.name.localeCompare(b.name))
  }, [items, selected])

  const dirty =
    name.trim() !== outfit.name ||
    selectedIds.slice().sort().join(',') !==
      outfit.itemIds.slice().sort().join(',')
  const canSave = selected.length > 0 && name.trim().length > 0 && dirty

  function add(item: Item) {
    setSelected(prev => toggleOutfitItem(prev, item))
  }
  function removeId(id: string) {
    setSelected(prev => prev.filter(s => s.id !== id))
  }
  function handleSave() {
    if (!canSave || pending) return
    onSave(outfit.id, { name: name.trim(), itemIds: selectedIds })
  }
  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(outfit.id)
  }

  return (
    <Dialog open onOpenChange={next => !next && onClose()}>
      <DialogPopup
        showCloseButton={false}
        className='max-h-[calc(100svh-3rem)] max-w-[560px] gap-0 overflow-hidden rounded-[24px] p-0'
      >
        <div className='flex flex-none items-center justify-between gap-4 border-b border-border px-6 py-[18px]'>
          <div className='flex items-baseline gap-3'>
            <DialogTitle className='font-heading text-[21px] leading-none font-bold tracking-tight'>
              Edit outfit
            </DialogTitle>
            {harmony != null && tier && (
              <DialogDescription className='flex items-center gap-2 text-[12.5px]'>
                <ScoreBadge score={harmony} />
                <span style={{ color: tier.solidColor }} className='font-semibold'>
                  {tier.shortLabel}
                </span>
              </DialogDescription>
            )}
          </div>
          <DialogClose
            aria-label='Close'
            className='flex size-8 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent/40'
          >
            <XIcon className='size-4' />
          </DialogClose>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-6 pt-[18px] pb-2'>
          <div className='mb-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
            Name
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Autumn casual'
            className='mb-5 w-full rounded-[11px] border border-border bg-background px-3.5 py-3 text-[15px] outline-none'
          />

          {conflicts.length > 0 && (
            <div className='mb-5 rounded-xl border border-warning/40 bg-warning/8 p-3'>
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
            </div>
          )}

          <div className='mb-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
            In this look
          </div>
          {selected.length === 0 ? (
            <p className='mb-5 text-[13px] text-muted-foreground'>
              Empty — add pieces from your wardrobe below.
            </p>
          ) : (
            <div className='mb-5 flex flex-col gap-2.5'>
              {[...selected].sort(byCategory).map(item => {
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
                      onClick={() => removeId(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className='flex size-6 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent/40'
                    >
                      <XIcon className='size-3.5' />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <div className='mb-2 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase'>
            Add from wardrobe
          </div>
          {available.length === 0 ? (
            <p className='mb-2 text-[13px] text-muted-foreground'>
              Everything you own is already in this look.
            </p>
          ) : (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(82px,1fr))] gap-2.5'>
              {available.map(item => {
                const img = getItemImageSrc(item)
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => add(item)}
                    title={item.name}
                    className='group flex flex-col gap-1 text-left'
                  >
                    <span
                      className='relative aspect-square w-full overflow-hidden rounded-[11px] border border-border'
                      style={{ background: item.color.hex }}
                    >
                      {img && (
                        <img
                          src={img}
                          alt=''
                          className='absolute inset-0 h-full w-full object-cover'
                        />
                      )}
                      <span className='absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition group-hover:bg-foreground/35 group-hover:opacity-100'>
                        <PlusIcon className='size-5 text-white' />
                      </span>
                    </span>
                    <span className='truncate text-[11.5px] font-medium'>
                      {item.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {errorMessage && (
            <Alert variant='error' className='mt-4'>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className='flex flex-none items-center gap-3 border-t border-border px-6 py-3.5'>
          <Button
            type='button'
            variant='outline'
            onClick={handleDelete}
            loading={deleting}
            disabled={pending}
            className={cn(
              'h-12 rounded-[13px] border-destructive/30 text-destructive hover:bg-destructive/5',
              confirmDelete && 'bg-destructive/10'
            )}
          >
            {confirmDelete ? 'Delete for good?' : 'Delete'}
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            disabled={!canSave || deleting}
            loading={pending}
            className='h-12 flex-1 rounded-[13px] text-[15px] font-bold'
          >
            Save changes
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
