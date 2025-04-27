'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReCaptcha } from '@/components/ui/ReCaptcha'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification')
      setStatus('error')
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setRecaptchaToken('')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Have a question or want to share your travel story? We'd love to hear from you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full"
            aria-invalid={status === 'error'}
            aria-describedby={status === 'error' ? 'form-error' : undefined}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full"
            aria-invalid={status === 'error'}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <Input
            id="subject"
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            className="w-full"
            aria-invalid={status === 'error'}
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={6}
            className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            aria-invalid={status === 'error'}
          />
        </div>

        <ReCaptcha
          onVerify={setRecaptchaToken}
          onError={(error) => {
            setError(error.message)
            setStatus('error')
          }}
          className="mb-4"
        />

        {status === 'error' && (
          <p id="form-error" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={status === 'loading'}
          aria-label="Send message"
        >
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </Button>

        {status === 'success' && (
          <p className="text-sm text-green-600">
            Thanks for your message! We'll get back to you soon.
          </p>
        )}
      </form>
    </div>
  )
} 