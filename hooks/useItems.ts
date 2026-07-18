import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createItem,
  deleteItem,
  fetchItems,
  seedWardrobe,
  updateItem,
  type CreateItem,
  type Item,
  type UpdateItem,
} from '@/lib/items'
import { capture } from '@/lib/analytics'

const ITEMS_KEY = ['items'] as const

export function useItems() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    queryClient.invalidateQueries({ queryKey: ['match-map'] })
    queryClient.invalidateQueries({ queryKey: ['match-preview'] })
    queryClient.invalidateQueries({ queryKey: ['set-matches'] })
  }

  const itemsQuery = useQuery<Item[]>({
    queryKey: ITEMS_KEY,
    queryFn: fetchItems,
  })

  const createMutation = useMutation<Item, Error, CreateItem>({
    mutationFn: createItem,
    onSuccess: item => {
      invalidate()
      capture('item_added', { category: item.category })
    },
  })

  const updateMutation = useMutation<
    Item,
    Error,
    { id: string; body: UpdateItem }
  >({
    mutationFn: ({ id, body }) => updateItem(id, body),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteItem,
    onSuccess: invalidate,
  })

  const seedMutation = useMutation<void, Error, void>({
    mutationFn: seedWardrobe,
    onSuccess: invalidate,
  })

  return {
    itemsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    seedMutation,
  }
}
