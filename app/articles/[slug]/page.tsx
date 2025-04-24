import { notFound } from 'next/navigation';
import articles from '@/app/data/articles';
import { Metadata } from 'next';
import { format } from 'date-fns';
import ArticleImage from '@/app/components/ArticleImage';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

interface Article {
  id: string;
  title: string;
  content: string;
  category?: string;
  status?: string;
  author?: string;
  isReadyToPublish?: boolean;
  summary: string;
  image?: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  date?: string;
  createdAt: string;
  publishedAt?: string;
  slug: string;
}

export async function generateStaticParams() {
  const paths = articles.map((article: Article) => ({
    slug: article.slug,
  }));
  console.log('Generating static paths for articles:', paths);
  return paths;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = articles.find((a: Article) => a.slug === params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.summary,
    keywords: article.seo?.keywords,
    openGraph: {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.summary,
      type: 'article',
      publishedTime: article.publishedAt || article.date,
      authors: [article.author || 'Global Travel Report'],
      images: article.featuredImage?.url ? [article.featuredImage.url] : [],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a: Article) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  const formattedDate = format(
    new Date(article.publishedAt || article.date || article.createdAt || new Date().toISOString()),
    'MMMM d, yyyy'
  );
  const imageUrl = article.featuredImage?.url || article.image || '/images/news-hero.jpg';
  const imageAlt = article.featuredImage?.alt || article.title;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center text-gray-600">
          <span>By {article.author}</span>
          <span className="mx-2">•</span>
          <time dateTime={article.date}>{formattedDate}</time>
        </div>
      </header>

      {article.featuredImage && (
        <ArticleImage src={imageUrl} alt={imageAlt} />
      )}

      <div className="prose max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </article>
  );
} 