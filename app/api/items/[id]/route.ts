import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { getItem, updateItem, removeItem } from '@/lib/server/services/items'
import { parseUpdateItemForm } from '@/lib/server/validation'
import { readImage } from '@/lib/server/upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    return Response.json(await getItem(user.id, id))
  })
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    const fd = await req.formData()
    const input = parseUpdateItemForm(fd)
    const image = await readImage(fd)
    return Response.json(await updateItem(user.id, id, input, image))
  })
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    return Response.json(await removeItem(user.id, id))
  })
}
