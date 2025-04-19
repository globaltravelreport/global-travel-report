import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative h-[600px] bg-cover bg-center" style={{ backgroundImage: 'url(/images/destinations-hero.jpg)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative h-full flex flex-col justify-center items-center text-white text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Explore the World with Us
        </h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Discover amazing destinations, travel tips, and exclusive deals for your next adventure.
        </p>
      </div>
    </div>
  )
} 