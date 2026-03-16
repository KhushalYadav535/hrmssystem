'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  action?: string;
}

/**
 * US-A1-03: Google reCAPTCHA v3 Integration
 * Invisible CAPTCHA that runs in the background
 */
export default function ReCaptcha({ onVerify, onError, action = 'login' }: ReCaptchaProps) {
  const scriptLoaded = useRef(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  useEffect(() => {
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return;
    }

    // Load reCAPTCHA script
    if (!scriptLoaded.current && !window.grecaptcha) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoaded.current = true;
      };
      script.onerror = () => {
        if (onError) onError('Failed to load reCAPTCHA script');
      };
      document.head.appendChild(script);
    } else if (window.grecaptcha) {
      scriptLoaded.current = true;
    }
  }, [siteKey, onError]);

  const executeRecaptcha = async (): Promise<string | null> => {
    if (!siteKey) {
      return null;
    }

    if (!window.grecaptcha || !scriptLoaded.current) {
      // Wait for script to load
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.grecaptcha && scriptLoaded.current) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 5000);
      });
    }

    if (!window.grecaptcha) {
      if (onError) onError('reCAPTCHA not loaded');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error: any) {
      if (onError) onError(error.message || 'reCAPTCHA execution failed');
      return null;
    }
  };

  // Expose execute function via ref or return it
  return { executeRecaptcha };
}

// Hook version for easier use
export function useReCaptcha(action: string = 'login') {
  const execute = async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return null;
    }

    // Ensure script is loaded
    if (!window.grecaptcha) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        script.onload = async () => {
          try {
            const token = await window.grecaptcha.execute(siteKey, { action });
            resolve(token);
          } catch (error) {
            console.error('reCAPTCHA error:', error);
            resolve(null);
          }
        };
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
      });
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  };

  return { execute };
}
