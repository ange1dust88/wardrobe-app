import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { listFolders, createFolder } from '@/lib/server/services/folders'
import { parseFolderName } from '@/lib/server/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    return Response.json(await listFolders(user.id))
  })
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const name = parseFolderName(await req.json())
    return Response.json(await createFolder(user.id, name))
  })
}
