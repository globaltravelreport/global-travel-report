"use client";

import ReCAPTCHA from 'react-google-recaptcha';
import type { ReCAPTCHAProps } from 'react-google-recaptcha';

type Props = Pick<ReCAPTCHAProps, 'onChange'>;

export function ReCaptcha({ onChange }: Props) {
  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
        onChange={onChange}
      />
    </div>
  );
} 