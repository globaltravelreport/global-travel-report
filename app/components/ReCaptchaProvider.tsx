'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export default function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  if (!recaptchaKey) {
    console.error('Warning: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set in environment variables');
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaKey || 'missing-key'}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
} 