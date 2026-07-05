'use client'

import { PlusIcon, ShirtIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppContext } from '@/components/AppContext'
import { EditItemModal } from '@/components/items/EditItemModal'
import { MatchWheel } from '@/components/items/MatchWheel'
import { OutfitCarousel } from '@/components/items/OutfitCarousel'
import { OutfitBuilder } from '@/components/items/OutfitBuilder'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { STACK_POLICY, type Item, type ScoreBreakdown } from '@/lib/items'
import { harmonyOf } from '@/lib/harmony'
import { cn } from '@/lib/utils'
import { notifySuccess } from '@/lib/toast'
import { useItems } from '@/hooks/useItems'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfitBuilder } from '@/hooks/useOutfitBuilder'

function viewTab(active: boolean): string {
  return cn(
    'rounded-[9px] px-3.5 py-[7px] text-[13px] font-semibold transition-colors',
    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
  )
}

export default function WardrobePage() {
  const router = useRouter()
  const {
    colorType,
    openAddItem,
    showBreakdown,
    editingOutfit,
    setEditingOutfit,
  } = useAppContext()
  const [view, setView] = useState<'circular' | 'list'>('circular')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [allowConflicts, setAllowConflicts] = useState(false)

  const { itemsQuery, updateMutation, deleteMutation } = useItems()
  const builder = useOutfitBuilder()
  const matchMap = useMatchMap(colorType, allowConflicts)

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const map = matchMap.data ?? {}

  const loadOutfit = builder.load
  const loadedEditRef = useRef<string | null>(null)
  useEffect(() => {
    if (!editingOutfit) {
      loadedEditRef.current = null
      return
    }
    if (items.length === 0) return
    if (loadedEditRef.current === editingOutfit.id) return
    loadedEditRef.current = editingOutfit.id
    const byId = new Map(items.map(i => [i.id, i]))
    const picked = editingOutfit.itemIds
      .map(id => byId.get(id))
      .filter((i): i is Item => i != null)
    loadOutfit(editingOutfit, picked)
  }, [editingOutfit, items, loadOutfit])

  const building = builder.selectedIds.length > 0
  const hoverCells = !building && hoveredId ? (map[hoveredId] ?? {}) : {}
  const itemById = new Map(items.map(i => [i.id, i]))
  const hoveredItem = hoveredId ? itemById.get(hoveredId) : undefined

  const scoreById: Record<string, number> = {}
  const breakdownById: Record<string, ScoreBreakdown> = {}

  if (building) {
    const sel = builder.selectedIds
    const filledCategories = new Set(
      items.filter(i => sel.includes(i.id)).map(i => i.category)
    )
    for (const item of items) {
      if (sel.includes(item.id)) continue
      if (
        STACK_POLICY[item.category] !== 'unlimited' &&
        filledCategories.has(item.category)
      ) {
        continue
      }
      let sum = 0
      let ok = true
      const acc: ScoreBreakdown = {
        color: 0,
        role: 0,
        season: 0,
        palette: 0,
        style: 0,
        pattern: 0,
        fit: 0,
      }
      for (const s of sel) {
        const cell = map[s]?.[item.id]
        if (cell == null) {
          ok = false
          break
        }
        sum += cell.score
        acc.color += cell.breakdown.color
        acc.role += cell.breakdown.role
        acc.season += cell.breakdown.season
        acc.palette += cell.breakdown.palette
        acc.style += cell.breakdown.style
        acc.pattern += cell.breakdown.pattern
        acc.fit += cell.breakdown.fit
      }
      if (ok) {
        const n = sel.length
        scoreById[item.id] = Math.round(sum / n)
        breakdownById[item.id] = {
          color: acc.color / n,
          role: acc.role / n,
          season: acc.season / n,
          palette: acc.palette / n,
          style: acc.style / n,
          pattern: acc.pattern / n,
          fit: acc.fit / n,
        }
      }
    }
  } else {
    for (const [id, cell] of Object.entries(hoverCells)) {
      const cand = itemById.get(id)
      if (
        hoveredItem &&
        cand &&
        cand.category === hoveredItem.category &&
        STACK_POLICY[cand.category] !== 'unlimited'
      ) {
        continue
      }
      scoreById[id] = cell.score
      breakdownById[id] = cell.breakdown
    }
  }

  const matchedIds = new Set(Object.keys(scoreById))

  const harmony =
    builder.selectedIds.length >= 2 ? harmonyOf(builder.selectedIds, map) : null

  const errorMessage = itemsQuery.error
    ? (itemsQuery.error as Error).message
    : undefined
  const hasItems = !itemsQuery.isLoading && !errorMessage && items.length > 0
  const catCount = new Set(items.map(i => i.category)).size

  return (
    <div className='px-6 pt-7 pb-[70px] sm:px-8'>
      <div className='mx-auto flex max-w-[1500px] flex-col gap-[26px] lg:flex-row lg:items-start'>
        <div className='flex min-w-0 flex-1 flex-col gap-[18px]'>
          <div className='flex flex-wrap items-end justify-between gap-5'>
            <div>
              <h1 className='font-heading text-[28px] leading-none font-bold tracking-tight'>
                Your wardrobe
              </h1>
              <p className='mt-1.5 text-[13.5px] text-muted-foreground'>
                {items.length} item{items.length === 1 ? '' : 's'} · {catCount}{' '}
                categor{catCount === 1 ? 'y' : 'ies'}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex gap-0.5 rounded-xl bg-muted/60 p-1'>
                <button
                  type='button'
                  onClick={() => setView('circular')}
                  className={viewTab(view === 'circular')}
                >
                  ◎ Circular
                </button>
                <button
                  type='button'
                  onClick={() => setView('list')}
                  className={viewTab(view === 'list')}
                >
                  ☰ List
                </button>
              </div>
            </div>
          </div>

          {itemsQuery.isLoading ? (
            <div className='flex items-center justify-center py-24'>
              <Spinner className='size-6 text-muted-foreground' />
            </div>
          ) : errorMessage ? (
            <Alert variant='error'>
              <AlertTitle>Failed to load items</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <ShirtIcon />
                </EmptyMedia>
                <EmptyTitle>Your wardrobe is empty</EmptyTitle>
                <EmptyDescription>
                  Add your first piece to start building your closet.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={openAddItem}>
                  <PlusIcon />
                  Add item
                </Button>
              </EmptyContent>
            </Empty>
          ) : view === 'circular' ? (
            <div className='flex items-center justify-center rounded-[20px] border border-border bg-card p-6 shadow-sm'>
              <MatchWheel
                items={items}
                activeId={hoveredId}
                selectedIds={builder.selectedIds}
                matchedIds={matchedIds}
                scoreById={scoreById}
                breakdownById={showBreakdown ? breakdownById : {}}
                onHover={setHoveredId}
                onSelect={builder.toggle}
                onEdit={setEditingItem}
              />
            </div>
          ) : (
            <OutfitCarousel
              items={items}
              selectedIds={builder.selectedIds}
              map={map}
              onSelect={builder.toggle}
            />
          )}
        </div>

        {hasItems && (
          <OutfitBuilder
            items={builder.selected}
            harmony={harmony}
            editing={builder.editingId != null}
            name={builder.name}
            onNameChange={builder.setName}
            onCancel={() => {
              setAllowConflicts(false)
              builder.clear()
              setEditingOutfit(null)
              router.push('/outfits')
            }}
            allowConflicts={allowConflicts}
            onAllowConflicts={() => setAllowConflicts(true)}
            onRemove={builder.remove}
            onClear={() => {
              setAllowConflicts(false)
              builder.clearItems()
            }}
            onSave={() => {
              const wasEditing = builder.editingId != null
              builder.saveMutation.mutate(undefined, {
                onSuccess: () => {
                  setEditingOutfit(null)
                  notifySuccess(wasEditing ? 'Outfit updated' : 'Outfit saved')
                  if (wasEditing) router.push('/outfits')
                },
              })
            }}
            saving={builder.saveMutation.isPending}
            errorMessage={
              builder.saveMutation.error
                ? (builder.saveMutation.error as Error).message
                : undefined
            }
          />
        )}
      </div>

      {editingItem && (
        <EditItemModal
          key={editingItem.id}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(id, body, callbacks) =>
            updateMutation.mutate({ id, body }, callbacks)
          }
          onDelete={(id, callbacks) => deleteMutation.mutate(id, callbacks)}
          pending={updateMutation.isPending}
          deleting={deleteMutation.isPending}
          errorMessage={
            updateMutation.error
              ? (updateMutation.error as Error).message
              : undefined
          }
        />
      )}
    </div>
  )
}
