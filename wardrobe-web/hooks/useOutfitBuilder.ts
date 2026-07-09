import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { createOutfit, updateOutfit, type Item } from '@/lib/items'
import { toggleOutfitItem } from '@/lib/outfit-slots'

type Baseline = { name: string; itemIds: string }

export function useOutfitBuilder() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [baseline, setBaseline] = useState<Baseline | null>(null)

  const selectedIds = selected.map(item => item.id)

  const isDirty =
    editingId == null || baseline == null
      ? true
      : name.trim() !== baseline.name ||
        [...selectedIds].sort().join(',') !== baseline.itemIds

  const toggle = useCallback((item: Item) => {
    setSelected(prev => toggleOutfitItem(prev, item))
  }, [])

  const remove = useCallback((id: string) => {
    setSelected(prev => prev.filter(s => s.id !== id))
  }, [])

  const clearItems = useCallback(() => {
    setSelected([])
  }, [])

  const clear = useCallback(() => {
    setSelected([])
    setName('')
    setEditingId(null)
    setBaseline(null)
  }, [])

  const load = useCallback(
    (outfit: { id: string; name: string }, items: Item[]) => {
      setSelected(items)
      setName(outfit.name)
      setEditingId(outfit.id)
      setBaseline({
        name: outfit.name.trim(),
        itemIds: items
          .map(i => i.id)
          .sort()
          .join(','),
      })
    },
    []
  )

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), itemIds: selected.map(i => i.id) }
      return editingId ? updateOutfit(editingId, body) : createOutfit(body)
    },
    onSuccess: () => {
      clear()
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
    },
  })

  return {
    selected,
    selectedIds,
    name,
    setName,
    editingId,
    isDirty,
    toggle,
    remove,
    clearItems,
    clear,
    load,
    saveMutation,
  }
}

export type OutfitBuilderApi = ReturnType<typeof useOutfitBuilder>
