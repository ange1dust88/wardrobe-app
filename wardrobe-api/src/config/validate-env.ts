import { Logger } from '@nestjs/common';

const logger = new Logger('env');

export function validateEnv(): void {
  const required = ['DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const storageConfigured =
    !!process.env.SUPABASE_URL && !!key && !key.startsWith('PASTE_');
  if (!storageConfigured) {
    logger.warn(
      'Supabase Storage is not configured — image upload will fail until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
    );
  }
}
