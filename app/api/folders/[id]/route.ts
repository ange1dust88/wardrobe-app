import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { updateFolder, removeFolder } from '@/lib/server/services/folders'
import { parseFolderName } from '@/lib/server/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    const name = parseFolderName(await req.json())
    return Response.json(await updateFolder(user.id, id, name))
  })
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const user = await getUser(req)
    const { id } = await ctx.params
    return Response.json(await removeFolder(user.id, id))
  })
}
