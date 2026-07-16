'use client'

import { PlusIcon, ShirtIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useAppContext, type WardrobeView } from '@/components/AppContext'
import { EditItemModal } from '@/components/items/EditItemModal'
import { MatchWheel } from '@/components/items/MatchWheel'
import { OutfitCarousel } from '@/components/items/OutfitCarousel'
import { OutfitBar } from '@/components/items/OutfitBar'
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
import { GarmentLoader } from '@/components/GarmentLoader'
import { HiddenShelf } from '@/components/items/HiddenShelf'
import { WardrobeFilter } from '@/components/items/WardrobeFilter'
import {
  CATEGORIES,
  STACK_POLICY,
  type Category,
  type Item,
  type ScoreBreakdown,
} from '@/lib/items'
import { harmonyOf } from '@/lib/harmony'
import { MIN_RECOMMENDABLE_SCORE } from '@/lib/match-score'
import { capture } from '@/lib/analytics'
import { useItems } from '@/hooks/useItems'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfits } from '@/hooks/useOutfits'

export function WardrobeScreen({ view }: { view: WardrobeView }) {
  const router = useRouter()
  const {
    colorType,
    openAddItem,
    showBreakdown,
    setEditingOutfit,
    searchOpen,
    setSearchOpen,
    hiddenOpen,
    setHiddenOpen,
    excluded,
    builder,
  } = useAppContext()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [allowConflicts, setAllowConflicts] = useState(false)
  const [dupNotice, setDupNotice] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState<Category | null>(null)

  const { itemsQuery, updateMutation, deleteMutation } = useItems()
  const { outfitsQuery } = useOutfits()
  const excludedIds = excluded.excludedIds
  const toggleExcluded = excluded.toggle
  const hideItem = (item: Item) => {
    toggleExcluded(item.id)
    capture('item_hidden', { category: item.category })
  }
  const matchMap = useMatchMap(colorType, allowConflicts)

  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data])
  const map = matchMap.data ?? {}

  const presentCategories = useMemo(
    () => CATEGORIES.filter(c => items.some(i => i.category === c)),
    [items]
  )
  const filterMatchIds = useMemo(() => {
    if (!searchOpen) return null
    const q = query.trim().toLowerCase()
    if (q.length === 0 && catFilter == null) return null
    return new Set(
      items
        .filter(
          i =>
            (!q || i.name.toLowerCase().includes(q)) &&
            (!catFilter || i.category === catFilter)
        )
        .map(i => i.id)
    )
  }, [items, query, catFilter, searchOpen])

  const building = builder.selectedIds.length > 0
  const hoverCells =
    !building && hoveredId && !excludedIds.has(hoveredId)
      ? (map[hoveredId] ?? {})
      : {}
  const itemById = new Map(items.map(i => [i.id, i]))
  const hoveredItem = hoveredId ? itemById.get(hoveredId) : undefined

  const scoreById: Record<string, number> = {}
  const breakdownById: Record<string, ScoreBreakdown> = {}

  if (building) {
    const sel = builder.selectedIds
    const filledCategories = new Set(
      items.filter(i => sel.includes(i.id)).map(i => i.category)
    )
    const savedSignatures = new Set(
      (outfitsQuery.data ?? [])
        .filter(o => o.id !== builder.editingId)
        .map(o => [...o.itemIds].sort().join(','))
    )
    for (const item of items) {
      if (sel.includes(item.id)) continue
      if (excludedIds.has(item.id)) continue
      if (savedSignatures.has([...sel, item.id].sort().join(','))) continue
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
        const avg = Math.round(sum / n)
        if (avg < MIN_RECOMMENDABLE_SCORE) continue
        scoreById[item.id] = avg
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
      if (cell.score < MIN_RECOMMENDABLE_SCORE) continue
      if (excludedIds.has(id)) continue
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
    builder.selectedIds.length >= 2 && !matchMap.isLoading
      ? harmonyOf(builder.selectedIds, map)
      : null

  const errorMessage = itemsQuery.error
    ? (itemsQuery.error as Error).message
    : undefined
  const hasItems = !itemsQuery.isLoading && !errorMessage && items.length > 0

  return (
    <div className='px-6 pt-6 pb-[168px] sm:px-12'>
      {hasItems && (
        <WardrobeFilter
          open={searchOpen}
          query={query}
          onQuery={setQuery}
          categories={presentCategories}
          activeCat={catFilter}
          onCat={setCatFilter}
          resultCount={filterMatchIds?.size ?? 0}
          total={items.length}
          onClose={() => setSearchOpen(false)}
        />
      )}
      <div className='min-h-[calc(100svh-232px)]'>
        {itemsQuery.isLoading ? (
          <div className='flex min-h-[calc(100svh-232px)] items-center justify-center'>
            <GarmentLoader label='loading your wardrobe' />
          </div>
        ) : errorMessage ? (
          <div className='flex min-h-[calc(100svh-232px)] items-center justify-center'>
            <Alert variant='error' className='max-w-lg'>
              <AlertTitle>Failed to load items</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        ) : items.length === 0 ? (
          <div className='flex min-h-[calc(100svh-232px)] items-center justify-center'>
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
          </div>
        ) : view === 'circular' ? (
          <div className='flex min-h-[calc(100svh-232px)] items-center justify-center'>
            <div className='flex w-full max-w-[760px] items-center justify-center'>
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
                excludedIds={excludedIds}
                matchLoading={matchMap.isLoading}
                filterMatchIds={filterMatchIds}
                onToggleExclude={hideItem}
              />
            </div>
          </div>
        ) : (
          <div className={searchOpen ? 'pt-[56px]' : ''}>
            <OutfitCarousel
              items={items}
              selectedIds={builder.selectedIds}
              activeId={hoveredId}
              matchedIds={matchedIds}
              scoreById={scoreById}
              breakdownById={showBreakdown ? breakdownById : {}}
              onHover={setHoveredId}
              onSelect={builder.toggle}
              onEdit={setEditingItem}
              excludedIds={excludedIds}
              filterMatchIds={filterMatchIds}
              onToggleExclude={hideItem}
            />
          </div>
        )}
      </div>

      <HiddenShelf
        open={hiddenOpen}
        onClose={() => setHiddenOpen(false)}
        items={items}
        excludedIds={excludedIds}
        onRestore={excluded.restore}
        onRestoreAll={excluded.restoreAll}
        onHideMany={excluded.hideMany}
      />

      {hasItems && (
        <OutfitBar
          items={builder.selected}
          harmony={harmony}
          editing={builder.editingId != null}
          dirty={builder.isDirty}
          name={builder.name}
          onNameChange={builder.setName}
          onCancel={() => {
            setAllowConflicts(false)
            builder.saveMutation.reset()
            builder.clear()
            setEditingOutfit(null)
            router.push('/outfits')
          }}
          allowConflicts={allowConflicts}
          onAllowConflicts={() => setAllowConflicts(true)}
          onRemove={builder.remove}
          onClear={() => {
            setAllowConflicts(false)
            setDupNotice(null)
            builder.saveMutation.reset()
            builder.clearItems()
          }}
          onSave={() => {
            setDupNotice(null)
            const wasEditing = builder.editingId != null
            const sig = [...builder.selectedIds].sort().join(',')
            const dup = (outfitsQuery.data ?? []).find(
              o =>
                o.id !== builder.editingId &&
                [...o.itemIds].sort().join(',') === sig
            )
            if (dup) {
              setDupNotice(
                `This exact set is already saved as “${dup.name}”. Duplicate it if you want a copy.`
              )
              return
            }
            builder.saveMutation.mutate(undefined, {
              onSuccess: () => {
                setAllowConflicts(false)
                setEditingOutfit(null)
                capture('outfit_saved', {
                  pieces: builder.selectedIds.length,
                  editing: wasEditing,
                })
                if (wasEditing) router.push('/outfits')
              },
            })
          }}
          saving={builder.saveMutation.isPending}
          errorMessage={
            dupNotice ??
            (builder.saveMutation.error
              ? (builder.saveMutation.error as Error).message
              : undefined)
          }
        />
      )}

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
