import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { HttpError } from './http'

export type UploadedImage = {
  buffer: Buffer
  originalname: string
  mimetype: string
}

let client: SupabaseClient | null = null
let resolved = false
const bucket = process.env.SUPABASE_BUCKET ?? 'item-images'
let bucketReady = false

function getClient(): SupabaseClient | null {
  if (!resolved) {
    resolved = true
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key && !key.startsWith('PASTE_')) {
      client = createClient(url, key, { auth: { persistSession: false } })
    }
  }
  return client
}

async function ensureBucket(c: SupabaseClient): Promise<void> {
  if (bucketReady) return
  await c.storage.createBucket(bucket, { public: true }).catch(() => undefined)
  bucketReady = true
}

export async function uploadImage(file: UploadedImage): Promise<string> {
  const c = getClient()
  if (!c) {
    throw new HttpError(
      500,
      'Storage is not configured (set SUPABASE_SERVICE_ROLE_KEY)'
    )
  }
  await ensureBucket(c)

  const ext = (file.originalname.split('.').pop() ?? 'bin').toLowerCase()
  const path = `${randomUUID()}.${ext}`
  const { error } = await c.storage
    .from(bucket)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false })
  if (error) {
    throw new HttpError(500, `Upload failed: ${error.message}`)
  }
  return c.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function deleteImage(publicUrl: string): Promise<void> {
  const c = getClient()
  if (!c) return
  const marker = `/object/public/${bucket}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return
  const path = publicUrl.slice(idx + marker.length)
  await c.storage
    .from(bucket)
    .remove([path])
    .catch(() => undefined)
}

export async function deleteAuthUser(userId: string): Promise<boolean> {
  const c = getClient()
  if (!c) return false
  try {
    const { error } = await c.auth.admin.deleteUser(userId)
    return !error
  } catch {
    return false
  }
}
