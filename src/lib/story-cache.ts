/**
 * Shared cache tag and on-demand revalidation for public story reads.
 * Used so list/detail fetches stay fresh after the publisher writes a story.
 */
export const STORY_CACHE_TAG = 'stories';
export const STORY_CACHE_REVALIDATE_SECONDS = 60;

export async function revalidateStoryCache(extraPaths: string[] = []): Promise<void> {
  try {
    const { revalidateTag, revalidatePath } = await import('next/cache');
    revalidateTag(STORY_CACHE_TAG, 'max');
    const paths = ['/', '/stories', '/rss.xml', '/sitemap.xml', ...extraPaths];
    for (const path of Array.from(new Set(paths))) {
      revalidatePath(path);
    }
  } catch (error) {
    console.warn(
      'Story cache revalidation skipped',
      error instanceof Error ? error.message : String(error)
    );
  }
}
