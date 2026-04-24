export function trackClick(id: string, placement: string): void {
  if (typeof window === 'undefined') return;

  const event = {
    id,
    placement,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  console.info('[affiliate-click]', event);
}
