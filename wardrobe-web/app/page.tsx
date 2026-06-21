'use client'

import { PlusIcon, ShirtIcon } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { Onboarding } from '@/components/onboarding/Onboarding'
import { AddItemModal } from '@/components/items/AddItemModal'
import { EditItemModal } from '@/components/items/EditItemModal'
import { DevPanel } from '@/components/DevPanel'
import { MatchWheel } from '@/components/items/MatchWheel'
import { OutfitPanel } from '@/components/items/OutfitPanel'
import { SavedOutfits } from '@/components/items/SavedOutfits'
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
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from '@/components/ui/frame'
import { Spinner } from '@/components/ui/spinner'
import type { Item } from '@/lib/items'
import { useItems } from '@/hooks/useItems'
import { useProfile } from '@/hooks/useProfile'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfitBuilder } from '@/hooks/useOutfitBuilder'
import { useOutfits } from '@/hooks/useOutfits'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className='flex min-h-[60vh] items-center justify-center'>
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
      <main className='flex min-h-[60vh] items-center justify-center'>
        <Spinner className='size-6 text-muted-foreground' />
      </main>
    )
  }

  const profile = profileQuery.data ?? null
  if (!profile || !profile.onboardedAt) {
    return <Onboarding onComplete={input => saveMutation.mutate(input)} />
  }

  return <Wardrobe initialColorType={profile.palettes[0] ?? null} />
}

function Wardrobe({ initialColorType }: { initialColorType: string | null }) {
  const { signOut } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [colorType, setColorType] = useState<string | null>(initialColorType)
  const [showSeasons, setShowSeasons] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const { itemsQuery, createMutation, updateMutation, deleteMutation } =
    useItems()
  const builder = useOutfitBuilder(colorType)
  const { outfitsQuery, deleteMutation: deleteOutfitMutation } = useOutfits()

  const items = itemsQuery.data ?? []
  const building = builder.selectedIds.length > 0
  const matchMap = useMatchMap(colorType)

  const hoverScores =
    !building && hoveredId ? (matchMap.data?.[hoveredId] ?? {}) : {}
  const matchedIds = building
    ? builder.matchedIds
    : new Set(Object.keys(hoverScores))
  const scoreById = building ? builder.scoreById : hoverScores

  const errorMessage = itemsQuery.error
    ? (itemsQuery.error as Error).message
    : undefined

  const hasItems = !itemsQuery.isLoading && !errorMessage && items.length > 0

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12'>
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        <Frame className='min-w-0 flex-1'>
          <FramePanel>
            <FrameHeader className='flex-row items-center justify-between gap-4'>
              <div>
                <FrameTitle className='font-heading text-2xl'>
                  Wardrobe
                </FrameTitle>
                <FrameDescription>
                  {itemsQuery.isLoading
                    ? 'Loading your closet…'
                    : `${items.length} item${items.length === 1 ? '' : 's'}`}
                </FrameDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Button onClick={() => setIsModalOpen(true)}>
                  <PlusIcon />
                  Add item
                </Button>
                <Button variant='outline' onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            </FrameHeader>
          </FramePanel>

          <FramePanel>
            {itemsQuery.isLoading ? (
              <div className='flex items-center justify-center py-16'>
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
            ) : (
              <MatchWheel
                items={items}
                onEdit={setEditingItem}
                hoveredId={hoveredId}
                selectedIds={builder.selectedIds}
                matchedIds={matchedIds}
                scoreById={scoreById}
                showSeasons={showSeasons}
                onSelect={builder.toggle}
                onHover={setHoveredId}
              />
            )}
          </FramePanel>
        </Frame>

        {hasItems && (
          <div className='lg:sticky lg:top-6'>
            <OutfitPanel
              items={builder.selected}
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
          </div>
        )}
      </div>

      {hasItems && (
        <SavedOutfits
          outfits={outfitsQuery.data ?? []}
          items={items}
          onDelete={id => deleteOutfitMutation.mutate(id)}
        />
      )}

      <AddItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values, callbacks) =>
          createMutation.mutate(values, callbacks)
        }
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

      <DevPanel
        colorType={colorType}
        onColorType={setColorType}
        showSeasons={showSeasons}
        onShowSeasons={setShowSeasons}
      />
    </main>
  )
}
