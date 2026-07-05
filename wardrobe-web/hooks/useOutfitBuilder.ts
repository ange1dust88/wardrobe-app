import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { createOutfit, updateOutfit, type Item } from '@/lib/items'
import { toggleOutfitItem } from '@/lib/outfit-slots'

export function useOutfitBuilder() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const selectedIds = selected.map(item => item.id)

  function toggle(item: Item) {
    setSelected(prev => toggleOutfitItem(prev, item))
  }

  function remove(id: string) {
    setSelected(prev => prev.filter(s => s.id !== id))
  }

  function clearItems() {
    setSelected([])
  }

  const clear = useCallback(() => {
    setSelected([])
    setName('')
    setEditingId(null)
  }, [])

  const load = useCallback(
    (outfit: { id: string; name: string }, items: Item[]) => {
      setSelected(items)
      setName(outfit.name)
      setEditingId(outfit.id)
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
    toggle,
    remove,
    clearItems,
    clear,
    load,
    saveMutation,
  }
}
