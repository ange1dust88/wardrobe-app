import { useQuery } from '@tanstack/react-query'
import { fetchMatches } from '@/lib/items'

export function useMatches(anchorId: string | null) {
  const query = useQuery({
    queryKey: ['matches', anchorId],
    queryFn: () => fetchMatches(anchorId as string),
    enabled: anchorId != null,
    staleTime: 30_000,
  })

  const matchedIds = new Set<string>()
  const scoreById: Record<string, number> = {}

  if (query.data) {
    for (const group of Object.values(query.data.matches)) {
      for (const scored of group) {
        matchedIds.add(scored.item.id)
        scoreById[scored.item.id] = scored.score
      }
    }
  }

  return { matchedIds, scoreById, isLoading: query.isLoading }
}
