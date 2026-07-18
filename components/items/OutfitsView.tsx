'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckIcon,
  ChevronDownIcon,
  FolderIcon,
  PlusIcon,
  Trash2Icon,
  Undo2Icon,
  XIcon,
} from 'lucide-react'
import { getItemImageSrc, type Folder, type Item } from '@/lib/items'
import { timeAgo } from '@/lib/date'
import { getMatchScoreTone } from '@/lib/match-score'
import { cn } from '@/lib/utils'
import { usePresence } from '@/hooks/usePresence'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateFolderModal } from './CreateFolderModal'
import { OutfitDetailModal } from './OutfitDetailModal'

export type SavedLook = {
  id: string
  name: string
  createdAt: string
  harmony: number | null
  items: Item[]
  missingCount: number
  folderId: string | null
}

type SortKey = 'harmony' | 'newest' | 'name'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'harmony', label: 'Best match' },
  { key: 'newest', label: 'Newest' },
  { key: 'name', label: 'Name' },
]

type Props = {
  looks: SavedLook[]
  folders: Folder[]
  loading?: boolean
  errorMessage?: string
  onEdit: (look: SavedLook) => void
  onDuplicate: (look: SavedLook) => void
  onDeleteMany: (ids: string[]) => void
  onRestore: (looks: SavedLook[]) => void
  onCreateFolder: (name: string) => void
  onDeleteFolder: (id: string) => void
  onMove: (id: string, folderId: string | null) => void
  onBuild: () => void
}

