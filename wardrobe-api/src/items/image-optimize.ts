import sharp from 'sharp';
import type { UploadedItemImage } from './items.service';

export async function optimizeForStorage(
  image: UploadedItemImage,
): Promise<UploadedItemImage> {
  try {
    const buffer = await sharp(image.buffer)
      .rotate()
      .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    return { buffer, originalname: 'item.webp', mimetype: 'image/webp' };
  } catch {
    return image;
  }
}
