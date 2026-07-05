'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppContext } from '@/components/AppContext'
import { EditOutfitModal } from '@/components/items/EditOutfitModal'
import { OutfitsView, type SavedLook } from '@/components/items/OutfitsView'
import { type Item, type Outfit } from '@/lib/items'
import { harmonyOf } from '@/lib/harmony'
import { useItems } from '@/hooks/useItems'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfits } from '@/hooks/useOutfits'

export default function OutfitsPage() {
  const router = useRouter()
  const { colorType } = useAppContext()
  const { itemsQuery } = useItems()
  const { outfitsQuery, updateMutation, deleteMutation } = useOutfits()
  const matchMap = useMatchMap(colorType, false)
  const [editing, setEditing] = useState<Outfit | null>(null)

  const items = itemsQuery.data ?? []
  const map = matchMap.data ?? {}
  const outfits = outfitsQuery.data ?? []
  const itemById = new Map(items.map(i => [i.id, i]))

  const looks: SavedLook[] = outfits.map(o => {
    const found = o.itemIds
      .map(id => itemById.get(id))
      .filter((i): i is Item => i != null)
    return {
      id: o.id,
      name: o.name,
      createdAt: o.createdAt,
      harmony: harmonyOf(o.itemIds, map),
      items: found,
      missingCount: o.itemIds.length - found.length,
    }
  })

  const errorMessage = outfitsQuery.error
    ? (outfitsQuery.error as Error).message
    : undefined

  function closeEditor() {
    setEditing(null)
    updateMutation.reset()
    deleteMutation.reset()
  }

  return (
    <>
      <OutfitsView
        looks={looks}
        loading={outfitsQuery.isLoading}
        errorMessage={errorMessage}
        onOpen={look => {
          const outfit = outfits.find(o => o.id === look.id)
          if (outfit) setEditing(outfit)
        }}
        onBuild={() => router.push('/')}
      />

      {editing && (
        <EditOutfitModal
          key={editing.id}
          outfit={editing}
          items={items}
          map={map}
          onClose={closeEditor}
          onSave={(id, body) =>
            updateMutation.mutate({ id, body }, { onSuccess: closeEditor })
          }
          onDelete={id => deleteMutation.mutate(id, { onSuccess: closeEditor })}
          pending={updateMutation.isPending}
          deleting={deleteMutation.isPending}
          errorMessage={
            updateMutation.error
              ? (updateMutation.error as Error).message
              : deleteMutation.error
                ? (deleteMutation.error as Error).message
                : undefined
          }
        />
      )}
    </>
  )
}
