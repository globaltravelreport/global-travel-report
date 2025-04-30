import { createApi } from 'unsplash-js';
import { Story } from './stories';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

export async function fetchUnsplashImage(query: string): Promise<{
  url: string;
  photographer: {
    name: string;
    url: string;
  };
}> {
  try {
    const result = await unsplash.search.getPhotos({
      query,
      perPage: 1,
      orientation: 'landscape',
    });

    if (!result.response?.results.length) {
      throw new Error('No images found');
    }

    const photo = result.response.results[0];
    return {
      url: photo.urls.regular,
      photographer: {
        name: photo.user.name,
        url: photo.user.links.html,
      },
    };
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return {
      url: '/images/placeholder.jpg',
      photographer: {
        name: 'Unsplash',
        url: 'https://unsplash.com',
      },
    };
  }
}

export async function enhanceStoryWithImage(story: Story): Promise<Story> {
  const query = `${story.country} ${story.category} travel`;
  const { url, photographer } = await fetchUnsplashImage(query);

  return {
    ...story,
    imageUrl: url,
    photographer,
  };
} 