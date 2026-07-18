import { prisma } from '../db'
import { notFound } from '../http'

export type Folder = { id: string; name: string; createdAt: string }

type DbFolder = { id: string; name: string; createdAt: Date }

function toFolder(row: DbFolder): Folder {
  return { id: row.id, name: row.name, createdAt: row.createdAt.toISOString() }
}

async function assertOwned(userId: string, id: string): Promise<void> {
  const found = await prisma.folder.findFirst({ where: { id, userId } })
  if (!found) throw notFound(`Folder ${id} not found`)
}

export async function listFolders(userId: string): Promise<Folder[]> {
  const rows = await prisma.folder.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(toFolder)
}

export async function createFolder(
  userId: string,
  name: string
): Promise<Folder> {
  const row = await prisma.folder.create({ data: { userId, name } })
  return toFolder(row)
}

export async function updateFolder(
  userId: string,
  id: string,
  name: string
): Promise<Folder> {
  await assertOwned(userId, id)
  const row = await prisma.folder.update({ where: { id }, data: { name } })
  return toFolder(row)
}

export async function removeFolder(
  userId: string,
  id: string
): Promise<{ deleted: true; id: string }> {
  await assertOwned(userId, id)
  await prisma.folder.delete({ where: { id } })
  return { deleted: true, id }
}
