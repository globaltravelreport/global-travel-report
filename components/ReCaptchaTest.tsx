'use client';

import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '@/components/ui/button';

export const ReCaptchaTest = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleReCaptchaChange = (value: string | null) => {
    setToken(value);
    setError(null);
  };

  const handleVerify = async () => {
    if (!token) {
      setError('Please complete the reCAPTCHA first');
      return;
    }

    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setError('ReCAPTCHA verification successful!');
      } else {
        setError(`ReCAPTCHA verification failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md mb-4">
      <h3 className="text-lg font-semibold mb-2">ReCAPTCHA Test</h3>
      <Button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide Test' : 'Show Test'}
      </Button>
      
      {isVisible && (
        <div className="mt-4 space-y-4">
          <p>This is a direct test of the ReCAPTCHA component:</p>
          
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey="6LfQQGApAAAAALZkVb_3EQlZNKlO-e3-9FK1lz4G"
              onChange={handleReCaptchaChange}
            />
          </div>
          
          <div className="flex justify-center">
            <Button onClick={handleVerify} disabled={!token}>
              Verify Token
            </Button>
          </div>
          
          {error && (
            <div className={`p-2 rounded ${error.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
