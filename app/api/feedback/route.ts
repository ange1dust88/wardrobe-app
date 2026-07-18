import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { createFeedback } from '@/lib/server/services/feedback'
import { parseFeedback } from '@/lib/server/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const input = parseFeedback(await req.json())
    return Response.json(await createFeedback(user, input))
  })
}
