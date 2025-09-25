'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterSignupProps {
  variant?: 'inline' | 'popup' | 'banner';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function NewsletterSignup({
  variant = 'inline',
  title = 'Stay Updated',
  description = 'Get the latest travel stories and tips delivered to your inbox.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  className = '',
  onSuccess,
  onError
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Here you would integrate with your newsletter service (Mailchimp, ConvertKit, etc.)
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
        onSuccess?.();
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const variants = {
    inline: 'bg-white rounded-lg shadow-sm border p-6',
    popup: 'bg-white rounded-lg shadow-xl border p-6 max-w-md mx-auto',
    banner: 'bg-blue-600 text-white p-4 text-center'
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${variants[variant]} ${className}`}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">Thank you for subscribing!</h3>
          <p className="text-gray-600">
            You'll receive our latest travel stories and tips in your inbox soon.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${variants[variant]} ${className}`}
    >
      <div className={variant === 'banner' ? 'text-center' : ''}>
        <h3 className={`font-semibold mb-2 ${variant === 'banner' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`mb-4 ${variant === 'banner' ? 'text-blue-100' : 'text-gray-600'}`}>
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className={`flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                variant === 'banner' ? 'border-blue-300 bg-white text-gray-900' : 'border-gray-300'
              }`}
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                variant === 'banner'
                  ? 'bg-white text-blue-600 hover:bg-blue-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </motion.div>
                ) : (
                  <motion.span
                    key="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {buttonText}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-600 text-sm"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <p className={`text-xs mt-3 ${variant === 'banner' ? 'text-blue-100' : 'text-gray-500'}`}>
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </motion.div>
  );
}

// Floating Newsletter Button Component
export function FloatingNewsletterButton({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg ${className}`}
        title="Subscribe to Newsletter"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-20 left-6 z-50"
            >
              <NewsletterSignup
                variant="popup"
                onSuccess={() => setIsOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}