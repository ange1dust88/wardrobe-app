import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createItem, deleteItem, fetchItems } from "../lib/items";

const ITEMS_KEY = ["items"] as const;

export function useItems() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ITEMS_KEY });

  const itemsQuery = useQuery({ queryKey: ITEMS_KEY, queryFn: fetchItems });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: invalidate,
  });

  return { itemsQuery, createMutation, deleteMutation };
}