function sortLooks(looks: SavedLook[], key: SortKey): SavedLook[] {
  const copy = [...looks]
  if (key === 'harmony')
    return copy.sort((a, b) => (b.harmony ?? -1) - (a.harmony ?? -1))
  if (key === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name))
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function OutfitsView({
  looks,
  folders,
  loading,
  errorMessage,
  onEdit,
  onDuplicate,
  onDeleteMany,
  onRestore,
  onCreateFolder,
  onDeleteFolder,
  onMove,
  onBuild,
}: Props) {
  const [sort, setSort] = useState<SortKey>('harmony')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [creating, setCreating] = useState(false)
  const [confirmFolderId, setConfirmFolderId] = useState<string | null>(null)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [recentDeleted, setRecentDeleted] = useState<SavedLook[] | null>(null)
  const [undoOpen, setUndoOpen] = useState(false)
  const dismissTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current)
    },
    []
  )

  const unfiledCount = looks.filter(l => !l.folderId).length
  const filtered =
    filter === 'all'
      ? looks
      : filter === 'unfiled'
        ? looks.filter(l => !l.folderId)
        : looks.filter(l => l.folderId === filter)
  const ordered = sortLooks(filtered, sort)
  const detailLook = looks.find(l => l.id === detailId) ?? null
  const allVisibleSelected =
    ordered.length > 0 && ordered.every(l => selected.has(l.id))
  const selectionBar = usePresence(selecting)
  const undoBar = usePresence(undoOpen && !selecting)

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exitSelect() {
    setSelecting(false)
    setSelected(new Set())
  }

  function toggleSelectAll() {
    setSelected(
      allVisibleSelected ? new Set() : new Set(ordered.map(l => l.id))
    )
  }

  function removeLooks(batch: SavedLook[]) {
    if (batch.length === 0) return
    onDeleteMany(batch.map(l => l.id))
    setRecentDeleted(batch)
    setUndoOpen(true)
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current)
    dismissTimer.current = window.setTimeout(() => setUndoOpen(false), 3500)
  }

  function deleteSelected() {
    removeLooks(looks.filter(l => selected.has(l.id)))
    exitSelect()
  }

  function undoDelete() {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current)
    if (recentDeleted) onRestore(recentDeleted)
    setUndoOpen(false)
  }

  function chipCls(active: boolean): string {
    return cn(
      'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
      active
        ? 'border-foreground bg-foreground text-background'
        : 'border-border bg-card text-muted-foreground hover:text-foreground'
    )
  }

  return (
    <div className='px-6 pt-3 pb-[70px] sm:px-12'>
      <div className='w-full'>
        {!loading &&
          !errorMessage &&
          (looks.length > 0 || folders.length > 0) && (
            <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <button
                  type='button'
                  onClick={() => setFilter('all')}
                  className={chipCls(filter === 'all')}
                >
                  All
                  <span className='opacity-60'>{looks.length}</span>
                </button>
                <button
                  type='button'
                  onClick={() => setFilter('unfiled')}
                  className={chipCls(filter === 'unfiled')}
                >
                  Unfiled
                  <span className='opacity-60'>{unfiledCount}</span>
                </button>
                {folders.map(folder => {
                  const count = looks.filter(
                    l => l.folderId === folder.id
                  ).length
                  const confirming = confirmFolderId === folder.id
                  return (
                    <span
                      key={folder.id}
                      className={chipCls(filter === folder.id)}
                    >
                      <button
                        type='button'
                        onClick={() => setFilter(folder.id)}
                        className='flex items-center gap-1.5'
                      >
                        {folder.name}
                        <span className='opacity-60'>{count}</span>
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          if (confirming) {
                            onDeleteFolder(folder.id)
                            setConfirmFolderId(null)
                            if (filter === folder.id) setFilter('all')
                          } else {
                            setConfirmFolderId(folder.id)
                          }
                        }}
                        onBlur={() => confirming && setConfirmFolderId(null)}
                        aria-label={
                          confirming ? 'Confirm delete folder' : 'Delete folder'
                        }
                        className='-mr-1 ml-0.5 flex items-center'
                      >
                        {confirming ? (
                          <span className='text-[11px] font-bold'>del?</span>
                        ) : (
                          <XIcon className='size-3.5 opacity-70' />
                        )}
                      </button>
                    </span>
                  )
                })}
                <button
                  type='button'
                  onClick={() => setCreating(true)}
                  className='flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground'
                >
                  <PlusIcon className='size-3.5' />
                  New folder
                </button>
              </div>
              <div className='flex items-center gap-2'>
                {looks.length > 1 && (
                  <div className='flex gap-0.5 rounded-xl bg-muted/60 p-1'>
                    {SORTS.map(s => (
                      <button
                        key={s.key}
                        type='button'
                        onClick={() => setSort(s.key)}
                        className={cn(
                          'rounded-[7px] px-3 py-[7px] text-[13px] font-semibold transition-colors',
                          sort === s.key
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground'
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                {looks.length > 0 && (
                  <button
                    type='button'
                    onClick={() =>
                      selecting ? exitSelect() : setSelecting(true)
                    }
                    className={cn(
                      'flex min-w-[96px] items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                      selecting
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-card text-foreground hover:bg-secondary'
                    )}
                  >
                    {selecting ? (
                      <>
                        <XIcon className='size-3.5' />
                        Cancel
                      </>
                    ) : (
                      <>
                        <CheckIcon className='size-3.5' />
                        Select
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

        {loading ? (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(264px,1fr))] gap-5'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='rounded-[18px] border border-border bg-card p-5'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1'>
                    <Skeleton className='h-4 w-2/3 rounded-md' />
                    <Skeleton className='mt-2 h-3 w-1/3 rounded-md' />
                  </div>
                  <Skeleton className='size-9 rounded-lg' />
                </div>
                <div className='mt-4 flex gap-2'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className='size-11 rounded-[11px]' />
                  ))}
                </div>
                <div className='mt-4 border-t border-border pt-3'>
                  <Skeleton className='h-8 w-32 rounded-lg' />
                </div>
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <Alert variant='error'>
            <AlertTitle>Failed to load outfits</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : looks.length === 0 ? (
          <div className='flex flex-col items-center justify-center px-5 py-20 text-center'>
            <div className='mb-5 flex gap-1.5 opacity-50'>
              <span className='size-11 rounded-[8px] bg-muted' />
              <span className='size-11 rounded-[8px] bg-border' />
              <span className='size-11 rounded-[8px] bg-muted' />
            </div>
            <h2 className='font-heading mb-1.5 text-[21px] font-bold'>
              No saved outfits yet
            </h2>
            <p className='mb-5 max-w-[320px] text-sm text-muted-foreground'>
              Build a look on the wheel and save it — it&apos;ll live here.
            </p>
            <Button onClick={onBuild}>Build an outfit</Button>
          </div>
        ) : ordered.length === 0 ? (
          <p className='py-16 text-center text-sm text-muted-foreground'>
            Nothing in this folder yet.
          </p>
        ) : (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(264px,1fr))] gap-5'>
            {ordered.map(look => {
              const tier =
                look.harmony != null ? getMatchScoreTone(look.harmony) : null
              const shown = look.items.slice(0, 6)
              const overflow = look.items.length - shown.length
              return (
                <div
                  key={look.id}
                  role='button'
                  tabIndex={0}
                  onClick={() =>
                    selecting ? toggleSelect(look.id) : setDetailId(look.id)
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (selecting) toggleSelect(look.id)
                      else setDetailId(look.id)
                    }
                  }}
                  className={cn(
                    'rise-in group relative flex cursor-pointer flex-col rounded-[14px] border bg-card p-5 text-left shadow-[0_4px_16px_rgba(20,28,36,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(20,28,36,0.1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    selecting && 'select-none',
                    selected.has(look.id)
                      ? 'border-foreground ring-2 ring-foreground'
                      : 'border-border'
                  )}
                >
                  <div className='mb-4 flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='font-heading truncate text-[18px] font-bold tracking-[-0.02em]'>
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
                      {selecting ? (
                        <span
                          className={cn(
                            'flex size-6 items-center justify-center rounded-full border-2 transition-colors',
                            selected.has(look.id)
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border'
                          )}
                        >
                          {selected.has(look.id) && (
                            <CheckIcon className='size-3.5' strokeWidth={3} />
                          )}
                        </span>
                      ) : look.harmony != null && tier ? (
                        <>
                          <span
                            className='font-heading text-[26px] leading-none font-extrabold'
                            style={{ color: tier.solidColor }}
                          >
                            {look.harmony}
                          </span>
                          <span
                            className='mt-1 text-[11px] font-bold tracking-[0.04em] uppercase'
                            style={{ color: tier.solidColor }}
                          >
                            {tier.shortLabel}
                          </span>
                        </>
                      ) : (
                        <span className='font-heading text-[26px] leading-none font-extrabold text-muted-foreground'>
                          —
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    {shown.map(item => {
                      const img = getItemImageSrc(item)
                      return (
                        <span
                          key={item.id}
                          title={item.name}
                          className='relative size-12 overflow-hidden rounded-[11px] border border-border'
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
                      <span className='flex size-12 flex-none items-center justify-center rounded-[11px] border border-dashed border-border text-[12px] font-semibold text-muted-foreground'>
                        +{overflow}
                      </span>
                    )}
                  </div>

                  <div
                    className={cn(
                      'mt-4 flex items-center justify-between gap-2 border-t border-border pt-3.5',
                      selecting && 'pointer-events-none opacity-50'
                    )}
                    onClick={e => {
                      if (!selecting) e.stopPropagation()
                    }}
                  >
                    <div className='relative'>
                      <FolderIcon className='pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground' />
                      <ChevronDownIcon className='pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground' />
                      <select
                        value={look.folderId ?? ''}
                        onChange={e => onMove(look.id, e.target.value || null)}
                        aria-label='Folder'
                        tabIndex={selecting ? -1 : undefined}
                        className='cursor-pointer appearance-none rounded-full border border-border bg-card py-2 pr-8 pl-8 text-[13px] font-semibold text-foreground outline-none'
                      >
                        <option value=''>Unfiled</option>
                        {folders.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectionBar.rendered && (
        <div className='pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4'>
          <div
            className='pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card/95 py-2 pr-2 pl-4 shadow-[0_10px_40px_rgba(20,28,36,0.18)] backdrop-blur'
            style={{
              animation:
                selectionBar.state === 'in'
                  ? 'bar-dock 0.28s cubic-bezier(0.2,0.7,0.2,1) both'
                  : 'bar-undock 0.2s ease-in both',
            }}
          >
            <span className='text-[13px] font-semibold tabular-nums'>
              {selected.size} selected
            </span>
            <span className='mx-1.5 h-4 w-px bg-border' />
            <button
              type='button'
              onClick={toggleSelectAll}
              className='rounded-full px-3 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground'
            >
              {allVisibleSelected ? 'Clear' : 'Select all'}
            </button>
            <button
              type='button'
              disabled={selected.size === 0}
              onClick={deleteSelected}
              className='flex items-center gap-1.5 rounded-full bg-destructive px-4 py-1.5 text-[13px] font-bold text-white transition-opacity disabled:opacity-40'
            >
              <Trash2Icon className='size-3.5' />
              Delete
            </button>
          </div>
        </div>
      )}

      {undoBar.rendered && recentDeleted && (
        <div className='pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4'>
          <div
            className='pointer-events-auto flex items-center gap-1 rounded-full bg-foreground py-2 pr-2 pl-4 text-background shadow-[0_10px_40px_rgba(20,28,36,0.28)]'
            style={{
              animation:
                undoBar.state === 'in'
                  ? 'bar-dock 0.28s cubic-bezier(0.2,0.7,0.2,1) both'
                  : 'bar-undock 0.2s ease-in both',
            }}
          >
            <span className='text-[13px] font-semibold'>
              {recentDeleted.length === 1
                ? 'Outfit deleted'
                : `${recentDeleted.length} outfits deleted`}
            </span>
            <button
              type='button'
              onClick={undoDelete}
              className='ml-1.5 flex items-center gap-1.5 rounded-full bg-background/15 px-3.5 py-1.5 text-[13px] font-bold text-background transition-colors hover:bg-background/25'
            >
              <Undo2Icon className='size-3.5' />
              Undo
            </button>
          </div>
        </div>
      )}

      {creating && (
        <CreateFolderModal
          onClose={() => setCreating(false)}
          onCreate={onCreateFolder}
        />
      )}

      {detailLook && (
        <OutfitDetailModal
          look={detailLook}
          folders={folders}
          onClose={() => setDetailId(null)}
          onMove={folderId => onMove(detailLook.id, folderId)}
          onEdit={() => {
            onEdit(detailLook)
            setDetailId(null)
          }}
          onDuplicate={() => {
            onDuplicate(detailLook)
            setDetailId(null)
          }}
          onDelete={() => {
            removeLooks([detailLook])
            setDetailId(null)
          }}
        />
      )}
    </div>
  )
}
