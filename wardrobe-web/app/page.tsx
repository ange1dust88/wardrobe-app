'use client'

import { PlusIcon, ShirtIcon } from 'lucide-react'
import { useState } from 'react'
import { AddItemModal } from '@/components/items/AddItemModal'
import { ItemList } from '@/components/items/ItemList'
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
import { useItems } from '@/hooks/useItems'
import { useMatches } from '@/hooks/useMatches'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { itemsQuery, createMutation, deleteMutation, seedMutation } =
    useItems()
  const { matchedIds, scoreById } = useMatches(hoveredId)

  const items = itemsQuery.data ?? []
  const errorMessage = itemsQuery.error
    ? (itemsQuery.error as Error).message
    : undefined

  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12'>
      <Frame>
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
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
              >
                {seedMutation.isPending ? 'Loading…' : 'Reset examples'}
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusIcon />
                Add item
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
            <ItemList
              items={items}
              onDelete={id => deleteMutation.mutate(id)}
              hoveredId={hoveredId}
              matchedIds={matchedIds}
              scoreById={scoreById}
              onHover={setHoveredId}
            />
          )}
        </FramePanel>
      </Frame>

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
    </main>
  )
}
