
'use client';

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/utils/cn";
import { Mail } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { User } from "lucide-react";

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [honeypot, setHoneypot] = useState(''); // Honeypot field
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    if (errors.firstName) {
      setErrors(prev => ({ ...prev, firstName: '' }));
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    if (errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
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
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          frequency,
          honeypot, // Include honeypot field
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: 'Already subscribed',
<<<<<<< HEAD
            description: 'This email is already subscribed to our newsletter.'
=======
            description: 'This email is already subscribed to our newsletter.',
            icon: <AlertCircle className="h-5 w-5 text-orange-500" />
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
          });
        } else {
          throw new Error(data.error || 'Failed to subscribe');
        }
        return;
      }

      // Show success state
      setIsSuccess(true);

      toast({
        title: 'Successfully subscribed!',
<<<<<<< HEAD
        description: `Welcome ${firstName}! Please check your email for a confirmation link.`
=======
        description: `Welcome ${firstName}! Please check your email for a confirmation link.`,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
      });

      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
      setHoneypot('');
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: 'Subscription failed',
<<<<<<< HEAD
        description: 'There was a problem subscribing to the newsletter. Please try again.'
=======
        description: 'There was a problem subscribing to the newsletter. Please try again.',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different variants of the newsletter signup
  if (variant === 'inline') {
    return (
      <div className={cn("bg-gray-50 p-6 rounded-lg", className)} role="region" aria-label="Newsletter subscription">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field - hidden from users */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  placeholder="First name"
                  className={cn(errors.firstName && "border-red-500 focus:ring-red-500")}
                  aria-invalid={!!errors.firstName}
                  required
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleLastNameChange}
                  placeholder="Last name"
                  className={cn(errors.lastName && "border-red-500 focus:ring-red-500")}
                  aria-invalid={!!errors.lastName}
                  required
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className={cn(errors.email && "border-red-500 focus:ring-red-500")}
                aria-invalid={!!errors.email}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
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
            <span>Thank you for subscribing! Please check your email for confirmation.</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("", className)} role="region" aria-label="Newsletter subscription">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot field - hidden from users */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleFirstNameChange}
              placeholder="First name"
              className={cn("text-sm", errors.firstName && "border-red-500")}
              required
            />
            <Input
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleLastNameChange}
              placeholder="Last name"
              className={cn("text-sm", errors.lastName && "border-red-500")}
              required
            />
          </div>

          <Input
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            className={cn("text-sm", errors.email && "border-red-500")}
            required
          />

          <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>

        {isSuccess && (
          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Subscribed! Check your email.</span>
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
<<<<<<< HEAD
                <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
=======
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
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
<<<<<<< HEAD
                <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
=======
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
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
<<<<<<< HEAD
                <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
=======
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9A14A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
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
            {/* Honeypot field - hidden from users */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium mb-2 text-[#C9A14A]">
                  First Name
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    placeholder="John"
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#C9A14A] focus:ring-[#C9A14A] pl-10",
                      errors.firstName && "border-red-400 focus:border-red-400 focus:ring-red-400"
                    )}
                    aria-invalid={!!errors.firstName}
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium mb-2 text-[#C9A14A]">
                  Last Name
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={handleLastNameChange}
                    placeholder="Doe"
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#C9A14A] focus:ring-[#C9A14A] pl-10",
                      errors.lastName && "border-red-400 focus:border-red-400 focus:ring-red-400"
                    )}
                    aria-invalid={!!errors.lastName}
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                    errors.email && "border-red-400 focus:border-red-400 focus:ring-red-400"
                  )}
                  aria-invalid={!!errors.email}
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
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
<<<<<<< HEAD
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#19273A]" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
=======
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#19273A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe to Newsletter
<<<<<<< HEAD
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
=======
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </>
              )}
            </Button>

            <p className="text-xs text-gray-400 mt-4 text-center">
              We respect your privacy. Unsubscribe at any time. By subscribing, you agree to receive our newsletter.
            </p>
          </form>
        </div>

        {isSuccess && (
          <div className="mt-8 p-5 bg-green-900/30 text-green-200 rounded-xl border border-green-500/20 flex items-start gap-3 max-w-2xl mx-auto animate-fadeIn">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-400" />
            <div>
              <h3 className="font-medium text-green-300 mb-1">Successfully Subscribed!</h3>
              <p>Thank you {firstName} for subscribing! You'll receive our {frequency} newsletter at <span className="text-white font-medium">{email}</span>. Please check your email for a confirmation link.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
