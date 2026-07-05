import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteOutfit, fetchOutfits, type Outfit } from '@/lib/items'

const OUTFITS_KEY = ['outfits'] as const

export function useOutfits() {
  const queryClient = useQueryClient()

  const outfitsQuery = useQuery<Outfit[]>({
    queryKey: OUTFITS_KEY,
    queryFn: fetchOutfits,
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteOutfit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  return { outfitsQuery, deleteMutation }
}
