import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createOutfit, type Item } from '@/lib/items'
import { toggleOutfitItem } from '@/lib/outfit-slots'

export function useOutfitBuilder() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Item[]>([])

  const selectedIds = selected.map(item => item.id)

  function toggle(item: Item) {
    setSelected(prev => toggleOutfitItem(prev, item))
  }

  function remove(id: string) {
    setSelected(prev => prev.filter(s => s.id !== id))
  }

  function clear() {
    setSelected([])
  }

  const saveMutation = useMutation({
    mutationFn: (name: string) => createOutfit({ name, itemIds: selectedIds }),
    onSuccess: () => {
      clear()
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
    },
  })

  return {
    selected,
    selectedIds,
    toggle,
    remove,
    clear,
    saveMutation,
  }
}
