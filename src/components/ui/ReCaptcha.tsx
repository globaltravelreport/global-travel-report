"use client";

import ReCAPTCHA from 'react-google-recaptcha';
import type { ReCAPTCHAProps } from 'react-google-recaptcha';

type Props = Pick<ReCAPTCHAProps, 'onChange' | 'sitekey'>;

export function ReCaptcha({ onChange, sitekey }: Props) {
  // Use the sitekey from props or fallback to config
  const recaptchaSiteKey = sitekey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        sitekey={recaptchaSiteKey}
        onChange={onChange}
      />
    </div>
  );
}