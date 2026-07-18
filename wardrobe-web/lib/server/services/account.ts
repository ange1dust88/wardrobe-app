import { prisma } from '../db'
import { HttpError } from '../http'
import { deleteImage, deleteAuthUser } from '../storage'

export async function removeAccount(
  userId: string
): Promise<{ deleted: true }> {
  const items = await prisma.item.findMany({
    where: { userId },
    select: { imageUrl: true },
  })
  await Promise.all(
    items
      .map(i => i.imageUrl)
      .filter((url): url is string => !!url)
      .map(url => deleteImage(url))
  )

  await prisma.outfit.deleteMany({ where: { userId } })
  await prisma.folder.deleteMany({ where: { userId } })
  await prisma.item.deleteMany({ where: { userId } })
  await prisma.userProfile.deleteMany({ where: { userId } })
  await prisma.feedback.deleteMany({ where: { userId } })

  const authDeleted = await deleteAuthUser(userId)
  if (!authDeleted) {
    throw new HttpError(
      502,
      'Your data was removed, but the sign-in account could not be deleted. Please retry.'
    )
  }
  return { deleted: true }
}
