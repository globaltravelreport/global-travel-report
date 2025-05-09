
import type { Metadata } from 'next';
import { SafeSearchParamsProvider } from '@/src/components/ui/SearchParamsProvider';

export const metadata: Metadata = {
  title: 'About Us - Global Travel Report',
  description: 'Learn about our mission, team, and commitment to sharing authentic travel stories from around the world.',
  openGraph: {
    title: 'About Us - Global Travel Report',
    description: 'Learn about our mission, team, and commitment to sharing authentic travel stories from around the world.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Global Travel Report',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Global Travel Report',
    description: 'Learn about our mission, team, and commitment to sharing authentic travel stories from around the world.',
  },
};

const teamMembers = [
  {
    name: 'Rodney Pattison',
    role: 'Founder & Editor-in-Chief',
    bio: 'With over 15 years of travel experience across 50+ countries, Rodney founded Global Travel Report to share authentic stories and insights from around the world. His passion for travel journalism drives the vision of the publication.',
    image: '/images/team/rodney.jpg',
  },
  {
    name: 'Nongnuch Pattison',
    role: 'Creative Director',
    bio: 'Nongnuch brings her creative vision and design expertise to our content, ensuring that every story is beautifully presented and visually engaging. Her background in visual arts and travel photography adds a unique perspective to our storytelling.',
    image: '/images/team/nuch.jpg',
  },
];

// Server component that will be wrapped in a client component with Suspense
function AboutPageContent() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative h-[400px] mb-20 rounded-2xl overflow-hidden bg-gradient-to-r from-[#19273A] to-[#2A3F5F]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 left-0 right-0 h-[150px]">
              {/* City skyline silhouette */}
              <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="h-full w-full">
                <path fill="currentColor" d="M0,200 L0,160 L40,160 L40,150 L60,150 L60,140 L80,140 L80,130 L100,130 L100,150 L120,150 L120,140 L140,140 L140,130 L160,130 L160,120 L180,120 L180,140 L200,140 L200,120 L220,120 L220,100 L240,100 L240,120 L260,120 L260,110 L280,110 L280,130 L300,130 L300,110 L320,110 L320,90 L340,90 L340,100 L360,100 L360,80 L380,80 L380,90 L400,90 L400,70 L420,70 L420,90 L440,90 L440,60 L460,60 L460,80 L480,80 L480,70 L500,70 L500,60 L520,60 L520,70 L540,70 L540,60 L560,60 L560,50 L580,50 L580,70 L600,70 L600,60 L620,60 L620,80 L640,80 L640,90 L660,90 L660,80 L680,80 L680,90 L700,90 L700,100 L720,100 L720,90 L740,90 L740,110 L760,110 L760,100 L780,100 L780,120 L800,120 L800,100 L820,100 L820,110 L840,110 L840,100 L860,100 L860,120 L880,120 L880,130 L900,130 L900,120 L920,120 L920,140 L940,140 L940,130 L960,130 L960,150 L980,150 L980,140 L1000,140 L1000,150 L1020,150 L1020,140 L1040,140 L1040,160 L1060,160 L1060,150 L1080,150 L1080,160 L1100,160 L1100,150 L1120,150 L1120,160 L1140,160 L1140,170 L1160,170 L1160,160 L1180,160 L1180,170 L1200,170 L1200,200 Z"></path>
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-2xl px-8 md:px-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                About Global Travel Report
              </h1>
              <p className="text-xl text-white/90 max-w-xl">
                Based in Sydney, Australia, we're passionate about sharing authentic travel stories and helping travelers discover the world's most amazing destinations.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-[#19273A] to-[#2A3F5F] rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-8 inline-block relative after:content-[''] after:absolute after:w-1/2 after:h-1 after:bg-[#C9A14A] after:bottom-0 after:left-0 after:-mb-3 pb-3">
              Our Mission
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg mb-6 text-white/90">
                  At Global Travel Report, we believe that travel has the power to transform lives and bring people together. Our mission is to inspire and empower travelers through authentic stories, practical advice, and beautiful photography.
                </p>
                <p className="text-lg text-white/90 mb-6">
                  We're committed to promoting responsible travel practices and showcasing the diverse cultures and natural wonders of our world.
                </p>
                <p className="text-lg text-white/90">
                  Founded in Sydney, Australia, our global perspective allows us to bring you unique insights from destinations around the world, with a special focus on the Asia-Pacific region.
                </p>
              </div>
              <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl bg-[#2A3F5F]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[#C9A14A] text-center">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.618 5.968l1.453-1.453 1.414 1.414-1.453 1.453a9 9 0 11-1.414-1.414zM12 20a7 7 0 100-14 7 7 0 000 14zM11 8h2v6h-2V8zM8 1h8v2H8V1z" />
                    </svg>
                    <span className="text-xl font-semibold">Our Mission</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#19273A]/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 inline-block relative after:content-[''] after:absolute after:w-24 after:h-1 after:bg-[#C9A14A] after:bottom-0 after:left-0 after:-mb-3 pb-3">
            Meet The Founders
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="relative h-80 overflow-hidden bg-[#19273A]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#C9A14A] text-5xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#19273A] to-transparent opacity-70"></div>
                </div>
                <div className="p-8 relative -mt-24 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-[#C9A14A] font-medium mb-4 text-lg">{member.role}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 inline-block relative after:content-[''] after:absolute after:w-24 after:h-1 after:bg-[#C9A14A] after:bottom-0 after:left-0 after:-mb-3 pb-3">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-[#C9A14A] hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#19273A] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Authenticity
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We believe in sharing real, unfiltered travel experiences that help readers make informed decisions. Our content is created with integrity and transparency, reflecting genuine experiences and expert insights.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-[#C9A14A] hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#19273A] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sustainability
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We promote responsible travel practices that respect local communities and preserve natural resources. We believe that travel should enrich both the traveler and the destination, creating positive impacts for future generations.
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-4 border-[#C9A14A] hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-[#19273A] rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Community
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We foster a global community of travelers who share their experiences and support each other. We believe in the power of connection and cultural exchange to create a more understanding and compassionate world.
              </p>
            </div>
          </div>
        </section>

        {/* Sydney Office Section */}
        <section className="mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="relative h-96 md:h-auto bg-[#2A3F5F] flex items-center justify-center">
                <div className="text-[#C9A14A] text-center p-8">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-xl font-semibold block mb-2">Sydney Headquarters</span>
                  <span className="opacity-70">Sydney, Australia</span>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 inline-block relative after:content-[''] after:absolute after:w-24 after:h-1 after:bg-[#C9A14A] after:bottom-0 after:left-0 after:-mb-3 pb-3">
                  Our Sydney Headquarters
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Located in the heart of Sydney, our headquarters serves as the creative hub for our global operations. From here, we coordinate with our network of travel writers, photographers, and experts around the world.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Our Australian roots give us a unique perspective on travel, especially throughout the Asia-Pacific region, while our global network ensures comprehensive coverage of destinations worldwide.
                </p>
                <div className="flex items-center text-[#C9A14A]">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Sydney, Australia</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Export a client component that wraps the server component in a Suspense boundary
export default function AboutPage() {
  return (
    <SafeSearchParamsProvider>
      <AboutPageContent />
    </SafeSearchParamsProvider>
  );
}