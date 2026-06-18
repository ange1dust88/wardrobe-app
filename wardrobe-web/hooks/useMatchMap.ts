import { useQuery } from '@tanstack/react-query'
import { fetchMatchMap } from '@/lib/items'

export function useMatchMap(colorType: string | null) {
  return useQuery({
    queryKey: ['match-map', colorType],
    queryFn: () => fetchMatchMap(colorType ?? undefined),
    staleTime: 30_000,
  })
}
