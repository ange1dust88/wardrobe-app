import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createItem,
  deleteItem,
  fetchItems,
  setItemExcluded,
  updateItem,
  type CreateItem,
  type Item,
  type UpdateItem,
} from '@/lib/items'

const ITEMS_KEY = ['items'] as const

export function useItems() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    queryClient.invalidateQueries({ queryKey: ['match-map'] })
    queryClient.invalidateQueries({ queryKey: ['set-matches'] })
  }

  const itemsQuery = useQuery<Item[]>({
    queryKey: ITEMS_KEY,
    queryFn: fetchItems,
  })

  const createMutation = useMutation<Item, Error, CreateItem>({
    mutationFn: createItem,
    onSuccess: invalidate,
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

  const excludeMutation = useMutation<
    Item,
    Error,
    { id: string; excluded: boolean }
  >({
    mutationFn: ({ id, excluded }) => setItemExcluded(id, excluded),
    onSuccess: invalidate,
  })

  return {
    itemsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    excludeMutation,
  }
}
