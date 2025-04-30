import { Skeleton } from '@/components/ui/skeleton';

export default function StoryLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Skeleton */}
      <Skeleton className="h-12 w-3/4 mb-6" />
      
      {/* Meta Skeleton */}
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Featured Image Skeleton */}
      <Skeleton className="w-full h-[400px] mb-8 rounded-lg" />
      
      {/* Content Skeletons */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
} 