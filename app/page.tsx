export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-24 bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-5xl font-bold text-blue-700 mb-6 drop-shadow">Welcome to Global Travel Report</h1>
      <p className="text-xl text-blue-900 mb-8 max-w-2xl">
        Your destination for inspiring travel stories, tips, and guides from around the world. <br />
        We're working hard to bring you amazing content. Stay tuned!
      </p>
      <span className="inline-block bg-blue-200 text-blue-800 px-6 py-2 rounded-full font-semibold text-lg mb-8 animate-pulse">
        Coming Soon
      </span>
      <a href="/about" className="text-blue-600 underline hover:text-blue-800 font-medium">Learn more about us</a>
    </div>
  );
}