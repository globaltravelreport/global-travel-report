import Image from 'next/image';
import { getHomepageStories } from '../../utils/stories';
import { Story } from '../../../types/Story';
import { MostViewedThisWeek } from '../engagement/MostViewedThisWeek';
import { TrendingDestinations } from '../engagement/TrendingDestinations';

type StoriesSectionProps = {
  initialStories: Story[];
};

export default function StoriesSection({ initialStories }: StoriesSectionProps) {
  const stories = initialStories;
  if (stories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No stories available</h2>
          <p className="text-gray-600">
            We're working on adding more travel stories. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  // Get homepage stories (non-archived, paginated)
  const homepageResult = getHomepageStories(stories);
  const recentStories = homepageResult?.data || [];
  const displayStories = recentStories.length > 0
    ? recentStories
    : [...stories]
      .sort((a, b) => new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime())
      .slice(0, 6);
  const showingRecentStories = recentStories.length > 0;

  if (displayStories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No stories available</h2>
          <p className="text-gray-600">
            We're working on adding more travel stories. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-10 flex flex-col gap-4 border-l-4 border-[#C9A14A] pl-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#C9A14A]">
            Travel News Desk
          </p>
          <h2 className="text-3xl font-black tracking-tight text-[#19273A] md:text-4xl">
            {showingRecentStories ? 'Latest Travel Stories' : 'Featured Travel Guides'}
          </h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-gray-600">
          {showingRecentStories
            ? 'Fresh travel updates, destination context and practical planning notes for Australian travellers.'
            : 'Selected destination guides and travel features while today\'s news drafts are reviewed.'}
        </p>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
        {displayStories.map((story, index) => {
          const isLeadCard = index === 0;

          return (
            <article
              key={story.id}
              className={`group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-xl ${isLeadCard ? 'lg:col-span-2' : ''}`}
            >
              <a href={`/stories/${story.slug}`}>
                {/* Story Image */}
                <div className={`relative overflow-hidden ${isLeadCard ? 'h-64 md:h-80' : 'h-48'}`}>
                  <Image
                    src={story.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600'}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes={isLeadCard ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 ${isLeadCard ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                  {/* Category Badge */}
                  {story.category && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                        {story.category}
                      </span>
                    </div>
                  )}

                  {/* Featured/Editor's Pick Badge */}
                  {(story.featured || story.editorsPick) && (
                    <div className="absolute top-3 right-3">
                      {story.editorsPick && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#C9A14A] text-white">
                          Editor's Pick
                        </span>
                      )}
                      {story.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#19273A] text-white">
                          Featured
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={isLeadCard ? 'p-6 md:p-7' : 'p-6'}>
                  {isLeadCard && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#C9A14A]">
                      Top Story
                    </p>
                  )}
                  <h3 className={`${isLeadCard ? 'text-2xl md:text-3xl' : 'text-xl'} mb-3 font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-[#C9A14A]`}>
                    {story.title}
                  </h3>

                  <p className={`${isLeadCard ? 'text-base leading-7' : 'text-sm leading-relaxed'} mb-4 line-clamp-3 text-gray-600`}>
                    {story.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {story.publishedAt && (
                      <time dateTime={new Date(story.publishedAt).toISOString()}>
                        {new Date(story.publishedAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </time>
                    )}
                  </div>
                </div>
              </a>
            </article>
          );
        })}
      </div>

      {/* Engagement Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <MostViewedThisWeek maxItems={5} />
        <TrendingDestinations maxItems={6} />
      </div>

      {/* Navigation CTAs */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/stories"
            className="inline-flex items-center px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
          >
            {showingRecentStories ? 'View All Recent Stories' : 'View All Stories'}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="/archive"
            className="inline-flex items-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Browse Archive
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
            </svg>
          </a>
        </div>
        <p className="text-sm text-gray-500">
          Recent stories: Last 30 days • Archive: Complete collection (12+ months)
        </p>
      </div>
    </section>
  );
}
