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
    <div className={cn(
      "relative overflow-hidden bg-gradient-to-br from-[#19273A] to-[#2a3b52] text-white py-16 px-4 sm:px-8 rounded-xl shadow-xl border border-[#C9A14A]/10",
      className
    )} role="region" aria-label="Newsletter subscription">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A14A]/50 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A14A]/50 to-transparent"></div>

      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#C9A14A]/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#C9A14A]/5 blur-3xl"></div>

      <div className="absolute inset-0 bg-[url('/images/noise-pattern.png')] opacity-[0.03]"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-[#C9A14A]/10 rounded-full mb-6">
            <Mail className="h-10 w-10 text-[#C9A14A]" />
          </div>

          <h2 className="text-3xl font-bold sm:text-4xl mb-4 relative inline-block" id="newsletter-heading">
            <span className="relative z-10">{title}</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-[#C9A14A]/20 -z-10 transform -rotate-1"></span>
          </h2>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Left side benefits */}
          <div className="md:col-span-2 space-y-6 hidden md:block">
            <div className="flex items-start gap-3">
              <div className="bg-[#C9A14A]/10 p-2 rounded-full mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[#C9A14A]">Exclusive Travel Deals</h3>
                <p className="text-sm text-gray-400 mt-1">Get access to special offers and discounts not available elsewhere.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#C9A14A]/10 p-2 rounded-full mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[#C9A14A]">Insider Tips & Guides</h3>
                <p className="text-sm text-gray-400 mt-1">Discover hidden gems and expert travel advice from our editorial team.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-[#C9A14A]/10 p-2 rounded-full mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[#C9A14A]">Travel Community</h3>
                <p className="text-sm text-gray-400 mt-1">Join a community of passionate travelers sharing experiences and advice.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="md:col-span-3 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
            <div className="mb-6 relative">
              <Label htmlFor="email" className="block text-sm font-medium mb-2 text-[#C9A14A]">
                Email address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className={cn(
                    "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#C9A14A] focus:ring-[#C9A14A] pl-10",
                    emailError && "border-red-400 focus:border-red-400 focus:ring-red-400"
                  )}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error-default" : undefined}
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {emailError && (
                <p id="email-error-default" className="text-xs text-red-400 mt-1">{emailError}</p>
              )}
            </div>

            <div className="mb-6">
              <Label className="block text-sm font-medium mb-3 text-[#C9A14A]">
                How often would you like to hear from us?
              </Label>
              <RadioGroup
                value={frequency}
                onValueChange={setFrequency}
                className="grid grid-cols-3 gap-3"
              >
                <div className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border border-white/10 cursor-pointer transition-all",
                  frequency === "daily" ? "bg-[#C9A14A]/20 border-[#C9A14A]/50" : "hover:bg-white/5"
                )}>
                  <RadioGroupItem value="daily" id="daily" className="sr-only" />
                  <Label htmlFor="daily" className="cursor-pointer text-center">
                    <span className="block text-2xl mb-1">📰</span>
                    <span className={cn(
                      "font-medium",
                      frequency === "daily" ? "text-[#C9A14A]" : ""
                    )}>Daily</span>
                  </Label>
                </div>

                <div className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border border-white/10 cursor-pointer transition-all",
                  frequency === "weekly" ? "bg-[#C9A14A]/20 border-[#C9A14A]/50" : "hover:bg-white/5"
                )}>
                  <RadioGroupItem value="weekly" id="weekly" className="sr-only" />
                  <Label htmlFor="weekly" className="cursor-pointer text-center">
                    <span className="block text-2xl mb-1">🗓️</span>
                    <span className={cn(
                      "font-medium",
                      frequency === "weekly" ? "text-[#C9A14A]" : ""
                    )}>Weekly</span>
                  </Label>
                </div>

                <div className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border border-white/10 cursor-pointer transition-all",
                  frequency === "monthly" ? "bg-[#C9A14A]/20 border-[#C9A14A]/50" : "hover:bg-white/5"
                )}>
                  <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                  <Label htmlFor="monthly" className="cursor-pointer text-center">
                    <span className="block text-2xl mb-1">📅</span>
                    <span className={cn(
                      "font-medium",
                      frequency === "monthly" ? "text-[#C9A14A]" : ""
                    )}>Monthly</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#C9A14A] to-[#d9b15a] hover:from-[#d9b15a] hover:to-[#e9c16a] text-[#19273A] font-medium py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#19273A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe to Newsletter
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </>
              )}
            </Button>

            <p className="text-xs text-gray-400 mt-4 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>

        {isSuccess && (
          <div className="mt-8 p-5 bg-green-900/30 text-green-200 rounded-xl border border-green-500/20 flex items-start gap-3 max-w-2xl mx-auto animate-fadeIn">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-400" />
            <div>
              <h3 className="font-medium text-green-300 mb-1">Successfully Subscribed!</h3>
              <p>Thank you for subscribing! You'll receive our {frequency} newsletter at <span className="text-white font-medium">{email}</span>.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};