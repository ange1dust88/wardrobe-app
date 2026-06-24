'use client'

import { PlusIcon, ShirtIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { AppHeader } from '@/components/AppHeader'
import { AddItemModal } from '@/components/items/AddItemModal'
import { EditItemModal } from '@/components/items/EditItemModal'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { MatchWheel } from '@/components/items/MatchWheel'
import { WardrobeGrid } from '@/components/items/WardrobeGrid'
import { OutfitBuilder } from '@/components/items/OutfitBuilder'
import { OutfitsView, type SavedLook } from '@/components/items/OutfitsView'
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
import { CATEGORIES, type Item, type MatchMap } from '@/lib/items'
import { cn } from '@/lib/utils'
import { useItems } from '@/hooks/useItems'
import { useProfile } from '@/hooks/useProfile'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfitBuilder } from '@/hooks/useOutfitBuilder'
import { useOutfits } from '@/hooks/useOutfits'

function harmonyOf(ids: string[], map: MatchMap): number {
  let sum = 0
  let count = 0
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const s = map[ids[i]]?.[ids[j]] ?? map[ids[j]]?.[ids[i]]
      if (s != null) {
        sum += s
        count += 1
      }
    }
  }
  return count ? Math.round(sum / count) : 0
}

function viewTab(active: boolean): string {
  return cn(
    'rounded-[9px] px-3.5 py-[7px] text-[13px] font-semibold transition-colors',
    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
  )
}

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className='flex min-h-svh items-center justify-center'>
        <Spinner className='size-6 text-muted-foreground' />
      </main>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <AuthedApp key={user.id} />
}

function AuthedApp() {
  const { profileQuery, saveMutation } = useProfile()

  if (profileQuery.isLoading) {
    return (
      <main className='flex min-h-svh items-center justify-center'>
        <Spinner className='size-6 text-muted-foreground' />
      </main>
    )
  }

  const profile = profileQuery.data ?? null
  if (!profile || !profile.onboardedAt) {
    return <Onboarding onComplete={input => saveMutation.mutate(input)} />
  }

  return <AppShell colorType={profile.palettes[0] ?? null} />
}

