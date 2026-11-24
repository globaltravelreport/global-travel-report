import { capUnsplashImageWidth } from '../imageUrl';
import { getCategoryUrl } from '../url';

describe('capUnsplashImageWidth', () => {
  it('caps oversized Unsplash widths to 1080', () => {
    expect(
      capUnsplashImageWidth('https://images.unsplash.com/photo-123?auto=format&q=80&w=2400')
    ).toBe('https://images.unsplash.com/photo-123?auto=format&q=80&w=1080');
  });

  it('leaves already-small Unsplash widths unchanged', () => {
    expect(
      capUnsplashImageWidth('https://images.unsplash.com/photo-123?auto=format&q=80&w=800')
    ).toBe('https://images.unsplash.com/photo-123?auto=format&q=80&w=800');
  });

  it('adds w=1080 when an Unsplash URL has no width', () => {
    expect(
      capUnsplashImageWidth('https://images.unsplash.com/photo-123?auto=format')
    ).toBe('https://images.unsplash.com/photo-123?auto=format&w=1080');
  });

  it('leaves non-Unsplash URLs unchanged', () => {
    const url = 'https://cdn.example.com/hero.jpg?w=2400';
    expect(capUnsplashImageWidth(url)).toBe(url);
  });

  it('returns an empty string for missing values', () => {
    expect(capUnsplashImageWidth(undefined)).toBe('');
    expect(capUnsplashImageWidth('')).toBe('');
  });
});

describe('getCategoryUrl', () => {
  it('maps Food & Drink to the canonical food-drink path', () => {
    expect(getCategoryUrl('Food & Drink')).toBe('/categories/food-drink');
    expect(getCategoryUrl('food-&-drink')).toBe('/categories/food-drink');
    expect(getCategoryUrl('food-and-drink')).toBe('/categories/food-drink');
  });
});
