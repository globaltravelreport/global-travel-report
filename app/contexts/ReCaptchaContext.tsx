'use client'

import React, { createContext, useContext } from 'react'

interface ReCaptchaContextType {
  executeReCaptcha: (action: string) => Promise<string>
}

const ReCaptchaContext = createContext<ReCaptchaContextType | undefined>(undefined)

// Google reCAPTCHA v2 site key
const SITE_KEY = '6LfuvR0rAAAAAKCLSAhbtRfyquD-xwRKnrWdRJJV'

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  const executeReCaptcha = async (action: string): Promise<string> => {
    // For now, just return a mock token
    console.log('Mock reCAPTCHA execution for action:', action)
    return 'mock-token'
  }

  return (
    <ReCaptchaContext.Provider value={{ executeReCaptcha }}>
      {children}
    </ReCaptchaContext.Provider>
  )
}

export function useReCaptcha() {
  const context = useContext(ReCaptchaContext)
  if (context === undefined) {
    throw new Error('useReCaptcha must be used within a ReCaptchaProvider')
  }
  return context
} 