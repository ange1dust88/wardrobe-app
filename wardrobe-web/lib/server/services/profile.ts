import { $Enums } from '@prisma/client'
import { prisma } from '../db'

export type UpsertProfileInput = {
  who?: $Enums.Who | null
  climate?: $Enums.Climate | null
  palettes?: $Enums.SeasonPalette[]
  hair?: number | null
  eyes?: number | null
  skin?: number | null
  undertone?: $Enums.Undertone | null
}

export function getProfile(userId: string) {
  return prisma.userProfile.findUnique({ where: { userId } })
}

export function upsertProfile(userId: string, input: UpsertProfileInput) {
  const data = {
    who: input.who ?? null,
    climate: input.climate ?? null,
    palettes: input.palettes ?? [],
    hair: input.hair ?? null,
    eyes: input.eyes ?? null,
    skin: input.skin ?? null,
    undertone: input.undertone ?? null,
    onboardedAt: new Date(),
  }
  return prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  })
}
