export const metadata = {
  title: 'Contact Us - Global Travel Report',
  description: 'Get in touch with the Global Travel Report team. We\'d love to hear from you!',
};

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contact <span className="text-brand-gold">Us</span>
            </h1>
            <p className="text-xl text-gray-300">
              We'd love to hear from you! Get in touch with our team.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-10 text-center text-gray-700">
              Please use the form below to get in touch with our team. We'll get back to you as soon as possible.
            </p>

            <div className="bg-brand-light p-8 rounded-lg shadow-lg border border-gray-200">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    placeholder="Your message here..."
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-brand-gold text-brand-dark py-3 px-4 rounded-md hover:bg-brand-lightGold transition-colors font-semibold"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12">Other Ways to Reach Us</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dark flex items-center justify-center">
                  <span className="text-2xl text-brand-gold">✉️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-brand-dark">Email Us</h3>
                <p className="text-gray-600 mb-4">For general inquiries and feedback</p>
                <a
                  href="mailto:editorial@globaltravelreport.com"
                  className="text-brand-gold hover:text-brand-lightGold font-medium"
                >
                  editorial@globaltravelreport.com
                </a>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-dark flex items-center justify-center">
                  <span className="text-2xl text-brand-gold">📍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-brand-dark">Our Location</h3>
                <p className="text-gray-600 mb-4">Based in beautiful</p>
                <p className="text-brand-dark font-medium">Sydney, Australia</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}