import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import Image from 'next/image';
import { StoryDraft } from '@/types/content';
import { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';

async function getArticle(slug: string): Promise<StoryDraft | null> {
  try {
    const filePath = path.join(process.cwd(), 'app/data/articles.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const articles = JSON.parse(fileContent);
    return articles.find((article: StoryDraft) => article.slug === slug) || null;
  } catch (error) {
    console.error('Error reading article:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
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

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

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
    <article className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
        ← Back to Articles
      </Link>
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <span className="mr-4">{article.category}</span>
          <span>{formattedDate}</span>
        </div>
      </header>

      <div className="relative w-full h-[400px] mb-8 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/news-hero.jpg';
          }}
        />
      </div>

      <div className="prose max-w-none mb-8">
        <p className="text-xl text-gray-700 mb-6">{article.summary}</p>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      <div className="flex gap-4">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://globaltravelreport.com/articles/${article.slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          aria-label="Share on Twitter"
        >
          Share on Twitter
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://globaltravelreport.com/articles/${article.slug}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          aria-label="Share on Facebook"
        >
          Share on Facebook
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://globaltravelreport.com/articles/${article.slug}`)}&title=${encodeURIComponent(article.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          aria-label="Share on LinkedIn"
        >
          Share on LinkedIn
        </a>
      </div>
    </article>
  );
} 