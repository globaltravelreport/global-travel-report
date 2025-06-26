'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const ReCaptchaDebug = () => {
  const [siteKey, setSiteKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Get the site key from the environment variable
    const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
    setSiteKey(key);
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-md mb-4">
      <h3 className="text-lg font-semibold mb-2">ReCAPTCHA Debug Info</h3>
      <Button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Hide Details' : 'Show Details'}
      </Button>
      
      {isVisible && (
        <div className="mt-4 space-y-2">
          <p><strong>Site Key:</strong> {siteKey ? siteKey : 'Not set'}</p>
          <p><strong>Site Key Length:</strong> {siteKey ? siteKey.length : 0} characters</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p>
            <strong>Google reCAPTCHA Script:</strong> 
            <a 
              href="https://www.google.com/recaptcha/api.js" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 underline"
            >
              Test Access
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
