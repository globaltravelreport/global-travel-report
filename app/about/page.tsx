
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">About Global Travel Report</h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg mb-4">
          Global Travel Report is your trusted source for travel insights, destination guides, and inspiring stories from around the world.
        </p>
        <p className="text-lg mb-4">
          Our mission is to provide travelers with accurate, engaging, and useful information to help them plan their next adventure.
        </p>
        <p className="text-lg mb-4">
          Founded by a team of passionate travelers and writers, Global Travel Report aims to showcase the beauty and diversity of our world.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
        <p className="text-lg mb-4">
          Our editorial team consists of experienced travel writers, photographers, and industry experts who are dedicated to bringing you the best travel content.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p className="text-lg mb-4">
          Have questions or suggestions? We'd love to hear from you! Visit our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a> to get in touch.
        </p>
      </div>
    </div>
  );
}