import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import { removeAccount } from '@/lib/server/services/account'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    return Response.json(await removeAccount(user.id))
  })
}
