// Minimal middleware to get the site back up
export function middleware() {
  // Do nothing
}

// Only run on admin routes to minimize impact
export const config = {
  matcher: ['/admin/:path*'],
};
