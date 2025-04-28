'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import ReCAPTCHA from 'react-google-recaptcha';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof formSchema>;

export const NewsletterSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!recaptchaValue) {
      toast({
        title: 'Error',
        description: 'Please complete the reCAPTCHA verification',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken: recaptchaValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      toast({
        title: 'Success',
        description: 'You have been subscribed to our newsletter',
      });

      reset();
      setRecaptchaValue(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Subscribe to Our Newsletter
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get the latest travel stories, tips, and inspiration delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 max-w-md mx-auto">
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="w-full"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                onChange={setRecaptchaValue}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !recaptchaValue}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 