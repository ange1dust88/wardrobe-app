import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createOutfit,
  deleteOutfit,
  fetchOutfits,
  type Outfit,
} from '@/lib/items'

const OUTFITS_KEY = ['outfits'] as const

type CreateVars = { name: string; itemIds: string[] }

export function useOutfits() {
  const queryClient = useQueryClient()

  const outfitsQuery = useQuery<Outfit[]>({
    queryKey: OUTFITS_KEY,
    queryFn: fetchOutfits,
  })

  const duplicateMutation = useMutation<Outfit, Error, CreateVars>({
    mutationFn: body => createOutfit(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteOutfit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  return { outfitsQuery, duplicateMutation, deleteMutation }
}
