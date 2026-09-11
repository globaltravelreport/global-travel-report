import { createHash, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

function tokenMatchesHash(token: string, hash: string): boolean {
  if (!token || !hash || !/^[a-f0-9]{64}$/i.test(hash)) {
    return false;
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  return timingSafeEqual(Buffer.from(tokenHash, 'hex'), Buffer.from(hash, 'hex'));
}

/**
 * Authorize cron/webhook callers. Fail closed when no secret/hash is configured.
 * Accepts Bearer CRON_SECRET / CRON_SECRET_KEY, or a token whose SHA-256 matches
 * SUPABASE_CRON_TOKEN_SHA256 (no hardcoded default hash).
 */
export function isCronRequestAuthorized(request: NextRequest, fallbackSecret?: string): boolean {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const secret = fallbackSecret || process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;
  const supabaseCronTokenHash = process.env.SUPABASE_CRON_TOKEN_SHA256;

  if (secret && authHeader === `Bearer ${secret}`) {
    return true;
  }

  if (supabaseCronTokenHash && tokenMatchesHash(token, supabaseCronTokenHash)) {
    return true;
  }

  return false;
}
