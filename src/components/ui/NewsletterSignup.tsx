"use client";

import React, { useState } from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { ReCaptcha } from "./ReCaptcha";
import { useToast } from "@/components/ui/use-toast";
import { useCsrfToken } from "@/src/hooks/useCsrfToken";

interface NewsletterSignupProps {
  onClose?: () => void;
}

export function NewsletterSignup({ onClose }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { toast } = useToast();
  const { csrfToken } = useCsrfToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    if (!recaptchaToken) {
      toast({
        title: 'Error',
        description: 'Please complete the reCAPTCHA verification'
      });
      setStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        body: JSON.stringify({
          email,
          recaptchaToken,
          csrfToken: csrfToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
      toast({
        title: 'Success',
        description: 'Successfully subscribed to the newsletter!'
      });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setStatus('error');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to subscribe. Please try again.'
      });
    }
  };

  return (
    <div className="bg-blue-50 rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
      <p className="text-gray-600 mb-6">
        Get the latest travel stories and insights delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            required
            aria-invalid={status === "error" ? "true" : "false"}
            aria-describedby={status === "error" ? "newsletter-error" : undefined}
            disabled={status === "loading"}
          />
          {status === "error" && (
            <p id="newsletter-error" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <ReCaptcha
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
          onChange={(token: string | null) => {
            if (!token) {
              setError('Please complete the reCAPTCHA verification');
              setStatus("error");
            }
            setRecaptchaToken(token);
          }}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={status === "loading"}
          aria-label="Subscribe to newsletter"
        >
          {status === "loading" ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Subscribing...
            </span>
          ) : (
            "Subscribe"
          )}
        </Button>

        {status === "success" && (
          <p className="text-sm text-green-600">
            Thanks for subscribing! We'll keep you updated.
          </p>
        )}
      </form>
    </div>
  );
}