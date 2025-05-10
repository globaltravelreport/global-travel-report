export default function TestHomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">Global Travel Report - Test Page</h1>
      <p className="text-xl mb-8">This is a simple test page to verify that the site is loading correctly.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">About Us</h2>
          <p>Global Travel Report is your trusted source for travel insights, destination guides, and inspiring stories from around the world.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>Have questions or feedback? We'd love to hear from you. Reach out to our team at contact@globaltravelreport.com.</p>
        </div>
      </div>
    </div>
  );
}
