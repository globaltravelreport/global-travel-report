'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal' | 'banner' | 'sidebar' | 'footer';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
  showSocialProof?: boolean;
  compact?: boolean;
  autoShow?: boolean;
  delay?: number; // Auto-show delay in milliseconds
}

interface NewsletterFormData {
  email: string;
  name?: string;
  preferences?: {
    destinations: boolean;
    travelTips: boolean;
    deals: boolean;
    news: boolean;
  };
  frequency?: 'daily' | 'weekly' | 'monthly';
  source?: string;
}

const defaultProps = {
  variant: 'inline' as const,
  title: 'Stay Updated with Global Travel Report',
  description: 'Get the latest travel stories, destination guides, and exclusive deals delivered to your inbox.',
  placeholder: 'Enter your email address',
  buttonText: 'Subscribe',
  showSocialProof: true,
  compact: false,
  autoShow: false,
  delay: 30000, // 30 seconds
};

export function NewsletterSignup({
  variant = defaultProps.variant,
  title = defaultProps.title,
  description = defaultProps.description,
  placeholder = defaultProps.placeholder,
  buttonText = defaultProps.buttonText,
  className = '',
  onSuccess,
  onError,
  showSocialProof = defaultProps.showSocialProof,
  compact = defaultProps.compact,
  autoShow = defaultProps.autoShow,
  delay = defaultProps.delay,
}: NewsletterSignupProps) {
  const [formData, setFormData] = useState<NewsletterFormData>({
    email: '',
    preferences: {
      destinations: true,
      travelTips: true,
      deals: true,
      news: false,
    },
    frequency: 'weekly',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(variant !== 'modal');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-show modal after delay
  useEffect(() => {
    if (variant === 'modal' && autoShow && delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [variant, autoShow, delay]);

  // Track if user has already subscribed
  useEffect(() => {
    const hasSubscribed = localStorage.getItem('newsletter_subscribed');
    if (hasSubscribed) {
      setIsSuccess(true);
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      onError?.('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would be an API call
      const response = await mockSubscribeAPI(formData);

      if (response.success) {
        setIsSuccess(true);
        localStorage.setItem('newsletter_subscribed', 'true');
        onSuccess?.(formData.email);
      } else {
        throw new Error(response.error || 'Subscription failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewsletterFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (preference: keyof NonNullable<NewsletterFormData['preferences']>, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        [preference]: checked,
      },
    }));
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'inline':
        return compact
          ? 'max-w-md mx-auto'
          : 'max-w-lg mx-auto';
      case 'modal':
        return 'max-w-md mx-auto';
      case 'banner':
        return 'w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white';
      case 'sidebar':
        return 'w-80';
      case 'footer':
        return 'max-w-md';
      default:
        return 'max-w-lg mx-auto';
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder={placeholder}
          required
          disabled={isSubmitting || isSuccess}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={isSubmitting || isSuccess || !formData.email}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Subscribing...
            </div>
          ) : (
            buttonText
          )}
        </button>
      </div>

      {/* Advanced preferences */}
      {showAdvanced && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-3 pt-3 border-t border-gray-200"
        >
          <div>
            <label htmlFor="newsletter-frequency" className="block text-sm font-medium text-gray-700 mb-2">
              Newsletter Frequency
            </label>
            <select
              id="newsletter-frequency"
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Highlights</option>
            </select>
          </div>

          <div>
            <div id="content-preferences-label" className="block text-sm font-medium text-gray-700 mb-2">
              Content Preferences
            </div>
            <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="content-preferences-label">
              {Object.entries(formData.preferences || {}).map(([key, value]) => {
                const id = `pref-${key}`;
                return (
                  <label key={key} htmlFor={id} className="flex items-center">
                    <input
                      id={id}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handlePreferenceChange(key as keyof NonNullable<NewsletterFormData['preferences']>, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Welcome aboard! 🎉
      </h3>
      <p className="text-gray-600">
        Thank you for subscribing. Check your email for a confirmation link.
      </p>
    </motion.div>
  );

  // Modal variant
  if (variant === 'modal') {
    return (
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <button
                  type="button"
                  className="absolute inset-0 bg-gray-500 opacity-75"
                  aria-label="Close newsletter modal"
                  onClick={closeModal}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      closeModal();
                    }
                  }}
                />
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {title}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-4">
                    {isSuccess ? renderSuccess() : renderForm()}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSuccess ? 'Got it!' : 'Maybe later'}
                  </button>
                  {!isSuccess && (
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {showAdvanced ? 'Simple' : 'Advanced'} Options
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Other variants
  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className={`bg-white rounded-lg border p-6 ${variant === 'banner' ? 'border-none' : 'shadow-sm'}`}>
        {!compact && (
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600">
              {description}
            </p>
          </div>
        )}

        {isSuccess ? renderSuccess() : renderForm()}

        {/* Social proof */}
        {showSocialProof && !isSuccess && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Join 25,000+ travelers already subscribed
            </p>
            <div className="flex justify-center items-center mt-2 space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-gray-500">4.9/5 from 1,200+ reviews</span>
            </div>
          </div>
        )}

        {/* Privacy notice */}
        {!isSuccess && (
          <p className="mt-3 text-xs text-gray-500 text-center">
            We respect your privacy. Unsubscribe at any time.{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

// Newsletter signup trigger button
interface NewsletterButtonProps {
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function NewsletterButton({
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
}: NewsletterButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Subscribe to Newsletter
    </button>
  );
}

// Mock API function (replace with real API call)
async function mockSubscribeAPI(data: NewsletterFormData): Promise<{ success: boolean; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate occasional failures
  if (Math.random() < 0.1) {
    return { success: false, error: 'Network error. Please try again.' };
  }

  // Simulate duplicate email
  if (data.email.includes('duplicate')) {
    return { success: false, error: 'This email is already subscribed.' };
  }

  return { success: true };
}