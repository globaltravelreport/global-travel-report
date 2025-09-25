import Link from 'next/link';

interface ImageAttributionProps {
  photographerName: string;
  photographerUrl: string;
  unsplashUrl?: string;
  className?: string;
}

export function ImageAttribution({ 
  photographerName, 
  photographerUrl,
  unsplashUrl = "https://unsplash.com",
  className = ""
}: ImageAttributionProps) {
  if (!photographerName || !photographerUrl) {
    return null;
  }

  return (
    <div className={`text-xs text-gray-500 mt-1 ${className}`}>
      Photo by{" "}
      <Link 
        href={photographerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900 underline"
        aria-label={`View ${photographerName}'s Unsplash profile`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {photographerName}
      </Link>
      {" "}via{" "}
      <Link 
        href={unsplashUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900 underline"
        aria-label="Visit Unsplash"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        Unsplash
      </Link>
    </div>
  );
} 