function AppShell({ colorType }: { colorType: string | null }) {
  const { user } = useAuth()
  const [nav, setNav] = useState<'wardrobe' | 'outfits'>('wardrobe')
  const [view, setView] = useState<'circular' | 'list'>('circular')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const { itemsQuery, createMutation, updateMutation, deleteMutation } =
    useItems()
  const builder = useOutfitBuilder(colorType)
  const { outfitsQuery, deleteMutation: deleteOutfitMutation } = useOutfits()
  const matchMap = useMatchMap(colorType)

  const items = itemsQuery.data ?? []
  const map = matchMap.data ?? {}

  const orderedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const ca = CATEGORIES.indexOf(a.category)
        const cb = CATEGORIES.indexOf(b.category)
        return ca !== cb ? ca - cb : a.name.localeCompare(b.name)
      }),
    [items]
  )

  const activeId = hoveredId ?? focusId
  const scoreById = activeId ? (map[activeId] ?? {}) : {}
  const matchedIds = new Set(Object.keys(scoreById))

  const harmony =
    builder.selectedIds.length >= 2 ? harmonyOf(builder.selectedIds, map) : null

  function browse(dir: number) {
    setHoveredId(null)
    if (!orderedItems.length) return
    setFocusId(prev => {
      const cur = prev ? orderedItems.findIndex(i => i.id === prev) : -1
      const len = orderedItems.length
      const ni = (((cur + dir) % len) + len) % len
      return orderedItems[ni].id
    })
  }

  useEffect(() => {
    if (nav !== 'wardrobe' || view !== 'circular') return
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      setHoveredId(null)
      setFocusId(prev => {
        if (!orderedItems.length) return prev
        const cur = prev ? orderedItems.findIndex(i => i.id === prev) : -1
        const len = orderedItems.length
        const ni = (((cur + dir) % len) + len) % len
        return orderedItems[ni].id
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav, view, orderedItems])

  const errorMessage = itemsQuery.error
    ? (itemsQuery.error as Error).message
    : undefined
  const hasItems = !itemsQuery.isLoading && !errorMessage && items.length > 0
  const catCount = new Set(items.map(i => i.category)).size
  const savedCount = outfitsQuery.data?.length ?? 0
  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'U'

  const itemById = new Map(items.map(i => [i.id, i]))
  const looks: SavedLook[] = (outfitsQuery.data ?? []).map(o => ({
    id: o.id,
    name: o.name,
    harmony: harmonyOf(o.itemIds, map),
    items: o.itemIds
      .map(id => itemById.get(id))
      .filter((i): i is Item => i != null),
  }))

  return (
    <div className='min-h-svh'>
      <AppHeader
        nav={nav}
        onNav={setNav}
        savedCount={savedCount}
        userInitial={userInitial}
        onAddItem={() => setIsModalOpen(true)}
        onProfile={() => setProfileOpen(true)}
      />

      {nav === 'outfits' ? (
        <OutfitsView
          looks={looks}
          onDelete={id => deleteOutfitMutation.mutate(id)}
          onBuild={() => setNav('wardrobe')}
        />
      ) : (
        <div className='px-6 pt-7 pb-[70px] sm:px-8'>
          <div className='mx-auto flex max-w-[1500px] flex-col gap-[26px] lg:flex-row lg:items-start'>
            <div className='flex min-w-0 flex-1 flex-col gap-[18px]'>
              <div className='flex flex-wrap items-end justify-between gap-5'>
                <div>
                  <h1 className='font-heading text-[28px] leading-none font-bold tracking-tight'>
                    Your wardrobe
                  </h1>
                  <p className='mt-1.5 text-[13.5px] text-muted-foreground'>
                    {items.length} item{items.length === 1 ? '' : 's'} ·{' '}
                    {catCount} categor{catCount === 1 ? 'y' : 'ies'}
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  {view === 'circular' && hasItems && (
                    <div className='flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pr-1.5 pl-3.5'>
                      <span className='text-xs font-semibold tracking-wide text-muted-foreground'>
                        Browse
                      </span>
                      <button
                        type='button'
                        onClick={() => browse(-1)}
                        aria-label='Previous'
                        className='flex size-[30px] items-center justify-center rounded-[9px] border border-border bg-background text-lg text-foreground'
                      >
                        ‹
                      </button>
                      <button
                        type='button'
                        onClick={() => browse(1)}
                        aria-label='Next'
                        className='flex size-[30px] items-center justify-center rounded-[9px] border border-border bg-background text-lg text-foreground'
                      >
                        ›
                      </button>
                    </div>
                  )}
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
                    <Button onClick={() => setIsModalOpen(true)}>
                      <PlusIcon />
                      Add item
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : view === 'circular' ? (
                <div className='flex items-center justify-center rounded-[20px] border border-border bg-card p-6 shadow-sm'>
                  <MatchWheel
                    items={items}
                    activeId={activeId}
                    selectedIds={builder.selectedIds}
                    matchedIds={matchedIds}
                    scoreById={scoreById}
                    onHover={setHoveredId}
                    onSelect={builder.toggle}
                    onEdit={setEditingItem}
                  />
                </div>
              ) : (
                <WardrobeGrid
                  items={items}
                  selectedIds={builder.selectedIds}
                  onSelect={builder.toggle}
                  onEdit={setEditingItem}
                />
              )}
            </div>

            {hasItems && (
              <OutfitBuilder
                items={builder.selected}
                harmony={harmony}
                onRemove={builder.remove}
                onClear={builder.clear}
                onSave={name => builder.saveMutation.mutate(name)}
                saving={builder.saveMutation.isPending}
                errorMessage={
                  builder.saveMutation.error
                    ? (builder.saveMutation.error as Error).message
                    : undefined
                }
              />
            )}
          </div>
        </div>
      )}

      <AddItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values, callbacks) => createMutation.mutate(values, callbacks)}
        pending={createMutation.isPending}
        errorMessage={
          createMutation.error
            ? (createMutation.error as Error).message
            : undefined
        }
      />

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

      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          itemCount={items.length}
          outfitCount={savedCount}
        />
      )}
    </div>
  )
}
