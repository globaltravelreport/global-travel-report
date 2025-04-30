"use client";

import ReCAPTCHA from 'react-google-recaptcha';
import type { ReCAPTCHAProps } from 'react-google-recaptcha';

type Props = Pick<ReCAPTCHAProps, 'onChange' | 'sitekey'>;

export function ReCaptcha({ onChange, sitekey }: Props) {
  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        sitekey={sitekey}
        onChange={onChange}
      />
    </div>
  );
} 