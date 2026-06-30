import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  BASE_SUBTYPES,
  createOutfit,
  STACK_POLICY,
  type Item,
} from '@/lib/items'

function layerKey(item: Item): string {
  const base = BASE_SUBTYPES[item.category]
  if (base) return base.includes(item.subType ?? '') ? 'base' : 'main'
  return item.subType ?? '__none'
}

export function useOutfitBuilder() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Item[]>([])

  const selectedIds = selected.map(item => item.id)

  function toggle(item: Item) {
    setSelected(prev => {
      if (prev.some(s => s.id === item.id)) {
        return prev.filter(s => s.id !== item.id)
      }
      const policy = STACK_POLICY[item.category] ?? 'single'
      if (policy === 'unlimited') return [...prev, item]
      if (policy === 'layered') {
        const key = layerKey(item)
        return [
          ...prev.filter(
            s => !(s.category === item.category && layerKey(s) === key)
          ),
          item,
        ]
      }
      return [...prev.filter(s => s.category !== item.category), item]
    })
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
