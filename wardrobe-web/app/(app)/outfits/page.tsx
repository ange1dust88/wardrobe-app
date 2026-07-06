'use client'

import { useRouter } from 'next/navigation'
import { useAppContext } from '@/components/AppContext'
import { OutfitsView, type SavedLook } from '@/components/items/OutfitsView'
import { type Item } from '@/lib/items'
import { harmonyOf } from '@/lib/harmony'
import { notifySuccess } from '@/lib/toast'
import { useFolders } from '@/hooks/useFolders'
import { useItems } from '@/hooks/useItems'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfits } from '@/hooks/useOutfits'

export default function OutfitsPage() {
  const router = useRouter()
  const { colorType, setEditingOutfit } = useAppContext()
  const { itemsQuery } = useItems()
  const { outfitsQuery, duplicateMutation, moveMutation, deleteMutation } =
    useOutfits()
  const { foldersQuery, createMutation, deleteMutation: deleteFolderMutation } =
    useFolders()
  const matchMap = useMatchMap(colorType, false)

  const items = itemsQuery.data ?? []
  const map = matchMap.data ?? {}
  const outfits = outfitsQuery.data ?? []
  const folders = foldersQuery.data ?? []
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
      folderId: o.folderId ?? null,
    }
  })

  const errorMessage = outfitsQuery.error
    ? (outfitsQuery.error as Error).message
    : undefined

  return (
    <OutfitsView
      looks={looks}
      folders={folders}
      loading={outfitsQuery.isLoading}
      errorMessage={errorMessage}
      onEdit={look => {
        const outfit = outfits.find(o => o.id === look.id)
        if (outfit) {
          setEditingOutfit(outfit)
          router.push('/')
        }
      }}
      onDuplicate={look =>
        duplicateMutation.mutate(
          {
            name: `${look.name} copy`,
            itemIds: look.items.map(i => i.id),
          },
          { onSuccess: () => notifySuccess('Outfit duplicated') }
        )
      }
      onDelete={id =>
        deleteMutation.mutate(id, {
          onSuccess: () => notifySuccess('Outfit deleted'),
        })
      }
      onCreateFolder={name =>
        createMutation.mutate(name, {
          onSuccess: () => notifySuccess('Folder created'),
        })
      }
      onDeleteFolder={id =>
        deleteFolderMutation.mutate(id, {
          onSuccess: () => notifySuccess('Folder deleted'),
        })
      }
      onMove={(id, folderId) =>
        moveMutation.mutate(
          { id, folderId },
          {
            onSuccess: () =>
              notifySuccess(folderId ? 'Moved to folder' : 'Removed from folder'),
          }
        )
      }
      onBuild={() => {
        setEditingOutfit(null)
        router.push('/')
      }}
    />
  )
}
