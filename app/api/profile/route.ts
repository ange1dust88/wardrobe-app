import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { getProfile, upsertProfile } from '@/lib/server/services/profile'
import { parseUpsertProfile } from '@/lib/server/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    return Response.json(await getProfile(user.id))
  })
}

export async function PUT(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const input = parseUpsertProfile(await req.json())
    return Response.json(await upsertProfile(user.id, input))
  })
}
