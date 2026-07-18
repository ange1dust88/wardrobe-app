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
type RestoreVars = {
  id: string
  name: string
  itemIds: string[]
  folderId: string | null
  createdAt: string
}

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

  const deleteManyMutation = useMutation<
    void,
    Error,
    string[],
    { previous?: Outfit[] }
  >({
    mutationFn: async ids => {
      await Promise.all(ids.map(id => deleteOutfit(id)))
    },
    onMutate: async ids => {
      await queryClient.cancelQueries({ queryKey: OUTFITS_KEY })
      const previous = queryClient.getQueryData<Outfit[]>(OUTFITS_KEY)
      if (previous) {
        const idSet = new Set(ids)
        queryClient.setQueryData<Outfit[]>(
          OUTFITS_KEY,
          previous.filter(o => !idSet.has(o.id))
        )
      }
      return { previous }
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(OUTFITS_KEY, ctx.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }),
  })

  function restoreOutfits(outfits: RestoreVars[]) {
    if (outfits.length === 0) return
    queryClient.setQueryData<Outfit[]>(OUTFITS_KEY, prev => [
      ...(prev ?? []),
      ...outfits.map(o => ({
        id: o.id,
        name: o.name,
        itemIds: o.itemIds,
        folderId: o.folderId,
        createdAt: o.createdAt,
      })),
    ])
    void Promise.all(
      outfits.map(o =>
        createOutfit({ name: o.name, itemIds: o.itemIds, folderId: o.folderId })
      )
    )
      .catch(() => undefined)
      .finally(() => queryClient.invalidateQueries({ queryKey: OUTFITS_KEY }))
  }

  return {
    outfitsQuery,
    duplicateMutation,
    moveMutation,
    deleteManyMutation,
    restoreOutfits,
  }
}
