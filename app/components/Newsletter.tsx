'use client'

import { useState, useEffect } from 'react'
import { useReCaptcha } from '../hooks/useReCaptcha'
import { recaptchaLog } from '../utils/recaptcha'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error' | 'recaptcha-error'

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { executeReCaptcha, isLoaded, error: recaptchaError } = useReCaptcha()

  // Monitor reCAPTCHA initialization
  useEffect(() => {
    if (recaptchaError) {
      recaptchaLog.error('reCAPTCHA initialization failed', recaptchaError)
      setStatus('recaptcha-error')
      setErrorMessage('Unable to load security verification. Please try again later.')
    }
  }, [recaptchaError])

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset state
    setStatus('submitting')
    setErrorMessage('')

    recaptchaLog.info('Processing newsletter signup', { email })

    // Validate email
    if (!validateEmail(email)) {
      recaptchaLog.warn('Invalid email format', { email })
      setStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    // Check if reCAPTCHA is ready
    if (!isLoaded) {
      recaptchaLog.error('reCAPTCHA not ready')
      setStatus('recaptcha-error')
      setErrorMessage('Security verification not ready. Please try again in a few seconds.')
      return
    }

    try {
      // Execute reCAPTCHA
      recaptchaLog.info('Requesting reCAPTCHA token')
      const token = await executeReCaptcha('newsletter_signup')

      // Simulate API call
      recaptchaLog.info('Submitting newsletter signup', { email })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      recaptchaLog.success('Newsletter signup successful', { email })
      setStatus('success')
      setEmail('')
    } catch (error) {
      recaptchaLog.error('Newsletter signup failed', error)
      setStatus('error')
      setErrorMessage(
        error instanceof Error && error.message === 'reCAPTCHA not loaded'
          ? 'Security verification failed. Please refresh the page and try again.'
          : 'Failed to subscribe. Please try again.'
      )
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'submitting':
        return 'Subscribing...'
      case 'recaptcha-error':
        return 'Verification Failed'
      default:
        return 'Subscribe'
    }
  }

  return (
    <div className="bg-brand-teal">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
        <div className="px-6 py-6 rounded-lg md:py-12 md:px-12 lg:py-16 lg:px-16 xl:flex xl:items-center">
          <div className="xl:w-0 xl:flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Want travel updates?
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-teal-200">
              Sign up for our newsletter to receive the latest travel news, tips, and exclusive deals.
            </p>
          </div>
          <div className="mt-8 sm:w-full sm:max-w-md xl:mt-0 xl:ml-8">
            {status === 'success' ? (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Thanks for subscribing!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="sm:flex">
                <div className="min-w-0 flex-1">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status === 'recaptcha-error'}
                    className={`block w-full rounded-md border px-5 py-3 text-base text-gray-900 placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-teal ${
                      status === 'error' || status === 'recaptcha-error' ? 'border-red-300' : 'border-transparent'
                    } ${status === 'recaptcha-error' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-3">
                  <button
                    type="submit"
                    disabled={status === 'submitting' || status === 'recaptcha-error'}
                    className="block w-full rounded-md border border-transparent bg-teal-500 px-5 py-3 text-base font-medium text-white shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-teal sm:px-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getButtonText()}
                  </button>
                </div>
              </form>
            )}
            {(status === 'error' || status === 'recaptcha-error') && (
              <p className="mt-2 text-sm text-red-200">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Newsletter() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'missing-key'}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      <NewsletterForm />
    </GoogleReCaptchaProvider>
  )
} 