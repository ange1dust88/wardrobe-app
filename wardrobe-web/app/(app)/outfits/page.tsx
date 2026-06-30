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
  const { colorType } = useAppContext()
  const { itemsQuery } = useItems()
  const { outfitsQuery, deleteMutation } = useOutfits()
  const matchMap = useMatchMap(colorType, false)

  const items = itemsQuery.data ?? []
  const map = matchMap.data ?? {}
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
    <OutfitsView
      looks={looks}
      onDelete={id => deleteMutation.mutate(id)}
      onBuild={() => router.push('/')}
    />
  )
}
