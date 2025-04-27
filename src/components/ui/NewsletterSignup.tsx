"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { ReCaptcha } from "./ReCaptcha";

interface NewsletterSignupProps {
  className?: string;
}

export function NewsletterSignup({ className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification");
      setStatus("error");
      return;
    }

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setStatus("error");
      return;
    }

    try {
      // In a real app, this would be an API call
      console.log("Subscribing email:", { email, recaptchaToken });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus("success");
      setEmail("");
      setRecaptchaToken("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className={`bg-blue-50 rounded-2xl p-8 ${className}`}>
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
          onVerify={setRecaptchaToken}
          onError={(error) => {
            setError(error.message);
            setStatus("error");
          }}
          className="mb-4"
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