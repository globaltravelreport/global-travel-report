'use client'

import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      if (!validateEmail(email)) {
        setError('Please enter a valid email address')
        return
      }

      // Execute reCAPTCHA
      const token = await recaptchaRef.current?.execute()
      if (!token) {
        setError('reCAPTCHA verification failed. Please try again.')
        return
      }

      // Store email in localStorage (simulating backend)
      const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]')
      if (!subscribers.includes(email)) {
        subscribers.push(email)
        localStorage.setItem('subscribers', JSON.stringify(subscribers))
      }

      // Show success message and reset form
      setSuccess(true)
      setEmail('')
      recaptchaRef.current?.reset()
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Subscription error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-blue-50 rounded-lg p-8 my-12">
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between md:space-x-8">
          <div className="mb-6 md:mb-0 md:flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Get the Daily Travel Report
            </h3>
            <p className="text-gray-600">
              Join 1,000+ readers receiving curated travel news every day.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="md:flex-1">
            <div className="flex flex-col space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  aria-describedby={error ? 'email-error' : undefined}
                  disabled={isSubmitting}
                />
                {error && (
                  <p id="email-error" className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>

              <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                theme="light"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors
                  ${isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>
        
        {success && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg animate-fade-in">
            Thanks for subscribing!
          </div>
        )}
      </div>
    </div>
  )
} 