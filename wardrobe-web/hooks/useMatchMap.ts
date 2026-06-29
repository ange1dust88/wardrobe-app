import { useQuery } from '@tanstack/react-query'
import { fetchMatchMap } from '@/lib/items'

export function useMatchMap(colorType: string | null, allowConflicts = false) {
  return useQuery({
    queryKey: ['match-map', colorType, allowConflicts],
    queryFn: () => fetchMatchMap(colorType ?? undefined, allowConflicts),
    staleTime: 30_000,
  })
}
