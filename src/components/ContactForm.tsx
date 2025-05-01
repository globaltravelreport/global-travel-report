'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ReCAPTCHA from 'react-google-recaptcha'
import { useToast } from '@/components/ui/use-toast'
import { useCsrfToken } from '@/src/hooks/useCsrfToken'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null)
  const { toast } = useToast()
  const { csrfToken } = useCsrfToken()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    if (!recaptchaValue) {
      toast({
        title: 'Error',
        description: 'Please complete the reCAPTCHA verification'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          recaptchaToken: recaptchaValue,
          csrfToken: csrfToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast({
        title: 'Success',
        description: 'Your message has been sent successfully!'
      })

      // Reset form
      event.currentTarget.reset()
      setRecaptchaValue(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
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
        <div className="space-y-4">
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            required
          />
          <Textarea
            name="message"
            placeholder="Your Message"
            required
          />
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
              onChange={setRecaptchaValue}
            />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  )
}