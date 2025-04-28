import { Skeleton } from '@/components/ui/skeleton';

export default function StoryLoading() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        <Skeleton className="h-12 w-3/4 mb-4" />
        
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        <Skeleton className="w-full h-[400px] mb-8" />
      </header>

      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <footer className="mt-8 pt-8 border-t">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </footer>

      <section className="mt-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
} 