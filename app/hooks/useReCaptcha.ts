declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

import { useState, useEffect } from 'react'
import { SITE_KEY, recaptchaLog, checkRecaptchaConfig } from '../utils/recaptcha'

interface ReCaptchaState {
  isLoaded: boolean
  error: string | null
}

export function useReCaptcha() {
  const [state, setState] = useState<ReCaptchaState>({
    isLoaded: false,
    error: null
  })

  useEffect(() => {
    // Check configuration on mount
    if (!checkRecaptchaConfig()) {
      setState(prev => ({ ...prev, error: 'Invalid reCAPTCHA configuration' }))
      return
    }

    recaptchaLog.info('Initializing reCAPTCHA')

    // Load the reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      recaptchaLog.success('Script loaded successfully')
      setState(prev => ({ ...prev, isLoaded: true }))
    }

    script.onerror = (error) => {
      const errorMessage = 'Failed to load reCAPTCHA script'
      recaptchaLog.error(errorMessage, error)
      setState(prev => ({ ...prev, error: errorMessage }))
    }

    document.head.appendChild(script)

    return () => {
      recaptchaLog.debug('Cleaning up reCAPTCHA script')
      document.head.removeChild(script)
    }
  }, [])

  const executeReCaptcha = async (action: string): Promise<string> => {
    if (state.error) {
      recaptchaLog.error('Cannot execute reCAPTCHA', state.error)
      throw new Error(state.error)
    }

    if (!state.isLoaded || !window.grecaptcha) {
      const error = 'reCAPTCHA not loaded'
      recaptchaLog.error(error)
      throw new Error(error)
    }

    try {
      recaptchaLog.info(`Executing reCAPTCHA for action: ${action}`)
      const token = await window.grecaptcha.execute(SITE_KEY, { action })
      recaptchaLog.success('Token generated successfully', { action, token: process.env.NODE_ENV === 'development' ? token : '[REDACTED]' })
      return token
    } catch (error) {
      recaptchaLog.error('Token generation failed', error)
      throw error
    }
  }

  return {
    executeReCaptcha,
    isLoaded: state.isLoaded,
    error: state.error
  }
} 