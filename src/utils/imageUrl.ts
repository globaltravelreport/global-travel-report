/**
 * Helpers for story and hero image URLs after Vercel image optimisation was disabled.
 */

const UNSPLASH_HOSTS = new Set([
  'images.unsplash.com',
  'unsplash.com',
  'source.unsplash.com',
]);

export const DEFAULT_UNSPLASH_MAX_WIDTH = 1080;

/**
 * Cap the Unsplash `w=` parameter so hero/story images are not downloaded at
 * huge widths (e.g. 2400px) now that `images.unoptimized` is true.
 */
export function capUnsplashImageWidth(
  url: string | undefined | null,
  maxWidth: number = DEFAULT_UNSPLASH_MAX_WIDTH
): string {
  if (!url) {
    return '';
  }

  try {
    const parsed = new URL(url);
    if (!UNSPLASH_HOSTS.has(parsed.hostname)) {
      return url;
    }

    const rawWidth = parsed.searchParams.get('w');
    const current = rawWidth ? Number(rawWidth) : Infinity;
    if (!Number.isFinite(current) || current <= 0 || current > maxWidth) {
      parsed.searchParams.set('w', String(maxWidth));
    }

    return parsed.toString();
  } catch {
    return url;
  }
}
