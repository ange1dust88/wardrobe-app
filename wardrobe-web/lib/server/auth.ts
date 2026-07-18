import type { NextRequest } from 'next/server'
import {
  createRemoteJWKSet,
  errors as joseErrors,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose'
import { HttpError } from './http'

export type AuthUser = { id: string; email?: string }

let jwks: JWTVerifyGetKey | null = null
let issuer = ''

function getJwks(): JWTVerifyGetKey {
  if (!jwks) {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) {
      throw new HttpError(503, 'Auth is not configured')
    }
    issuer = `${url}/auth/v1`
    jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  }
  return jwks
}

export async function getUser(req: NextRequest): Promise<AuthUser> {
  const header = req.headers.get('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    throw new HttpError(401, 'Missing bearer token')
  }

  const keys = getJwks()
  let payload: JWTPayload
  try {
    ;({ payload } = await jwtVerify(token, keys, { issuer }))
  } catch (err) {
    const transient =
      err instanceof joseErrors.JWKSTimeout ||
      !(err instanceof joseErrors.JOSEError)
    if (transient) {
      throw new HttpError(503, 'Auth is temporarily unavailable')
    }
    throw new HttpError(401, 'Invalid token')
  }

  if (!payload.sub) {
    throw new HttpError(401, 'Invalid token')
  }
  return {
    id: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
  }
}
