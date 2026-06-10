import { useQuery } from '@tanstack/react-query'
import { fetchMatchMap } from '@/lib/items'

export function useMatchMap() {
  return useQuery({
    queryKey: ['match-map'],
    queryFn: fetchMatchMap,
    staleTime: 30_000,
  })
}
