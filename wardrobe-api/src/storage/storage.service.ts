import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export type UploadedImage = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
};

@Injectable()
export class StorageService {
  private client: SupabaseClient | null = null;
  private clientResolved = false;
  private bucket = process.env.SUPABASE_BUCKET ?? 'item-images';
  private bucketReady = false;

  private getClient(): SupabaseClient | null {
    if (!this.clientResolved) {
      this.clientResolved = true;
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && key && !key.startsWith('PASTE_')) {
        this.client = createClient(url, key, {
          auth: { persistSession: false },
        });
      }
    }
    return this.client;
  }

  private async ensureBucket(client: SupabaseClient): Promise<void> {
    if (this.bucketReady) return;
    await client.storage
      .createBucket(this.bucket, { public: true })
      .catch(() => undefined);
    this.bucketReady = true;
  }

  async uploadImage(file: UploadedImage): Promise<string> {
    const client = this.getClient();
    if (!client) {
      throw new InternalServerErrorException(
        'Storage is not configured (set SUPABASE_SERVICE_ROLE_KEY)',
      );
    }
    await this.ensureBucket(client);

    const ext = (file.originalname.split('.').pop() ?? 'bin').toLowerCase();
    const path = `${randomUUID()}.${ext}`;
    const { error } = await client.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) {
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);
    }
    return client.storage.from(this.bucket).getPublicUrl(path).data.publicUrl;
  }

  async deleteImage(publicUrl: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    const marker = `/object/public/${this.bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const path = publicUrl.slice(idx + marker.length);
    await client.storage
      .from(this.bucket)
      .remove([path])
      .catch(() => undefined);
  }

  async deleteAuthUser(userId: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    await client.auth.admin.deleteUser(userId).catch(() => undefined);
  }
}
