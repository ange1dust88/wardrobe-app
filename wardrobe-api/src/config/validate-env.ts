import { Logger } from '@nestjs/common';

const logger = new Logger('env');

export function validateEnv(): void {
  const required = ['DATABASE_URL', 'SUPABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const storageConfigured = !!key && !key.startsWith('PASTE_');
  if (!storageConfigured) {
    logger.warn(
      'Supabase service role key is not configured — image upload and account deletion will fail until SUPABASE_SERVICE_ROLE_KEY is set.',
    );
  }

  if (process.env.NODE_ENV === 'production' && !process.env.WEB_ORIGIN) {
    logger.warn(
      'WEB_ORIGIN is not set in production — CORS will reflect any origin.',
    );
  }
}
