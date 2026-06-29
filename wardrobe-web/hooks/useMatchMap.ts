import { useQuery } from '@tanstack/react-query'
import { fetchMatchMap } from '@/lib/items'

export function useMatchMap(
  colorType: string | null,
  allowConflicts = false,
  allowSameCategory = false
) {
  return useQuery({
    queryKey: ['match-map', colorType, allowConflicts, allowSameCategory],
    queryFn: () =>
      fetchMatchMap(colorType ?? undefined, allowConflicts, allowSameCategory),
    staleTime: 30_000,
  })
}
