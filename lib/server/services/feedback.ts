import { prisma } from '../db'
import type { AuthUser } from '../auth'

export async function createFeedback(
  user: AuthUser,
  input: { message: string; page?: string | null }
): Promise<{ ok: true }> {
  await prisma.feedback.create({
    data: {
      userId: user.id,
      email: user.email ?? null,
      message: input.message,
      page: input.page ?? null,
    },
  })
  return { ok: true }
}
