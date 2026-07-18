import { badRequest } from './http'
import type { UploadedImage } from './storage'

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

const MAX_BYTES = 5 * 1024 * 1024

export async function readImage(
  fd: FormData,
  opts: { required?: boolean } = {}
): Promise<UploadedImage | undefined> {
  const f = fd.get('image')
  if (!f || typeof f === 'string') {
    if (opts.required) throw badRequest('Image is required')
    return undefined
  }
  const file = f as File
  if (!ALLOWED.has(file.type)) {
    throw badRequest('Image must be a JPG, PNG, WebP, GIF, or AVIF')
  }
  if (file.size > MAX_BYTES) {
    throw badRequest('Image is too large (max 5MB)')
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  return {
    buffer,
    originalname: file.name || 'upload',
    mimetype: file.type,
  }
}
