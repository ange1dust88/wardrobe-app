import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createItem,
  deleteItem,
  fetchItems,
  SAMPLE_ITEMS,
  type CreateItem,
  type Item,
} from '@/lib/items'

const ITEMS_KEY = ['items'] as const

export function useItems() {
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ITEMS_KEY })

  const itemsQuery = useQuery<Item[]>({
    queryKey: ITEMS_KEY,
    queryFn: fetchItems,
  })

  const createMutation = useMutation<Item, Error, CreateItem>({
    mutationFn: createItem,
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteItem,
    onSuccess: invalidate,
  })

  const seedMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const existing = await fetchItems()
      for (const item of existing) {
        await deleteItem(item.id)
      }
      for (const item of SAMPLE_ITEMS) {
        await createItem(item)
      }
    },
    onSuccess: invalidate,
  })

  return { itemsQuery, createMutation, deleteMutation, seedMutation }
}
