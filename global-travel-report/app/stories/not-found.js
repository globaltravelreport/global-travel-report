import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">
        The stories page has been moved to categories.
      </p>
      <Link 
        href="/categories"
        className="px-6 py-3 bg-[#C9A14A] text-white rounded-md hover:bg-[#B8923A] transition-colors"
      >
        Go to Categories
      </Link>
    </div>
  );
}
