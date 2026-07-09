import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createOutfit,
  deleteOutfit,
  fetchOutfits,
  moveOutfitToFolder,
  type Outfit,
} from '@/lib/items'

const OUTFITS_KEY = ['outfits'] as const

type CreateVars = { name: string; itemIds: string[]; folderId?: string | null }
type MoveVars = { id: string; folderId: string | null }

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

  const moveMutation = useMutation<
    Outfit,
    Error,
    MoveVars,
    { previous?: Outfit[] }
  >({
    mutationFn: ({ id, folderId }) => moveOutfitToFolder(id, folderId),
    onMutate: async ({ id, folderId }) => {
      await queryClient.cancelQueries({ queryKey: OUTFITS_KEY })
      const previous = queryClient.getQueryData<Outfit[]>(OUTFITS_KEY)
      if (previous) {
        queryClient.setQueryData<Outfit[]>(
          OUTFITS_KEY,
          previous.map(o => (o.id === id ? { ...o, folderId } : o))
        )
      }
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(OUTFITS_KEY, ctx.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteOutfit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  return { outfitsQuery, duplicateMutation, moveMutation, deleteMutation }
}
