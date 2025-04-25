'use client';

import { useState, useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { logger } from '@/app/utils/logger';

interface FormData {
  name: string;
  email: string;
  message: string;
  recaptchaToken: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    recaptchaToken: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Check if reCAPTCHA is ready
  useEffect(() => {
    if (!executeRecaptcha) {
      logger.warn('reCAPTCHA not ready');
      setErrorMessage('reCAPTCHA is not ready. Please refresh the page.');
    } else {
      logger.info('reCAPTCHA is ready');
    }
  }, [executeRecaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executeRecaptcha) {
      logger.error('reCAPTCHA execution failed: not ready');
      setStatus('error');
      setErrorMessage('reCAPTCHA is not ready. Please refresh the page.');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');
      
      logger.info('Executing reCAPTCHA...');
      // Get reCAPTCHA token
      const token = await executeRecaptcha('contact_form');
      logger.info('reCAPTCHA token received');
      
      if (!token) {
        logger.error('reCAPTCHA token is empty');
        throw new Error('Failed to get reCAPTCHA token');
      }

      // Update form data with token
      setFormData(prev => ({ ...prev, recaptchaToken: token }));

      logger.info('Submitting form with token...');
      // Submit form data
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      logger.info('Server response received', { status: response.status });

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '', recaptchaToken: '' });
    } catch (error) {
      logger.error('Form submission error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      
      {status === 'success' && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          <h3 className="font-semibold">Message Sent Successfully!</h3>
          <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <h3 className="font-semibold">Error Sending Message</h3>
          <p>{errorMessage}</p>
          <p className="mt-2 text-sm">Please try again or contact us directly at editorial@globaltravelreport.com</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Hidden reCAPTCHA token field */}
        <input
          type="hidden"
          name="recaptchaToken"
          value={formData.recaptchaToken}
        />

        <button
          type="submit"
          disabled={status === 'loading' || !executeRecaptcha}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            status === 'loading' || !executeRecaptcha ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
} 