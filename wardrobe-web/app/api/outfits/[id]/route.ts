import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import {
  getOutfit,
  updateOutfit,
  removeOutfit,
} from '@/lib/server/services/outfits'
import { parseUpdateOutfit } from '@/lib/server/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    return Response.json(await getOutfit(user.id, id))
  })
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    const input = parseUpdateOutfit(await req.json())
    return Response.json(await updateOutfit(user.id, id, input))
  })
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    return Response.json(await removeOutfit(user.id, id))
  })
}
