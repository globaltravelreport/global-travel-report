export function getBlurDataURL(src: string): string {
  // Minimal placeholder: return a tiny transparent PNG
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAn8B9p6Q1wAAAABJRU5ErkJggg==';
}

export function getResponsiveSizes(width: number): string {
  if (width < 640) return '100vw';
  if (width < 1024) return '50vw';
  return '33vw';
}
