import { createHash, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

const DEFAULT_SUPABASE_CRON_TOKEN_SHA256 = '349b987f36c30f3fb113ec628a427dcabe92010a2b975b676e53db760012a303';

function tokenMatchesHash(token: string, hash: string): boolean {
  if (!token || !hash || !/^[a-f0-9]{64}$/i.test(hash)) {
    return false;
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  return timingSafeEqual(Buffer.from(tokenHash, 'hex'), Buffer.from(hash, 'hex'));
}

export function isCronRequestAuthorized(request: NextRequest, fallbackSecret?: string): boolean {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const secret = fallbackSecret || process.env.CRON_SECRET || process.env.CRON_SECRET_KEY;
  const supabaseCronTokenHash = process.env.SUPABASE_CRON_TOKEN_SHA256 || DEFAULT_SUPABASE_CRON_TOKEN_SHA256;

  if (secret && authHeader === `Bearer ${secret}`) {
    return true;
  }

  if (tokenMatchesHash(token, supabaseCronTokenHash)) {
    return true;
  }

  return !secret && !supabaseCronTokenHash;
}
