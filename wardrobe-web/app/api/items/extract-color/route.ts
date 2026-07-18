import type { NextRequest } from 'next/server'
import { handle, badRequest } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { extractItemColor } from '@/lib/server/services/items'
import { readImage } from '@/lib/server/upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  return handle(async () => {
    await getUser(req)
    const fd = await req.formData()
    const image = await readImage(fd, { required: true })
    if (!image) throw badRequest('Image is required')
    return Response.json(await extractItemColor(image))
  })
}
