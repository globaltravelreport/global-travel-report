'use client'

import { useState } from 'react'
import PageLayout from '../components/PageLayout'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    subscribeToNewsletter: false,
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
      setFormData({ name: '', email: '', subject: '', message: '', subscribeToNewsletter: false })
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to send message. Please try again later.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }))
  }

  return (
    <PageLayout
      title="Contact Us"
      description="Get in touch with our team for any questions or feedback."
      heroImage="/images/contact-hero.jpg"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 border border-gray-200/50">
          {status === 'success' ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
              <p>Thank you for your message! We'll get back to you soon.</p>
              {formData.subscribeToNewsletter && (
                <p className="mt-2">You've also been subscribed to our newsletter.</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/80 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/80 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-white/80 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white/80 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="subscribeToNewsletter"
                  name="subscribeToNewsletter"
                  checked={formData.subscribeToNewsletter}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="subscribeToNewsletter" className="ml-2 block text-sm text-gray-700">
                  Subscribe to our newsletter for travel tips and exclusive deals
                </label>
              </div>

              {status === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                  <p>{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-brand-navy to-brand-teal text-white py-3 px-6 rounded-md hover:from-navy-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  )
} 