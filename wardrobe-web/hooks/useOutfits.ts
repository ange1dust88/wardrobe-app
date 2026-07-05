import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteOutfit,
  fetchOutfits,
  updateOutfit,
  type Outfit,
} from '@/lib/items'

const OUTFITS_KEY = ['outfits'] as const

type UpdateVars = {
  id: string
  body: { name: string; itemIds: string[] }
}

export function useOutfits() {
  const queryClient = useQueryClient()

  const outfitsQuery = useQuery<Outfit[]>({
    queryKey: OUTFITS_KEY,
    queryFn: fetchOutfits,
  })

  const updateMutation = useMutation<Outfit, Error, UpdateVars>({
    mutationFn: ({ id, body }) => updateOutfit(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteOutfit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  return { outfitsQuery, updateMutation, deleteMutation }
}
