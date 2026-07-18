import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { listOutfits, createOutfit } from '@/lib/server/services/outfits'
import { parseCreateOutfit } from '@/lib/server/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    return Response.json(await listOutfits(user.id))
  })
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const input = parseCreateOutfit(await req.json())
    return Response.json(await createOutfit(user.id, input))
  })
}
