import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { listItems } from '@/lib/server/services/items'
import { buildMatchMap, parseColorType } from '@/lib/server/domain/matching'
import {
  getCachedMatchMap,
  setCachedMatchMap,
} from '@/lib/server/domain/match-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const colorType = parseColorType(req.nextUrl.searchParams.get('colorType'))
    const allowConflicts =
      req.nextUrl.searchParams.get('allowConflicts') === 'true'

    const cached = getCachedMatchMap(user.id, colorType, allowConflicts)
    if (cached) return Response.json(cached)

    const items = await listItems(user.id)
    const map = buildMatchMap(items, colorType, allowConflicts)
    setCachedMatchMap(user.id, map, colorType, allowConflicts)
    return Response.json(map)
  })
}
