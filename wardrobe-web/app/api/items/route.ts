import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { listItems, createItem } from '@/lib/server/services/items'
import { parseCreateItemForm } from '@/lib/server/validation'
import { readImage } from '@/lib/server/upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    return Response.json(await listItems(user.id))
  })
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const fd = await req.formData()
    const input = parseCreateItemForm(fd)
    const image = await readImage(fd)
    return Response.json(await createItem(user.id, input, image))
  })
}
