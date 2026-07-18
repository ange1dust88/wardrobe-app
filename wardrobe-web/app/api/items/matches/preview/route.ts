import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { listItems } from '@/lib/server/services/items'
import { buildPreview, parseColorType } from '@/lib/server/domain/matching'
import { parsePreview } from '@/lib/server/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const colorType = parseColorType(req.nextUrl.searchParams.get('colorType'))
    const allowConflicts =
      req.nextUrl.searchParams.get('allowConflicts') === 'true'
    const input = parsePreview(await req.json())
    const items = await listItems(user.id)
    return Response.json(buildPreview(items, input, colorType, allowConflicts))
  })
}
