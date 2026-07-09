'use client'

import { useRouter } from 'next/navigation'
import { useAppContext } from '@/components/AppContext'
import { OutfitsView, type SavedLook } from '@/components/items/OutfitsView'
import { type Item } from '@/lib/items'
import { harmonyOf } from '@/lib/harmony'
import { notifyError, notifySuccess } from '@/lib/toast'
import { useFolders } from '@/hooks/useFolders'
import { useItems } from '@/hooks/useItems'
import { useMatchMap } from '@/hooks/useMatchMap'
import { useOutfits } from '@/hooks/useOutfits'

function copyName(base: string, taken: Set<string>): string {
  let candidate = `${base} copy`
  let n = 2
  while (taken.has(candidate)) {
    candidate = `${base} copy ${n}`
    n += 1
  }
  return candidate
}

export default function OutfitsPage() {
  const router = useRouter()
  const { colorType, setEditingOutfit, editingOutfit, builder } =
    useAppContext()
  const { itemsQuery } = useItems()
  const { outfitsQuery, duplicateMutation, moveMutation, deleteMutation } =
    useOutfits()
  const { foldersQuery, createMutation, deleteMutation: deleteFolderMutation } =
    useFolders()
  const matchMap = useMatchMap(colorType, true)

  const items = itemsQuery.data ?? []
  const map = matchMap.data ?? {}
  const outfits = outfitsQuery.data ?? []
  const folders = foldersQuery.data ?? []
  const itemById = new Map(items.map(i => [i.id, i]))
  const mapReady = !matchMap.isLoading && matchMap.data != null

  const looks: SavedLook[] = outfits.map(o => {
    const found = o.itemIds
      .map(id => itemById.get(id))
      .filter((i): i is Item => i != null)
    return {
      id: o.id,
      name: o.name,
      createdAt: o.createdAt,
      harmony: mapReady ? harmonyOf(o.itemIds, map) : null,
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
        if (!outfit) return
        const hasUnsavedWork =
          builder.selectedIds.length > 0 && builder.editingId !== outfit.id
        if (
          hasUnsavedWork &&
          !window.confirm(
            'You have a look in progress on the wheel. Replace it with this outfit?'
          )
        ) {
          return
        }
        setEditingOutfit(outfit)
        router.push('/')
      }}
      onDuplicate={look =>
        duplicateMutation.mutate(
          {
            name: copyName(look.name, new Set(outfits.map(o => o.name))),
            itemIds: look.items.map(i => i.id),
            folderId: look.folderId,
          },
          {
            onSuccess: () => notifySuccess('Outfit duplicated'),
            onError: err =>
              notifyError('Could not duplicate', (err as Error).message),
          }
        )
      }
      onDelete={id =>
        deleteMutation.mutate(id, {
          onSuccess: () => {
            if (editingOutfit?.id === id) {
              setEditingOutfit(null)
              builder.clear()
            }
            notifySuccess('Outfit deleted')
          },
          onError: err =>
            notifyError('Could not delete', (err as Error).message),
        })
      }
      onCreateFolder={name =>
        createMutation.mutate(name, {
          onSuccess: () => notifySuccess('Folder created'),
          onError: err =>
            notifyError('Could not create folder', (err as Error).message),
        })
      }
      onDeleteFolder={id =>
        deleteFolderMutation.mutate(id, {
          onSuccess: () => notifySuccess('Folder deleted'),
          onError: err =>
            notifyError('Could not delete folder', (err as Error).message),
        })
      }
      onMove={(id, folderId) =>
        moveMutation.mutate(
          { id, folderId },
          {
            onError: err =>
              notifyError('Could not move outfit', (err as Error).message),
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
