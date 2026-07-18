import { useQuery } from '@tanstack/react-query'
import { previewMatches, type PreviewItemBody } from '@/lib/items'

export function useMatchPreview(
  body: PreviewItemBody | null,
  colorType: string | null
) {
  return useQuery({
    queryKey: ['match-preview', colorType, body],
    queryFn: () =>
      previewMatches(body as PreviewItemBody, colorType ?? undefined),
    enabled: body != null,
    staleTime: 60_000,
  })
}
