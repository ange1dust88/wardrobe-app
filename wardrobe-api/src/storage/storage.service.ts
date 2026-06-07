import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export type UploadedImage = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

@Injectable()
export class StorageService implements OnModuleInit {
  private client: SupabaseClient | null = null;
  private bucket = process.env.SUPABASE_BUCKET ?? 'item-images';

  async onModuleInit(): Promise<void> {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || key.startsWith('PASTE_')) {
      return;
    }
    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
    // create the bucket once (ignored if it already exists)
    await this.client.storage
      .createBucket(this.bucket, { public: true })
      .catch(() => undefined);
  }

  async uploadImage(file: UploadedImage): Promise<string> {
    if (!this.client) {
      throw new InternalServerErrorException(
        'Storage is not configured (set SUPABASE_SERVICE_ROLE_KEY)',
      );
    }
    const ext = (file.originalname.split('.').pop() ?? 'bin').toLowerCase();
    const path = `${randomUUID()}.${ext}`;
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) {
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);
    }
    return this.client.storage.from(this.bucket).getPublicUrl(path).data
      .publicUrl;
  }

  async deleteImage(publicUrl: string): Promise<void> {
    if (!this.client) return;
    const marker = `/object/public/${this.bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const path = publicUrl.slice(idx + marker.length);
    await this.client.storage
      .from(this.bucket)
      .remove([path])
      .catch(() => undefined);
  }
}
