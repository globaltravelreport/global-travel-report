"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onError: (error: Error) => void;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, options: any) => number;
      reset: (widgetId: number) => void;
    };
  }
}

export function ReCaptcha({ onVerify, onError, className }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    const loadReCaptcha = async () => {
      try {
        if (!window.grecaptcha) {
          const script = document.createElement("script");
          script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        if (containerRef.current && !widgetIdRef.current) {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            callback: onVerify,
            "error-callback": () => onError(new Error("reCAPTCHA verification failed")),
          });
        }
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Failed to load reCAPTCHA"));
      }
    };

    loadReCaptcha();

    return () => {
      if (widgetIdRef.current) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    };
  }, [onVerify, onError]);

  return (
    <div
      ref={containerRef}
      className={cn("flex justify-center", className)}
      aria-label="reCAPTCHA verification"
    />
  );
} 