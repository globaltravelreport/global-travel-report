
export const metadata = {
  title: 'About Us - Global Travel Report',
  description: 'Learn about Global Travel Report, our mission, and our team of travel experts and writers.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-brand-gold">Global Travel Report</span>
            </h1>
            <p className="text-xl text-gray-300">
              Your trusted source for travel insights and stories
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg mx-auto">
              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Global Travel Report is your trusted source for travel insights, destination guides, and inspiring stories from around the world.
              </p>

              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Our mission is to provide travelers with accurate, engaging, and useful information to help them plan their next adventure.
              </p>

              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Founded by a team of passionate travelers and writers, Global Travel Report aims to showcase the beauty and diversity of our world.
              </p>

              <div className="my-12 p-8 bg-brand-light rounded-lg border-l-4 border-brand-gold">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Our Vision</h2>
                <p className="text-gray-700">
                  To inspire and empower travelers with authentic, reliable information that enhances their journey and connects them with diverse cultures and experiences around the globe.
                </p>
              </div>

              <h2 className="text-3xl font-bold text-brand-dark mt-12 mb-6">Our Team</h2>
              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Our editorial team consists of experienced travel writers, photographers, and industry experts who are dedicated to bringing you the best travel content.
              </p>

              {/* Team Placeholder */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                <div className="bg-brand-light p-6 rounded-lg">
                  <div className="w-20 h-20 bg-brand-dark rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-center text-brand-dark">Editorial Team</h3>
                  <p className="text-center text-gray-600 mt-2">
                    Our writers and editors bring stories from around the world
                  </p>
                </div>

                <div className="bg-brand-light p-6 rounded-lg">
                  <div className="w-20 h-20 bg-brand-dark rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-center text-brand-dark">Photography Team</h3>
                  <p className="text-center text-gray-600 mt-2">
                    Capturing the beauty of destinations worldwide
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-brand-dark mt-12 mb-6">Contact Us</h2>
              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Have questions or suggestions? We'd love to hear from you! Visit our <a href="/contact" className="text-brand-gold hover:text-brand-lightGold font-medium">Contact page</a> to get in touch.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}