import UnsplashHero from '../components/UnsplashHero';

export const metadata = {
  title: 'Destinations - Global Travel Report',
  description: 'Explore amazing travel destinations around the world with insights, guides, and tips from Global Travel Report.',
};

// Define the destinations data
const DESTINATIONS = [
  {
    name: 'Australia',
    slug: 'australia',
    image: '/images/placeholder.svg',
    description: 'Explore the diverse landscapes and vibrant cities of Australia',
    featured: true,
  },
  {
    name: 'Japan',
    slug: 'japan',
    image: '/images/placeholder.svg',
    description: 'Discover the perfect blend of tradition and modernity in Japan',
    featured: true,
  },
  {
    name: 'Italy',
    slug: 'italy',
    image: '/images/placeholder.svg',
    description: 'Experience the rich history, culture, and cuisine of Italy',
    featured: true,
  },
  {
    name: 'Thailand',
    slug: 'thailand',
    image: '/images/placeholder.svg',
    description: 'Enjoy the beautiful beaches, temples, and food of Thailand',
    featured: true,
  },
  {
    name: 'New Zealand',
    slug: 'new-zealand',
    image: '/images/placeholder.svg',
    description: 'Adventure through the stunning landscapes of New Zealand',
    featured: true,
  },
  {
    name: 'France',
    slug: 'france',
    image: '/images/placeholder.svg',
    description: 'Indulge in the romance, art, and gastronomy of France',
    featured: true,
  },
  {
    name: 'United States',
    slug: 'united-states',
    image: '/images/placeholder.svg',
    description: 'Explore the diverse landscapes and vibrant cities of the USA',
    featured: true,
  },
  {
    name: 'Greece',
    slug: 'greece',
    image: '/images/placeholder.svg',
    description: 'Discover ancient history and island paradise in Greece',
    featured: true,
  },
  {
    name: 'Indonesia',
    slug: 'indonesia',
    image: '/images/placeholder.svg',
    description: 'Experience the tropical beauty and cultural diversity of Indonesia',
    featured: false,
  },
  {
    name: 'Spain',
    slug: 'spain',
    image: '/images/placeholder.svg',
    description: 'Enjoy the vibrant culture, history, and beaches of Spain',
    featured: false,
  },
  {
    name: 'Canada',
    slug: 'canada',
    image: '/images/placeholder.svg',
    description: 'Explore the natural wonders and friendly cities of Canada',
    featured: false,
  },
  {
    name: 'Vietnam',
    slug: 'vietnam',
    image: '/images/placeholder.svg',
    description: 'Discover the rich culture and stunning landscapes of Vietnam',
    featured: false,
  },
];

export default function DestinationsPage() {
  // Get all destinations
  const allDestinations = DESTINATIONS;

  // Group destinations by featured status
  const featuredDestinations = allDestinations.filter(destination => destination.featured);
  const otherDestinations = allDestinations.filter(destination => !destination.featured);

  return (
    <>
      {/* Hero Section */}
      <UnsplashHero
        imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080"
        photographerName="Nico Beard"
        photographerUrl="https://unsplash.com/@nicobeard"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4">
            <div className="h-1 w-20 bg-brand-gold mx-auto"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Explore <span className="text-brand-gold">Destinations</span>
          </h1>
          <p className="text-xl text-gray-300">
            Discover amazing places around the world
          </p>
        </div>
      </UnsplashHero>

      {/* Featured Destinations Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">Featured Destinations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of amazing places to visit around the world
            </p>
            <div className="h-1 w-20 bg-brand-gold mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDestinations.map((destination, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border border-gray-100 group"
              >
                <div className="h-48 bg-brand-dark/10 relative overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-brand-dark mb-2 group-hover:text-brand-gold transition-colors duration-300">
                    {destination.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {destination.description}
                  </p>
                  <a
                    href="#"
                    className="text-brand-gold hover:text-brand-lightGold font-medium inline-flex items-center group-hover:translate-x-1 transition-transform duration-300"
                  >
                    Explore
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">Explore the World</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find travel inspiration for your next adventure
            </p>
            <div className="h-1 w-20 bg-brand-gold mx-auto mt-6"></div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="aspect-w-16 aspect-h-9 bg-brand-dark/5 rounded-lg overflow-hidden">
              {/* Placeholder for world map */}
              <div className="flex items-center justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <h3 className="font-semibold text-brand-dark">Asia</h3>
                <p className="text-sm text-gray-600">20 destinations</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-brand-dark">Europe</h3>
                <p className="text-sm text-gray-600">25 destinations</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-brand-dark">Americas</h3>
                <p className="text-sm text-gray-600">18 destinations</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-brand-dark">Oceania</h3>
                <p className="text-sm text-gray-600">12 destinations</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">
              Looking for travel inspiration? Browse our collection of destination guides.
            </p>
            <a
              href="/categories"
              className="inline-flex items-center px-6 py-3 bg-brand-dark text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors duration-300"
            >
              View All Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
