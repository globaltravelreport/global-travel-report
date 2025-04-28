"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ReCaptcha } from '@/components/ui/ReCaptcha';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  category: z.string().min(1, 'Category is required'),
  country: z.string().min(1, 'Country is required'),
});

type FormData = z.infer<typeof formSchema>;

export const StoryForm: React.FC = () => {
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
      const response = await fetch('/api/stories', {
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
        throw new Error('Failed to submit story');
      }

      toast({
        title: 'Success',
        description: 'Your story has been submitted successfully',
      });

      reset();
      setRecaptchaValue(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to submit story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <Input
          id="title"
          {...register('title')}
          className="mt-1"
          disabled={isSubmitting}
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600" id="title-error" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <Textarea
          id="content"
          {...register('content')}
          className="mt-1"
          rows={10}
          disabled={isSubmitting}
          aria-invalid={errors.content ? 'true' : 'false'}
          aria-describedby={errors.content ? 'content-error' : undefined}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600" id="content-error" role="alert">
            {errors.content.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <Input
          id="category"
          {...register('category')}
          className="mt-1"
          disabled={isSubmitting}
          aria-invalid={errors.category ? 'true' : 'false'}
          aria-describedby={errors.category ? 'category-error' : undefined}
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-600" id="category-error" role="alert">
            {errors.category.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Country
        </label>
        <Input
          id="country"
          {...register('country')}
          className="mt-1"
          disabled={isSubmitting}
          aria-invalid={errors.country ? 'true' : 'false'}
          aria-describedby={errors.country ? 'country-error' : undefined}
        />
        {errors.country && (
          <p className="mt-1 text-sm text-red-600" id="country-error" role="alert">
            {errors.country.message}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <ReCaptcha
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
          onChange={setRecaptchaValue}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !recaptchaValue}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Story'}
      </Button>
    </form>
  );
}; 