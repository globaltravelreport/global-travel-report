'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ReCAPTCHA from 'react-google-recaptcha'
import { useToast } from '@/components/ui/use-toast'
import { useCsrfToken } from '@/src/hooks/useCsrfToken'
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { contactSchema } from '@/src/utils/validation-schemas';

export function ContactForm() {
  const { toast } = useToast();
  const { values, errors, loading, success, handleChange, handleSubmit } = useFormValidation(contactSchema, {
    name: '',
    email: '',
    message: '',
    recaptchaToken: '',
    csrfToken: '',
  });
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': data.csrfToken },
      body: JSON.stringify({ ...data, recaptchaToken: recaptchaValue }),
    });
    if (!response.ok) throw response;
    toast({ title: 'Success', description: 'Your message has been sent successfully!' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Have a question or want to share your travel story? We'd love to hear from you.
        </p>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}
        className="space-y-6"
        aria-label="Contact form"
      >
        <div className="space-y-4">
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            value={values.name}
            onChange={e => handleChange('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
          />
          {errors.name && <div id="name-error" className="text-red-600 text-sm">{errors.name}</div>}
          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            value={values.email}
            onChange={e => handleChange('email', e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          {errors.email && <div id="email-error" className="text-red-600 text-sm">{errors.email}</div>}
          <Textarea
            name="message"
            placeholder="Your Message"
            required
            value={values.message}
            onChange={e => handleChange('message', e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby="message-error"
          />
          {errors.message && <div id="message-error" className="text-red-600 text-sm">{errors.message}</div>}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={token => {
                setRecaptchaValue(token);
                handleChange('recaptchaToken', token || '');
              }}
            />
          </div>
        </div>
        {errors._form && <div className="text-red-600 text-sm">{errors._form}</div>}
        <Button type="submit" disabled={loading || success} className="w-full" aria-busy={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
        {success && <div className="text-green-600 text-sm mt-2">Message sent successfully!</div>}
      </form>
    </div>
  );
}