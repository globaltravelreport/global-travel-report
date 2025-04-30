"use client";

import { useState, useEffect } from "react";
import { Button } from "./button";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="text-lg font-semibold mb-2"
            >
              Cookie Consent
            </h2>
            <p
              id="cookie-consent-description"
              className="text-gray-600"
            >
              We use cookies to enhance your browsing experience, serve personalized
              content, and analyze our traffic. By clicking "Accept", you consent to
              our use of cookies.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleDecline}
              aria-label="Decline cookies"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              aria-label="Accept cookies"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 