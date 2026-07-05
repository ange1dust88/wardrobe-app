'use client'

import { useRouter } from 'next/navigation'
import { useAppContext } from '@/components/AppContext'
import { OutfitsView, type SavedLook } from '@/components/items/OutfitsView'
import { type Item } from '@/lib/items'
import { harmonyOf } from '@/lib/harmony'
import { useItems } from '@/hooks/useItems'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfits } from '@/hooks/useOutfits'

export default function OutfitsPage() {
  const router = useRouter()
  const { colorType, setEditingOutfit } = useAppContext()
  const { itemsQuery } = useItems()
  const { outfitsQuery, deleteMutation } = useOutfits()
  const matchMap = useMatchMap(colorType, false)

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

  return (
    <OutfitsView
      looks={looks}
      loading={outfitsQuery.isLoading}
      errorMessage={errorMessage}
      onOpen={look => {
        const outfit = outfits.find(o => o.id === look.id)
        if (outfit) {
          setEditingOutfit(outfit)
          router.push('/')
        }
      }}
      onDelete={id => deleteMutation.mutate(id)}
      onBuild={() => {
        setEditingOutfit(null)
        router.push('/')
      }}
    />
  )
}
