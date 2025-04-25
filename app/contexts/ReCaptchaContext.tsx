'use client'

import React, { createContext, useContext } from 'react'
import { logger } from '../utils/logger'

interface ReCaptchaContextType {
  executeReCaptcha: (action: string) => Promise<string>
}

const ReCaptchaContext = createContext<ReCaptchaContextType | undefined>(undefined)

// Google reCAPTCHA v2 site key and configuration
const RECAPTCHA_CONFIG = {
  SITE_KEY: '6LfuvR0rAAAAAKCLSAhbtRfyquD-xwRKnrWdRJJV',
  SCRIPT_URL: (key: string) => `https://www.google.com/recaptcha/api.js?render=${key}`
}

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  const executeReCaptcha = async (action: string): Promise<string> => {
    try {
      // Load the reCAPTCHA script dynamically
      const grecaptcha = await loadReCaptchaScript()
      
      // Execute reCAPTCHA with the site key
      const token = await grecaptcha.execute(RECAPTCHA_CONFIG.SITE_KEY, { action })
      return token
    } catch (error) {
      logger.error('Error executing reCAPTCHA:', error)
      throw new Error('Failed to execute reCAPTCHA')
    }
  }

  return (
    <ReCaptchaContext.Provider value={{ executeReCaptcha }}>
      {children}
    </ReCaptchaContext.Provider>
  )
}

// Helper function to load reCAPTCHA script
async function loadReCaptchaScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('reCAPTCHA can only be loaded in browser environment'))
      return
    }

    if ((window as any).grecaptcha) {
      resolve((window as any).grecaptcha)
      return
    }

    const script = document.createElement('script')
    script.src = RECAPTCHA_CONFIG.SCRIPT_URL(RECAPTCHA_CONFIG.SITE_KEY)
    script.async = true
    script.defer = true
    script.onload = () => resolve((window as any).grecaptcha)
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'))
    document.head.appendChild(script)
  })
}

export function useReCaptcha() {
  const context = useContext(ReCaptchaContext)
  if (!context) {
    throw new Error('useReCaptcha must be used within a ReCaptchaProvider')
  }
  return context
} 