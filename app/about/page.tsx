
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

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-brand-gold/10 animate-float-slow"></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-brand-gold/5 animate-float-medium"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-brand-gold/5 animate-float-fast"></div>
          <div className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-brand-gold/10 animate-float-medium"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-brand-gold mx-auto"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-brand-gold">Global Travel Report</span>
            </h1>
            <p className="text-xl text-gray-300">
              Your daily guide to smarter travel
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg mx-auto">
              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Welcome to Global Travel Report — your daily guide to smarter travel.
              </p>

              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Founded by Rodney & Nuch Pattison, Global Travel Report was born from a shared love of travel and a desire to help others discover the world with confidence, curiosity, and clarity. With decades of travel industry experience behind us, we created this platform to offer fresh, relevant, and trustworthy travel news that speaks directly to Australian travellers.
              </p>

              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Every day, we publish carefully selected stories that matter — from destination insights and airline updates to cruise news, travel deals, and expert tips. Our content is clear, unbiased, and designed to help you stay informed and inspired, without the fluff.
              </p>

              <div className="my-12 p-8 bg-brand-light rounded-lg border-l-4 border-brand-gold">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Our Vision</h2>
                <p className="text-gray-700">
                  We're proud to keep the site independent, ad-supported, and accessible to all. We focus on what helps our readers plan smarter, travel better, and get more out of every journey.
                </p>
              </div>

              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                Whether you're a seasoned traveller, a deal hunter, or someone dreaming of your next escape — we're here to guide you, every step of the way.
              </p>

              {/* Founders Section */}
              <h2 className="text-3xl font-bold text-brand-dark mt-12 mb-6">Our Founders</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                <div className="bg-brand-light p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2">
                  <div className="w-24 h-24 bg-brand-dark rounded-full mx-auto mb-4 overflow-hidden border-2 border-brand-gold">
                    {/* Placeholder for Rodney's photo */}
                    <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand-blue-800 flex items-center justify-center text-white text-xl font-bold">RP</div>
                  </div>
                  <h3 className="text-xl font-semibold text-center text-brand-dark">Rodney Pattison</h3>
                  <p className="text-center text-gray-600 mt-2">
                    Co-Founder & Editor
                  </p>
                </div>

                <div className="bg-brand-light p-6 rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-2">
                  <div className="w-24 h-24 bg-brand-dark rounded-full mx-auto mb-4 overflow-hidden border-2 border-brand-gold">
                    {/* Placeholder for Nuch's photo */}
                    <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand-blue-800 flex items-center justify-center text-white text-xl font-bold">NP</div>
                  </div>
                  <h3 className="text-xl font-semibold text-center text-brand-dark">Nuch Pattison</h3>
                  <p className="text-center text-gray-600 mt-2">
                    Co-Founder & Creative Director
                  </p>
                </div>
              </div>

              <div className="my-12 p-8 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                <p className="text-xl italic text-gray-700 mb-4">
                  "We're here to guide you, every step of the way."
                </p>
                <p className="text-brand-gold font-semibold">
                  — Rodney & Nuch
                </p>
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