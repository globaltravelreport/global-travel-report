import Head from 'next/head'
import { siteConfig } from '../config/site'

interface MetaTagsProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'article' | 'website'
  publishedTime?: string
  author?: string
  tags?: string[]
}

export default function MetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author,
  tags = []
}: MetaTagsProps) {
  const fullTitle = title ? `${title} | ${siteConfig.siteName}` : siteConfig.siteName
  const fullDescription = description || siteConfig.siteDescription
  const fullUrl = url ? `${siteConfig.siteUrl}${url}` : siteConfig.siteUrl
  const fullImage = image ? `${siteConfig.siteUrl}/images/${image}` : `${siteConfig.siteUrl}/images/og-default.jpg`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteConfig.siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteConfig.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Article specific */}
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:author" content={author} />
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
    </Head>
  )
} 