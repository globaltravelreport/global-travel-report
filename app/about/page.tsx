import Image from 'next/image';
import type { Metadata } from 'next';

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
    bio: 'With over 15 years of travel experience, Rodney has visited more than 50 countries and is passionate about sharing authentic travel stories.',
    image: '/images/team/rodney.jpg',
  },
  {
    name: 'Nuch Pattison',
    role: 'Creative Director',
    bio: 'Nuch brings her creative vision to our content, ensuring that every story is beautifully presented and engaging.',
    image: '/images/team/nuch.jpg',
  },
  {
    name: 'Sarah Johnson',
    role: 'Senior Travel Writer',
    bio: 'Sarah specializes in cultural travel and has a talent for uncovering hidden gems in every destination.',
    image: '/images/team/sarah.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Photography Director',
    bio: 'Michael\'s stunning photography captures the essence of each destination and brings our stories to life.',
    image: '/images/team/michael.jpg',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About Global Travel Report
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We're passionate about sharing authentic travel stories and helping travelers discover the world's most amazing destinations.
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-[#C9A14A] bg-opacity-10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  At Global Travel Report, we believe that travel has the power to transform lives and bring people together. Our mission is to inspire and empower travelers through authentic stories, practical advice, and beautiful photography.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  We're committed to promoting responsible travel practices and showcasing the diverse cultures and natural wonders of our world.
                </p>
              </div>
              <div className="relative h-64 md:h-full">
                <Image
                  src="/images/about/mission.jpg"
                  alt="Our mission in action"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-[#C9A14A] font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Authenticity
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in sharing real, unfiltered travel experiences that help readers make informed decisions.
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sustainability
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We promote responsible travel practices that respect local communities and preserve natural resources.
              </p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We foster a global community of travelers who share their experiences and support each other.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 