import Hero from './components/Hero'
import FeaturedArticle from './components/FeaturedArticle'
import LatestNews from './components/LatestNews'
import Deals from './components/Deals'
import Newsletter from './components/Newsletter'

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedArticle />
      <LatestNews />
      <Deals />
      <Newsletter />
    </main>
  )
} 