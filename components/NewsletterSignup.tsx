'use client';

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/src/utils/cn";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'inline' | 'minimal';
  title?: string;
  description?: string;
}

export const NewsletterSignup = ({
  className,
  variant = 'default',
  title = 'Subscribe to Our Newsletter',
  description = 'Get the latest travel stories, tips, and inspiration delivered to your inbox.'
}: NewsletterSignupProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [emailError, setEmailError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    if (!isValid) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }

    return isValid;
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      validateEmail(e.target.value);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate email before submission
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          frequency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      // Show success state
      setIsSuccess(true);

      toast({
        title: 'Successfully subscribed!',
        description: `You'll receive our ${frequency} newsletter at ${email}`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });

      // Reset form
      setEmail('');
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: 'There was a problem subscribing to the newsletter. Please try again.',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different variants of the newsletter signup
  if (variant === 'inline') {
    return (
      <div className={cn("bg-gray-50 p-6 rounded-lg", className)} role="region" aria-label="Newsletter subscription">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="flex-1 relative">
              <Input
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className={cn(emailError && "border-red-500 focus:ring-red-500")}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                required
              />
              {emailError && (
                <p id="email-error" className="text-xs text-red-500 mt-1 absolute">{emailError}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="whitespace-nowrap">
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Subscribing...
                </>
              ) : (
                <>Subscribe</>
              )}
            </Button>
          </form>
        </div>

        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>Thank you for subscribing!</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("", className)} role="region" aria-label="Newsletter subscription">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={cn(emailError && "border-red-500 focus:ring-red-500")}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error-minimal" : undefined}
              required
            />
            {emailError && (
              <p id="email-error-minimal" className="text-xs text-red-500 mt-1 absolute">{emailError}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>

        {isSuccess && (
          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Subscribed!</span>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("bg-gradient-to-br from-[#19273A] to-[#2a3b52] text-white py-12 px-4 sm:px-6 rounded-lg shadow-md", className)} role="region" aria-label="Newsletter subscription">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Mail className="h-12 w-12 mx-auto mb-4 text-[#C9A14A]" />
          <h2 className="text-3xl font-bold sm:text-4xl mb-3" id="newsletter-heading">
            {title}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-6 relative">
            <Label htmlFor="email" className="block text-sm font-medium mb-2">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              className={cn(
                "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#C9A14A] focus:ring-[#C9A14A]",
                emailError && "border-red-400 focus:border-red-400 focus:ring-red-400"
              )}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error-default" : undefined}
              required
            />
            {emailError && (
              <p id="email-error-default" className="text-xs text-red-400 mt-1 absolute">{emailError}</p>
            )}
          </div>

          <div className="mb-6">
            <Label className="block text-sm font-medium mb-3">
              How often would you like to hear from us?
            </Label>
            <RadioGroup
              value={frequency}
              onValueChange={setFrequency}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="cursor-pointer">Daily digest</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="cursor-pointer">Weekly roundup</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="cursor-pointer">Monthly highlights</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C9A14A] hover:bg-[#d9b15a] text-[#19273A] font-medium"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Subscribing...
              </>
            ) : (
              <>Subscribe</>
            )}
          </Button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>

        {isSuccess && (
          <div className="mt-6 p-4 bg-green-900/30 text-green-200 rounded-md flex items-center gap-2 max-w-md mx-auto">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>Thank you for subscribing! You'll receive our {frequency} newsletter at {email}.</span>
          </div>
        )}
      </div>
    </div>
  );
};