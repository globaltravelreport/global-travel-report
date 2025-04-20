import { Metadata } from 'next'
import PageLayout from '../components/PageLayout'

export const metadata: Metadata = {
  title: 'About Us | Global Travel Report',
  description: 'Learn more about Rodney & Nuch, the travel-loving team behind Global Travel Report.',
  openGraph: {
    title: 'About Us | Global Travel Report',
    description: 'Learn more about Rodney & Nuch, the travel-loving team behind Global Travel Report.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <PageLayout
      title="About Us"
      description="Learn about our mission and team"
      heroType="about"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We're Rodney and Nuch, a husband-and-wife team with a long history in the travel industry. 
              While we've stepped back from selling holidays, our passion for travel and connection hasn't gone anywhere. 
              These days, we focus on what we love most—escorting small-group tours and creating unforgettable experiences 
              for our travel community.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission is simple: to keep travellers informed, inspired, and empowered. At Global Travel Report, 
              we curate the latest travel news, trends, tips, and destination updates—all in one place. Whether you're 
              planning your next escape or just dreaming of where to go next, we're here to keep your wanderlust alive 
              with honest, helpful insights from real travellers.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Travel With Us</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We've spent decades exploring the world—sometimes solo, often together, and frequently with amazing groups 
              of people who started as clients and ended up as lifelong friends. Our escorted tours aren't just holidays; 
              they're journeys filled with laughter, connection, and unforgettable moments. With a mix of experience, heart, 
              and humour, we bring people together through travel.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We've been in the travel industry for over 30 years, working with major airlines, running our own agency, 
              and exploring countless destinations side-by-side. Along the way, we've built a loyal following of fellow 
              travellers who value our honest advice, industry knowledge, and warm approach. Global Travel Report is our 
              next chapter—a place where our love for travel meets storytelling and community.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet the Team</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Rodney is a former airline and travel agency professional with a love for words, humour, and discovering 
              the story behind every journey. Nuch is the heart of our travels—organised, intuitive, and endlessly kind. 
              Together, we're a down-to-earth duo who love exploring the world and making every traveller feel like family.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  )
} 