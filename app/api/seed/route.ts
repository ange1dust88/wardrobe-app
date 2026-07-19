import type { NextRequest } from 'next/server'
import { handle } from '@/lib/server/http'
import { getUser } from '@/lib/server/auth'
import {
  seedStarterWardrobe,
  clearSampleWardrobe,
} from '@/lib/server/services/seed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    const seeded = await seedStarterWardrobe(user.id)
    return Response.json({ seeded })
  })
}

export async function DELETE(req: NextRequest) {
  return handle(async () => {
    const user = await getUser(req)
    await clearSampleWardrobe(user.id)
    return Response.json({ cleared: true })
  })
}
