'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Newsletter() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStatus('success')
      setFormData({ name: '', email: '' })
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to subscribe. Please try again later.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <section className="py-16 bg-brand-navy text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/images/destinations-hero.jpg"
          alt="Travel background"
          fill
          className="object-cover"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Travel News</h2>
          <p className="text-lg text-gray-300 mb-8">
            Get the latest travel tips, destination guides, and exclusive deals delivered to your inbox.
          </p>
          {status === 'success' ? (
            <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg">
              <p>Thank you for subscribing! You'll receive our next newsletter soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="px-4 py-3 rounded-lg bg-white text-gray-900 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-lg bg-white text-gray-900 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-brand-teal hover:bg-teal-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
              {status === 'error' && (
                <p className="text-red-300 text-sm">{errorMessage}</p>
              )}
            </form>
          )}
          <p className="mt-4 text-sm text-gray-400">
            By subscribing, you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>
      </div>
    </section>
  )
} 