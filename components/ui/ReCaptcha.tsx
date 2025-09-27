import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  sitekey: string;
}

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onChange, sitekey }) => {
  return (
    <ReCAPTCHA
      sitekey={sitekey}
      onChange={onChange}
      theme="light"
      size="normal"
    />
  );
}; 